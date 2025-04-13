const request = require('supertest');
const app = require('../src/server');
const { connect, clearDatabase, closeDatabase } = require('./setup');

describe('Input Validation for Auth Endpoints', () => {
  beforeAll(async () => {
    await connect();
  });
  
  afterEach(async () => {
    await clearDatabase();
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  it('should return 400 for invalid email during registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      password: 'Password123'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });
  it('should return 400 for invalid email during login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'invalid-email',
      password: 'Password123'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });
  
  it('should return 400 for too short password during registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      password: '123'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });
  
  it('should register user for valid input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      password: 'Password123'
    });
    expect(res.statusCode).toEqual(201);
  });
});