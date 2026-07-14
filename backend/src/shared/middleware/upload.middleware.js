const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MulterError } = require('multer');

// file-type v19 is a pure ESM package — use dynamic import inside async context
let fileTypeFromBuffer;
(async () => {
  const ft = await import('file-type');
  fileTypeFromBuffer = ft.fileTypeFromBuffer;
})();

// Allowed image MIME types (both the declaration AND the magic bytes must match)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * First layer: MIME type check on declared Content-Type header.
 * Fast, but can be spoofed.
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only image files are allowed (jpeg, png, gif, webp, bmp)'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

/**
 * Second layer: magic-byte validation after multer saves the file.
 * Reads the actual binary bytes to confirm the file is truly an image,
 * regardless of what the Content-Type header claims.
 *
 * Usage: apply AFTER upload.single('image')
 *   router.post('/', upload.single('image'), validateImageBytes, ...)
 */
const validateImageBytes = async (req, res, next) => {
  if (!req.file) return next(); // No file uploaded — let route handle it

  try {
    // Only read the first 4100 bytes (enough for magic number detection)
    const fd = fs.openSync(req.file.path, 'r');
    const buffer = Buffer.alloc(4100);
    const bytesRead = fs.readSync(fd, buffer, 0, 4100, 0);
    fs.closeSync(fd);

    // If file-type not loaded yet (race condition on cold start), skip deep check
    if (!fileTypeFromBuffer) {
      return next();
    }

    const detected = await fileTypeFromBuffer(buffer.slice(0, bytesRead));

    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      // Delete the already-saved file — don't leave malicious content on disk
      fs.unlink(req.file.path, () => {});
      const { BadRequestError } = require('../errors');
      return next(new BadRequestError(
        `File content does not match an allowed image type. Detected: ${detected?.mime || 'unknown'}`
      ));
    }

    next();
  } catch (err) {
    // If we can't read the file, reject it
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

module.exports = upload;
module.exports.validateImageBytes = validateImageBytes;

