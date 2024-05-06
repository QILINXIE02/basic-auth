'use strict';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../server').sequelize;
const bcrypt = require('bcrypt');

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  },
  instanceMethods: {
    validPassword: async function (password) {
      return await bcrypt.compare(password, this.password);
    }
  }
});

module.exports = User;
