const nodemailer = require('nodemailer');
const logger = require('../shared/utils/logger');

/**
 * Creates a Nodemailer transporter from env variables.
 * Returns null if SMTP is not configured (graceful degradation).
 */
function createMailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn('[Mailer] SMTP not configured — email dispatch disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 587,
    secure: parseInt(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    from: SMTP_FROM || SMTP_USER,
  });
}

/**
 * Sends a plain-text + HTML email notification.
 * Silently logs and continues on failure — email is best-effort.
 */
async function sendEmail(transporter, to, subject, html) {
  if (!transporter || !to) return;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ''), // Plain text fallback
      html,
    });
    logger.info(`[Mailer] Email sent to ${to} — ${subject}`);
  } catch (err) {
    logger.error(`[Mailer] Failed to send email to ${to}`, { error: err.message });
  }
}

/**
 * Build an HTML email template for a notification.
 */
function buildEmailHtml(title, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #1e40af; padding: 24px 32px; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; }
        .body { padding: 32px; color: #374151; font-size: 15px; line-height: 1.6; }
        .footer { padding: 16px 32px; background: #f9fafb; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🏢 Society Management System</h1></div>
        <div class="body">
          <h2>${title}</h2>
          <p>${message}</p>
        </div>
        <div class="footer">This is an automated notification. Please do not reply to this email.</div>
      </div>
    </body>
    </html>
  `;
}

module.exports = function setupNotificationWorker(container) {
  const queueService = container.get('queueService');
  const notificationsService = container.get('notificationsService');
  const prisma = container.get('prisma');

  // Initialize mailer once at startup
  const transporter = createMailTransport();

  queueService.createWorker('notifications', async (job) => {
    const { userId, title, message, type } = job.data;

    logger.info(`[Worker] Processing notification for user ${userId}: ${title}`);

    // Step 1: Save in-app notification to the database
    await notificationsService.createNotification(userId, title, message, type);

    // Step 2: Fetch user's email to send an email notification
    if (transporter) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user?.email) {
          const html = buildEmailHtml(title, message);
          await sendEmail(transporter, user.email, `[Society] ${title}`, html);
        }
      } catch (err) {
        // Log but do NOT rethrow — in-app notification already saved, email is best-effort
        logger.error(`[Worker] Email fetch/send failed for user ${userId}`, { error: err.message });
      }
    }

    return { success: true, emailSent: !!transporter };
  });

  logger.info('[Worker] Notification worker ready — DB + Email dispatch enabled.');
};

