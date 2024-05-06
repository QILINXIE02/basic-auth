'use strict';

const base64 = require('base-64');
const { sequelize } = require('../src/server');
const { Users } = require('../src/auth/models');
const { app } = require('../src/server');


describe('Authentication API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /signup', () => {
    it('should create a new user when POST /signup is called', async () => {
      const response = await app.post('/signup').send({
        username: 'testuser',
        password: 'testpassword'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
    });
  });

  describe('POST /signin', () => {
    let authHeader;

    beforeAll(async () => {
      // Create a user for signin test
      await Users.create({
        username: 'testuser',
        password: '$2b$10$IJtAEpkTb8f4MtZMZRMhW.HC5m1LnvwoPNLpWsXo1Jn4qF0NhCSjy'
      });

      // Encode basic auth credentials
      const credentials = 'testuser:testpassword';
      authHeader = 'Basic ' + base64.encode(credentials);
    });

    it('should login successfully when POST /signin is called with correct credentials', async () => {
      const response = await app.post('/signin').set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
    });

    it('should return 403 Forbidden when POST /signin is called with incorrect credentials', async () => {
      const invalidAuthHeader = 'Basic ' + base64.encode('testuser:wrongpassword');
      const response = await app.post('/signin').set('Authorization', invalidAuthHeader);

      expect(response.status).toBe(403);
      expect(response.text).toBe('Invalid Login');
    });

    it('should return 401 Unauthorized when POST /signin is called without credentials', async () => {
      const response = await app.post('/signin');

      expect(response.status).toBe(401);
      expect(response.text).toBe('Authorization header is required');
    });
  });
});
