const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');
const dbConfig = require('../config/secret');

module.exports = {
  async CreateUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().min(5).max(10).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    const { error, value } = schema.validate(req.body); // Use schema.validate() instead of Joi.validate()
    if (error) {
      return res.status(400).json({ msg: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email),
    });
    if (userEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    });
    if (userName) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res.status(400).json({ message: 'Error hashing password' });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash,
      };
      User.create(body)
        .then((user) => {
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: '5h',
          });
          res.cookie('auth', token);
          res
            .status(201)
            .json({ message: 'User created successfully', user, token });
        })
        .catch((err) => {
          res.status(500).json({ message: 'Error occurred' });
        });
    });
  },

  async LoginUser(req, res) {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: 'No empty fields allowed' });
    }

    await User.findOne({ username: Helpers.firstUpper(req.body.username) })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'Username not found' });
        }

        return bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (!result) {
              return res.status(500).json({ message: 'Password is incorrect' });
            }
            const token = jwt.sign({ data: user }, dbConfig.secret, {
              expiresIn: '5h',
            });
            res.cookie('auth', token);
            return res
              .status(200)
              .json({ message: 'Login successful', user, token });
          });
      })
      .catch((err) => {
        return res.status(500).json({ message: 'Error occurred' });
      });
  },
};
