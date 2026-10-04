const request = require('supertest');
const app = require('../src/app');
const seedDatabase = require('../src/scripts/initDb');

beforeAll(async () => {
  process.env.DB_DIALECT = 'sqlite';
  process.env.NODE_ENV = 'test';
  await seedDatabase();
});

describe('Authentication & RBAC Tests', () => {
  it('should successfully log in an Admin user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'alex.vance@buildcorp.com',
        password: 'Demo@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('Role_Name', 'Admin');
    expect(res.body.user.Username).toBe('alex.vance');
  });

  it('should reject login with an incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'alex.vance@buildcorp.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should fetch the profile of the currently logged-in user', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'sarah.jenkins',
        password: 'Demo@123'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.Username).toBe('sarah.jenkins');
    expect(meRes.body.user.role.Role_Name).toBe('Project Manager');
  });

  it('should block unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.statusCode).toBe(401);
  });
});
