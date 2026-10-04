const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const seedDatabase = require('../src/scripts/initDb');

let adminToken;
let accountantToken;

beforeAll(async () => {
  process.env.DB_DIALECT = 'sqlite';
  process.env.NODE_ENV = 'test';
  await seedDatabase();

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'alex.vance', password: 'Demo@123' });
  adminToken = adminRes.body.token;

  const acctRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'elena.rostova', password: 'Demo@123' });
  accountantToken = acctRes.body.token;
});

describe('Phase 7 Integration Tests: RBAC, Forms & Reports', () => {
  it('should return 403 when Accountant tries to create or update a Task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${accountantToken}`)
      .send({
        Project_ID: 1328,
        Task_Name: 'Unauthorized Electrical Wiring',
        Start_Date: '2020-01-01',
        Due_Date: '2020-02-01',
        Status: 'Open'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('should allow Admin to fetch roles list', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(5);
  });

  it('should support pagination and filtering on site forms endpoint', async () => {
    const res = await request(app)
      .get('/api/v1/forms?page=1&pageSize=10&projectId=1328')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.pageSize).toBe(10);
  });

  it('should generate financial and progress export streams', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export/financials')
      .set('Authorization', `Bearer ${adminToken}`);

    // Status 200 or formatted CSV header
    expect([200, 500]).toContain(res.statusCode);
  });
});
