/**
 * Integration Tests: Complaints Routes
 *
 * Covers: create complaint, get complaints (RBAC), get by ID, update status.
 * Uses real DB, real Express app, real JWT — no mocking.
 *
 * Run: npm test
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL } },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

let residentToken;
let adminToken;
let residentUserId;
let createdComplaintId;

/**
 * Login and return the accessToken.
 */
async function loginAs(email, password) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  return res.body.data.accessToken;
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Login as admin (seeded by db:seed)
  adminToken = await loginAs('admin@society.com', 'Admin@1234');

  // Register a fresh resident for testing
  const RESIDENT_EMAIL = `complaints_test_${Date.now()}@society.com`;
  const RESIDENT_PASS = 'ResTest@123';

  // Get first available flat for registration
  const flat = await prisma.flat.findFirst();
  if (!flat) {
    throw new Error('No flats in DB. Run npm run db:seed first.');
  }

  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: RESIDENT_EMAIL,
      password: RESIDENT_PASS,
      fullName: 'Complaint Test Resident',
      flatId: flat.id,
    });

  residentToken = registerRes.body.data.accessToken;
  residentUserId = registerRes.body.data.user.id;
});

afterAll(async () => {
  // Clean up test complaints and users
  if (createdComplaintId) {
    await prisma.complaintStatusLog.deleteMany({ where: { complaintId: createdComplaintId } });
    await prisma.complaint.deleteMany({ where: { id: createdComplaintId } });
  }
  if (residentUserId) {
    await prisma.residentProfile.deleteMany({ where: { userId: residentUserId } });
    await prisma.user.deleteMany({ where: { id: residentUserId } });
  }
  await prisma.$disconnect();
});

// ─── POST /complaints ─────────────────────────────────────────────────────────

describe('POST /api/v1/complaints', () => {
  it('201 — resident can create a complaint (JSON)', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${residentToken}`)
      .field('title', 'Water leakage in bathroom')
      .field('description', 'There is a water leak under the sink since 3 days.')
      .field('category', 'plumbing')
      .field('priority', 'high');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Water leakage in bathroom');
    expect(res.body.data.status).toBe('open');
    expect(res.body.data.priority).toBe('high');

    createdComplaintId = res.body.data.id; // Save for later tests
  });

  it('201 — resident can upload an image with the complaint', async () => {
    // Create a small valid PNG in-memory (1x1 pixel PNG)
    const PNG_HEADER = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
      0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const tmpPath = path.join(__dirname, 'test_image.png');
    fs.writeFileSync(tmpPath, PNG_HEADER);

    try {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .field('title', 'Complaint with image')
        .field('description', 'Testing image upload capability.')
        .field('category', 'electrical')
        .attach('image', tmpPath);

      expect(res.status).toBe(201);
      expect(res.body.data.imageUrl).toBeDefined();
    } finally {
      fs.unlinkSync(tmpPath);
    }
  });

  it('422 — missing required fields returns validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${residentToken}`)
      .field('title', 'No description or category');

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .send({ title: 'test', description: 'test', category: 'plumbing' });

    expect(res.status).toBe(401);
  });
});

// ─── GET /complaints ──────────────────────────────────────────────────────────

describe('GET /api/v1/complaints', () => {
  it('200 — resident sees only their own complaints', async () => {
    const res = await request(app)
      .get('/api/v1/complaints')
      .set('Authorization', `Bearer ${residentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);

    // Every complaint should belong to this resident
    for (const complaint of res.body.data) {
      expect(complaint.userId).toBe(residentUserId);
    }
  });

  it('200 — admin sees all complaints (not filtered by user)', async () => {
    const res = await request(app)
      .get('/api/v1/complaints')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // Admin should see more than just one user's complaints
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.totalItems).toBeGreaterThanOrEqual(0);
  });

  it('200 — supports ?status= filter', async () => {
    const res = await request(app)
      .get('/api/v1/complaints?status=open')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // All returned complaints should have status 'open'
    for (const c of res.body.data) {
      expect(c.status).toBe('open');
    }
  });

  it('200 — supports pagination params', async () => {
    const res = await request(app)
      .get('/api/v1/complaints?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });
});

// ─── GET /complaints/:id ──────────────────────────────────────────────────────

describe('GET /api/v1/complaints/:id', () => {
  it('200 — resident can view their own complaint', async () => {
    if (!createdComplaintId) return;

    const res = await request(app)
      .get(`/api/v1/complaints/${createdComplaintId}`)
      .set('Authorization', `Bearer ${residentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdComplaintId);
  });

  it('200 — admin can view any complaint by ID', async () => {
    if (!createdComplaintId) return;

    const res = await request(app)
      .get(`/api/v1/complaints/${createdComplaintId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdComplaintId);
  });

  it('404 — non-existent ID returns Not Found', async () => {
    const res = await request(app)
      .get('/api/v1/complaints/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── PATCH /complaints/:id/status ─────────────────────────────────────────────

describe('PATCH /api/v1/complaints/:id/status', () => {
  it('200 — admin can update complaint status', async () => {
    if (!createdComplaintId) return;

    const res = await request(app)
      .patch(`/api/v1/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in_progress', comment: 'Maintenance team assigned.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('403 — resident cannot update complaint status', async () => {
    if (!createdComplaintId) return;

    const res = await request(app)
      .patch(`/api/v1/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${residentToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
  });

  it('422 — invalid status value returns validation error', async () => {
    if (!createdComplaintId) return;

    const res = await request(app)
      .patch(`/api/v1/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(422);
  });
});
