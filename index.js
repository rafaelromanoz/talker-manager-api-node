const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const rescue = require('express-rescue');
const crypto = require('crypto');
const { validateEmail, validatePass } = require('./middlewares/validateEmailPassword');
const { validateAge, validateTalk, validateEmai, 
  validateTalkKeys, validateToken } = require('./middlewares/validatePost');
const { searchId, searchIndex } = require('./middlewares/auxiliares');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const TALKERJSON = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// req 7
app.get('/talker/search', validateToken, async (req, res) => {
  const { q } = req.query;
  const data = await fs.readFile(TALKERJSON, 'utf8');
  const toJS = JSON.parse(data);
  const filterSearch = toJS.filter((talker) => talker.name.includes(q));
  return res.status(200).send(filterSearch);
});

// req1
app.get('/talker', rescue(async (_req, res) => {
  const data = await fs.readFile(TALKERJSON, 'utf-8');
  const toJson = JSON.parse(data);
  if (!data) {
    return res.status(200).send([]);
  }
  res.status(200).json(toJson);
}));

// req2

app.get('/talker/:id', rescue(async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(TALKERJSON, 'utf8');
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

app.post('/talker', validateToken, validateEmai, validateTalkKeys, validateTalk, validateAge,
 async (req, res) => {
  const { name, age } = req.body;
  const { watchedAt, rate } = req.body.talk; 
  const data = await fs.readFile(TALKERJSON, 'utf8');
  const toJS = JSON.parse(data);
  const obj = {
    id: toJS.length + 1,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  toJS.push(obj);
  const toJSON = JSON.stringify(toJS);
  await fs.writeFile('./talker.json', toJSON);
  return res.status(201).json(obj);
});

// req 5

app.put('/talker/:id', validateToken, validateEmai, validateTalkKeys, 
validateTalk, validateAge, async (req, res) => {
  const { name, age } = req.body;
  const { id } = req.params; 
  const { watchedAt, rate } = req.body.talk;
  const data = await fs.readFile(TALKERJSON, 'utf8');
  const toJS = JSON.parse(data);
  const obj = {
    id: searchId(toJS, id).id,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  toJS[searchIndex(toJS, id)] = { ...obj };
  const toJSON = JSON.stringify(toJS);
  await fs.writeFile(TALKERJSON, toJSON);
  return res.status(200).json(obj);
});

// req 6

app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params; 
  const data = await fs.readFile(TALKERJSON, 'utf8');
  const toJS = JSON.parse(data);
  const deleteTalker = toJS.filter((talker) => talker.id !== parseInt(id, 10));
  const toJSON = JSON.stringify(deleteTalker);
  await fs.writeFile(TALKERJSON, toJSON);
  return res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
});

app.listen(PORT, () => {
  console.log('Online');
});
