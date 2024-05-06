'use strict';

const basicAuth = require('../auth/middleware/basic');
const { Users } = require('../auth/models');
const bcrypt = require('bcrypt');

describe('Basic Authentication Middleware', () => {
  let user;

  beforeAll(async () => {
    user = await Users.create({ username: 'testUser', password: await bcrypt.hash('password123', 10) });
  });

  it('should successfully authenticate with valid credentials', async () => {
    const req = {
      headers: {
        authorization: `Basic ${Buffer.from('testUser:password123').toString('base64')}`
      }
    };
    const res = {};
    const next = jest.fn();

    await basicAuth(req, res, next);
    expect(req.user.username).toBe('testUser');
    expect(next).toHaveBeenCalled();
  });

  it('should fail with invalid credentials', async () => {
    const req = {
      headers: {
        authorization: `Basic ${Buffer.from('testUser:incorrectPassword').toString('base64')}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const next = jest.fn();

    await basicAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Invalid Login');
    expect(next).not.toHaveBeenCalled();
  });

  it('should fail with missing authorization header', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const next = jest.fn();

    await basicAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Authorization header is required');
    expect(next).not.toHaveBeenCalled();
  });
});
