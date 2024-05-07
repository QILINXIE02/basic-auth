'use strict';

const base64 = require('base-64');
const { Users } = require('../models');
const bcrypt = require('bcrypt');

module.exports = async function basicAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  const encodedCreds = req.headers.authorization.split(' ')[1];
  const decodedCreds = base64.decode(encodedCreds);
  const [username, password] = decodedCreds.split(':');

  try {
    const user = await Users.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      req.user = user; // Set the user object on the request for later use
      next();
    } else {
      return res.status(401).json({ error: 'Invalid Password' });
    }
  } catch (error) {
    console.error('Error in basicAuth middleware:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
