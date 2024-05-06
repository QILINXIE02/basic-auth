'use strict';

const base64 = require('base-64');
const { Users } = require('../models');
const bcrypt = require('bcrypt');

module.exports = async function basicAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Authorization header is required');
  }

  const encodedCreds = req.headers.authorization.split(' ')[1];
  const decodedCreds = base64.decode(encodedCreds);
  const [username, password] = decodedCreds.split(':');

  try {
    const user = await Users.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      req.user = user;
      next();
    } else {
      throw new Error('Invalid Password');
    }
  } catch (error) {
    res.status(403).send('Invalid Login');
  }
};
