const request = require('supertest');
const app = require('../src/app');
const seedDatabase = require('../src/scripts/initDb');

let adminToken;
let supervisorToken;

beforeAll(async () => {
  process.env.DB_DIALECT = 'sqlite';
  process.env.NODE_ENV = 'test';
  await seedDatabase();

  // Login as Admin
  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'alex.vance', password: 'Demo@123' });
  adminToken = adminLogin.body.token;

  // Login as Site Supervisor
  const supLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'marcus.brody', password: 'Demo@123' });
  supervisorToken = supLogin.body.token;
});

describe('Projects, Materials & Summary API Tests', () => {
  it('should list all projects for Admin', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
    expect(res.body.projects[0]).toHaveProperty('stats');
  });

  it('should return complete project summary including budget, task, and milestone metrics', async () => {
    const res = await request(app)
      .get('/api/v1/projects/1328/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('financials');
    expect(res.body.summary).toHaveProperty('tasks');
    expect(res.body.summary).toHaveProperty('milestones');
    expect(res.body.summary).toHaveProperty('inventory');
  });

  it('should auto-compute Total_Cost when creating a Material', async () => {
    const res = await request(app)
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        Project_ID: 1328,
        Material_Name: 'Test Structural Bolts',
        Quantity: 200,
        Unit: 'pcs',
        Unit_Cost: 15.50,
        Reorder_Level: 25
      });

    expect(res.statusCode).toBe(201);
    expect(parseFloat(res.body.material.Total_Cost)).toBe(3100.00);
    expect(res.body.material.isLowStock).toBe(false);
  });

  it('should flag isLowStock = true when Quantity is <= threshold (10)', async () => {
    const res = await request(app)
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        Project_ID: 1328,
        Material_Name: 'Emergency Backup Hydraulic Valves',
        Quantity: 4,
        Unit: 'units',
        Unit_Cost: 500.00,
        Reorder_Level: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.material.isLowStock).toBe(true);
  });

  it('should prevent Site Supervisor from deleting a project (RBAC check)', async () => {
    const res = await request(app)
      .delete('/api/v1/projects/1328')
      .set('Authorization', `Bearer ${supervisorToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});
