const Twitter = require('twitter');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
var {displayTweets} = require('./utils/display');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

var client = new Twitter({
  consumer_key: 'jVGAXwYxCliNsQVjaGHiPJDlE',
  consumer_secret: 'rlqmjZCubJHTo3c4ILrItJGvMjOilGexGHlK03FTitPnzgCo3M',
  access_token_key: '854507675715080197-2UJHbZZyMm3jEbwiol72tIOgiTx4PRf',
  access_token_secret: 'DlUSdyTaTZv4yF6xm5UWzyEglQgWExs13qlrzVRAUUwVR'
});

io.on('connection', (socket) => {
  socket.on('getTweets', (info, callback) => {
    setTimeout(function(){
      client.get(`search/tweets.json?q=${encodeURIComponent(info.query)}&geocode=39.9612,-82.9988,5km&lang=en&result_type=recent`, function(error, tweets, response){
        if(error) throw error;
        io.emit('display', displayTweets(tweets));
        console.log('displaying tweets');
      });
    }, 5000);
  });
});

server.listen(3000, () => {
  console.log(`Server is up on localhost:3000.`);
});
