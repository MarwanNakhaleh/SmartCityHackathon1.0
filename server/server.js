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
  consumer_key: process.env.SCH_CONSUMER_KEY,
  consumer_secret: process.env.SCH_CONSUMER_SECRET,
  access_token_key: process.env.SCH_ACCESS_TOKEN,
  access_token_secret: process.env.SCH_ACCESS_SECRET
});

io.on('connection', (socket) => {
  socket.on('getTweets', (info, callback) => {
    locationObj = getLocation(info.location, function(errorMessage, results) {
      if (errorMessage) {
        console.log(errorMessage);
      }else{
        setInterval(function(){
          client.get(`search/tweets.json?q=${encodeURIComponent(info.query)}&geocode=${results.lat},${results.long},1km&lang=en&result_type=recent`, function(error, tweets, response){
            if(error) throw error;
            io.emit('display', displayTweets(tweets));
          });
        }, 10000);
      }
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is up on localhost:3000.`);
});
