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

router.post('/signin', basicAuth, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
