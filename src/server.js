'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
let sequelize;

// Check if DATABASE_URL environment variable is defined
if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

// Create a Sequelize instance only if DATABASE_URL is defined
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, { logging: process.env.NODE_ENV !== 'test' });

  // Define the User model if sequelize is initialized
  const Users = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
}

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Signup route to create a new user (handle if sequelize is not defined)
app.post('/signup', async (req, res) => {
  if (!sequelize) {
    return res.status(500).send('Database connection is not available.');
  }

  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const record = await Users.create(req.body);
    res.status(201).json(record); // Use 201 for resource creation
  } catch (e) {
    console.error('Error creating user:', e);
    res.status(500).send('Error creating user');
  }
});

// Signin route to login with username and password (handle if sequelize is not defined)
app.post('/signin', async (req, res) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).send('Authorization header is required');
    }

    // Split authorization header if it exists
    let basicHeaderParts = req.headers.authorization.split(' ');
    let encodedString = basicHeaderParts.pop();
    let decodedString = base64.decode(encodedString);
    let [username, password] = decodedString.split(':');

    // Proceed with authentication logic
    const user = await Users.findOne({ where: { username: username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      res.status(200).json(user);
    } else {
      throw new Error('Invalid User');
    }
  } catch (error) {
    res.status(403).send('Invalid Login');
  }
});


// Sync the database and start the server if sequelize is initialized
if (sequelize) {
  sequelize.sync()
    .then(() => {
      app.listen(3000, () => console.log('Server up and running'));
    }).catch(e => {
      console.error('Could not start server:', e.message);
    });
}

module.exports = { app, sequelize };
