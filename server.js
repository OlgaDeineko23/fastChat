const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
const cors = require('cors');

dotenv.config();
dotenv.load();

const PORT = process.env.PORT || 8000;
const SMOOCH_KEY_ID = process.env.REACT_APP_SMOOCH_KEY_ID;
const SMOOCH_SECRET = process.env.REACT_APP_SMOOCH_SECRET;
const SMOOCH_APP_ID = process.env.REACT_APP_SMOOCH_ID;


const smooch = new Smooch({
    keyId: SMOOCH_KEY_ID,
    secret: SMOOCH_SECRET,
    scope: 'app',
});

// express server
const app = express();
const server = require('http').Server(app);
let io = require('socket.io')(server);
app.use(express.static(path.resolve(__dirname, './build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: '*'}));

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('add-message', (message) => {
      io.emit('message', {type:'new-message', text: message});
  });
  socket.on('add-message', (message) => {
    app.post('/message', (req, res) => {
      const message = req.body.message;
      io.emit('message', {type:'new-message', text: req.body.messages[0]});
      const userId = req.body.userId;
      console.log(message, userId, req.body);
      if (!userId) return;
      const request = {
        type: 'text',
        text: message,
        name: 'Test Agent',
        role: 'appMaker',
        metadata: {lang: 'en-ca', items: 3},
      };
      smooch.appUsers.sendMessage(userId, request).then(response => {
        res.send(response);
      });
    });
      io.emit('message', {type:'new-message', text: message});
  });
});

app.post('/message', (req, res) => {
    const message = req.body.message;
    const userId = req.body.userId;
    console.log(message, userId, req.body);
    if (!userId) return;
    const request = {
        type: 'text',
        text: message,
        name: 'Test Agent',
        role: 'appMaker',
        metadata: {lang: 'en-ca', items: 3},
    };
    smooch.appUsers.sendMessage(userId, request).then(response => {
        res.send(response);
    });
});

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

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

server.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});