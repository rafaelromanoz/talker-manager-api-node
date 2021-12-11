const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { validateEmail, validatePass } = require('../middlewares/validateEmailPassword');

const loginController = express.Router();
const app = express();

app.use(bodyParser.json());

loginController.post('/', validateEmail, validatePass, (req, res) => {
  const generateCripto = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token: generateCripto });
});

module.exports = loginController;
