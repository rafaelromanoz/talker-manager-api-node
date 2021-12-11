const express = require('express');
const bodyParser = require('body-parser');

const talkerController = require('./controllers/talkerController');
const loginController = require('./controllers/loginController');

const app = express();

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});
app.use(bodyParser.json());
app.use('/talker', talkerController);
app.use('/login', loginController);

app.listen(PORT, () => {
  console.log('Online');
});