'use strict';

// 3rd Party Resources
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');

// Prepare the express app
const app = express();

// Process JSON input and put the data on req.body
app.use(express.json());

const environment = process.env.NODE_ENV;
const testOrProduction = environment === 'test' || environment === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: testOrProduction ? false : console.log,
});

// Process FORM input and put the data on req.body
app.use(express.urlencoded({ extended: true }));

// Create a Sequelize model
const Users = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Signup Route -- create a new user
app.post('/signup', async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const record = await Users.create(req.body);
    res.status(200).json(record);
  } catch (e) {
    res.status(403).send('Error Creating User');
  }
});

// Signin Route -- login with username and password
app.post('/signin', async (req, res) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
      throw new Error('Authorization header missing or invalid');
    }

    // Extract the base64 encoded credentials from the Authorization header
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = base64.decode(base64Credentials);

    // Extract the username and password from the credentials
    const [username, password] = credentials.split(':');

    // Find the user in the database by username
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      throw new Error('User not found');
    }

    // Compare the plaintext password with the encrypted password in the database
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error('Invalid password');
    }

    // Return user data if authentication is successful
    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(403).send('Invalid Login');
  }
});

// Make sure our tables are created and start the HTTP server
sequelize.sync()
  .then(() => {
    app.listen(3000, () => console.log('Server up'));
  })
  .catch((error) => {
    console.error('Could not start server:', error.message);
  });

module.exports = app;
