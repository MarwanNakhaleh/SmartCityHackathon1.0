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

app.get('/test_all_numbers', function(req, res, next){
  PhoneNumber.find().then(function(phoneNumbers){
    phoneNumbers.forEach(function(pn) {
      console.log(`Phone Number: ${pn.number}`);
      var formattedNumber = String(pn.number).replace(/(\d{3})(\d{3})(\d{4})/, '+1$1$2$3');
      console.log(`Formatted number: ${formattedNumber}`);
      if (formattedNumber.length === 12){
        twilioClient.messages.create({
          body: 'There is an emergency!',
          to: formattedNumber,
          from: '+16143285664'
        }).then((message) => console.log(message.sid));
      };
    });
  });
});

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  if (req.body.Body.toLowerCase().includes('emergency')) {
    PhoneNumber.find().then(function(phoneNumbers){
      phoneNumbers.forEach(function(pn) {
        console.log(`Phone Number: ${pn.number}`);
        var formattedNumber = String(pn.number).replace(/(\d{3})(\d{3})(\d{4})/, '+1$1$2$3');
        console.log(`Formatted number: ${formattedNumber}`);
        if (formattedNumber.length === 12){
          twilioClient.messages.create({
            body: 'There is an emergency!',
            to: formattedNumber,
            from: '+16143285664'
          }).then((message) => console.log(message.sid));
        };
      });
    });
  } else {
    twiml.message('No Body param match, Twilio sends this in the request to your server.').then((message) => console.log("sent a no go message"));
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

io.on('connection', (socket) => {
  socket.on('getTweets', (info, callback) => {
    PhoneNumber.find({ number: info.number }).count().then((count) => {
      if(count == 0){
        var phoneNumber = new PhoneNumber({ number: info.number });
        phoneNumber.save(function(err) {
          if (err){
            console.log('Error on save!');
          }else{
            console.log('saved ok');
          }
        });
      }else{
        console.log('phone number already logged in db');
      }
    });
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
