'use strict';

const express = require('express');
const { Users } = require('./models');
const basicAuth = require('./middleware/basic');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const user = await Users.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).send('Error Creating User');
  }
});

router.post('/signin', basicAuth, async (req, res) => {
  try {
    // If basicAuth middleware has already added user to request object
    if (req.user) {
      res.status(200).json(req.user);
    } else {
      // If user not found in basicAuth middleware, return error
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(403).send('Invalid Login');
  }
});

module.exports = router;
