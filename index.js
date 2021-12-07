const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const rescue = require('express-rescue');
const crypto = require('crypto');
const { validateEmail, validatePass } = require('./utils/validateEmailPassword');
const { validateAge, validateTalk, validateEmai, 
  validateTalkKeys, validateToken } = require('./utils/validatePost');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// req1

app.get('/talker', rescue(async (_req, res) => {
  const data = await fs.readFile('./talker.json', 'utf-8');
  const toJson = JSON.parse(data);
  if (!data) {
    return res.status(200).send([]);
  }
  res.status(200).json(toJson);
}));

// req2

app.get('/talker/:id', rescue(async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile('./talker.json', 'utf8');
  const toJS = JSON.parse(data);
  if (!toJS.some((talk) => talk.id === parseInt(id, 10))) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  const talkerFind = toJS.find((talker) => talker.id === parseInt(id, 10));
  return res.status(200).json(talkerFind);
}));

// req3
app.post('/login', validateEmail, validatePass, (req, res) => {
  const generateCripto = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token: generateCripto });
});

// req4

app.post('/talker', validateToken, validateEmai, validateTalk, validateTalkKeys, validateAge,
 async (req, res) => {
  const { id, name, age } = req.body;
  const { watchedAt, rate } = req.body.talk; 
  const obj = {
    id,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  const data = await fs.readFile('./talker.json', 'utf8');
  const toJS = JSON.parse(data);
  toJS.push(obj);
  const toJSON = JSON.stringify(toJS);
  await fs.writeFile('./talker.json', toJSON);
  return res.status(201).json(obj);
});

app.listen(PORT, () => {
  console.log('Online');
});
