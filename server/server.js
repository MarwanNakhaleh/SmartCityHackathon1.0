const Twitter = require('twitter');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
var {displayTweets, getLocation} = require('./utils/display');

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
    locationObj = getLocation(info.location, function(errorMessage, results) {
      if (errorMessage) {
        console.log(errorMessage);
      }else{
        client.get(`search/tweets.json?q=${encodeURIComponent(info.query)}&geocode=${results.lat},${results.long},5km&lang=en&result_type=recent`, function(error, tweets, response){
          if(error) throw error;
          io.emit('display', displayTweets(tweets));
        });
        console.log('displaying tweets');
      }
    });
  });
});

server.listen(3000, () => {
  console.log(`Server is up on localhost:3000.`);
});
