const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const rescue = require('express-rescue');
const { validateAge, validateTalk, validateEmai, 
  validateTalkKeys, validateToken } = require('../middlewares/validatePost');
const { searchId, searchIndex } = require('../middlewares/auxiliares');

const TALKER_JSON = './talker.json';

const talkerController = express.Router();

app.use(bodyParser.json());

// req 7
talkerController.get('/search', validateToken, async (req, res) => {
  const { q } = req.query;
  const data = await fs.readFile(TALKER_JSON, 'utf8');
  const toJS = JSON.parse(data);
  const filterSearch = toJS.filter((talker) => talker.name.includes(q));
  return res.status(200).send(filterSearch);
});

// req1
talkerController.get('/', rescue(async (_req, res) => {
  const data = await fs.readFile(TALKER_JSON, 'utf-8');
  console.log(data);
  const toJson = JSON.parse(data);
  if (!data) {
    return res.status(200).send([]);
  }
  res.status(200).json(toJson);
}));

// req2

talkerController.get('/:id', rescue(async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(TALKER_JSON, 'utf8');
  const toJS = JSON.parse(data);
  if (!toJS.some((talk) => talk.id === parseInt(id, 10))) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  const talkerFind = toJS.find((talker) => talker.id === parseInt(id, 10));
  return res.status(200).json(talkerFind);
}));

// req4

talkerController.post('/', validateToken, validateEmai, validateTalkKeys, 
validateTalk, validateAge,
 async (req, res) => {
  const { name, age } = req.body;
  const { watchedAt, rate } = req.body.talk; 
  const data = await fs.readFile(TALKER_JSON, 'utf8');
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
  await fs.writeFile(TALKER_JSON, toJSON);
  return res.status(201).json(obj);
});

// req 5

talkerController.put('/:id', validateToken, validateEmai, validateTalkKeys, 
validateTalk, validateAge, async (req, res) => {
  const { name, age } = req.body;
  const { id } = req.params; 
  const { watchedAt, rate } = req.body.talk;
  const data = await fs.readFile(TALKER_JSON, 'utf8');
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
  await fs.writeFile(TALKER_JSON, toJSON);
  return res.status(200).json(obj);
});

// req 6

talkerController.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params; 
  const data = await fs.readFile(TALKER_JSON, 'utf8');
  const toJS = JSON.parse(data);
  const deleteTalker = toJS.filter((talker) => talker.id !== parseInt(id, 10));
  const toJSON = JSON.stringify(deleteTalker);
  await fs.writeFile(TALKER_JSON, toJSON);
  return res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
});

module.exports = talkerController;