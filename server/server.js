const Twitter = require('twitter');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const twilio = require('twilio');

const publicPath = path.join(__dirname, '../public');
var {displayTweets, getLocation} = require('./utils/display');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var twilioClient = new twilio(process.env.SCH_TWILIO_ACCOUNT_SID, process.env.SCH_TWILIO_AUTH_TOKEN);

app.use(express.static(publicPath));

app.get('/map', function(req, res, next){
  res.sendFile('map.html', { root: publicPath });
});

io.on('connection', (socket) => {
  socket.on('getTweets', (info, callback) => {
    locationObj = getLocation(info.location, function(errorMessage, results) {
      if (errorMessage) {
        console.log(errorMessage);
      }else{
        setInterval(function(){
          var client = new Twitter({
            consumer_key: process.env.SCH_CONSUMER_KEY,
            consumer_secret: process.env.SCH_CONSUMER_SECRET,
            access_token_key: process.env.SCH_ACCESS_TOKEN,
            access_token_secret: process.env.SCH_ACCESS_SECRET
          });
          client.get(`search/tweets.json?q=${encodeURIComponent(info.query)}&geocode=${results.lat},${results.long},5km&lang=en&result_type=recent`, function(error, tweets, response){
            if(error){
              throw error;
            }
            io.emit('display', displayTweets(tweets, twilioClient, info.number, results.lat, results.long));
          });
        }, 20000);
      }
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is up on localhost:3000.`);
});
