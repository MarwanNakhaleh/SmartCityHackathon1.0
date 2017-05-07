const Twitter = require('twitter');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // use the regular old promise stuff
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PhoneNumbers', function(err, res){
  if(err){
    console.log('unable to connect to db');
  }else{
    console.log('successfully connected');
  }
});

const publicPath = path.join(__dirname, '../public');
var {displayTweets, getLocation} = require('./utils/display');
var {PhoneNumber} = require('./utils/phone_number');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var twilioClient = new twilio(process.env.SCH_TWILIO_ACCOUNT_SID, process.env.SCH_TWILIO_AUTH_TOKEN);

app.use(express.static(publicPath));
app.use(bodyParser());

app.get('/map', function(req, res, next){
  res.sendFile('map.html', { root: publicPath });
});

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  if (req.body.Body.toLowerCase().includes('emergency')) {
    PhoneNumber.find().then((pns) => {
      console.log(pns);
      twiml.message(JSON.stringify(pns, undefined, 2));
    });
    twiml.message()
  } else {
    twiml.message('No Body param match, Twilio sends this in the request to your server.');
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
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
            PhoneNumber.find({ number: info.number }).then((pn) => {
              if(!pn){
                var phoneNumber = new PhoneNumber({ number: info.number });
                phoneNumber.save(function(err) {
                  if (err){
                    console.log('Error on save!');
                  }else{
                    console.log('saved ok');
                  }
                });
              }
            });
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
