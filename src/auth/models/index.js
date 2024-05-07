// src/auth/models/index.js

const { Sequelize } = require('sequelize');
const UserModel = require('./users-model');

const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: process.env.NODE_ENV !== 'test' });

const User = UserModel(sequelize);

module.exports = {
  User,
  sequelize, // Export the Sequelize instance as well
};
