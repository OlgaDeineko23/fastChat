const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
const cors = require('cors');

dotenv.config();
dotenv.load();

const PORT = process.env.PORT || 5000;
const SMOOCH_KEY_ID = process.env.REACT_APP_SMOOCH_KEY_ID;
const SMOOCH_SECRET = process.env.REACT_APP_SMOOCH_SECRET;


const smooch = new Smooch({
  keyId: SMOOCH_KEY_ID,
  secret: SMOOCH_SECRET,
  scope: 'app',
});

//test

// express server
const app = express();
const server = require('http').Server(app);
app.use(express.static(path.resolve(__dirname, './build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// GET smooch appuser
app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!userId) return;
  smooch.appUsers
    .get(userId)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      console.log('API ERROR:\n', err);
      res.status(404).json({
        error: err.description,
        status: err.response.status,
        statusText: err.response.statusText,
      });
    });
});

// POST smooch message
app.post('/api/message', (req, res) => {
  const message = req.body.message;
  const userId = req.body.userId;
  console.log(message, userId, req.body)
  if (!userId) return;
  const request = {
    type: 'text',
    text: message,
    name: 'Test Agent',
    role: 'appMaker',
    metadata: { lang: 'en-ca', items: 3 },
  };
  smooch.appUsers.sendMessage(userId, request).then(response => {
    res.send(response);
  });
});

// GET smooch message
app.get('/api/messages/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!userId) return;
    smooch.appUsers.getMessages(userId).then((response) => {
        res.send(response);
    }).catch(err => {
        console.log('API ERROR:\n', err);
        res.status(404).json({
            error: err.description,
            status: err.response.status,
            statusText: err.response.statusText,
        });
    });
});


app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

server.listen(PORT, function() {
  console.log(`Server listening on port ${PORT}`);
});
// const express = require('express');
// const app = express();
//
// app.get('/', (req, res) => res.send('Hello World!'));
//
// app.listen(3000, () => console.log('Example app listening on port 3000!'));