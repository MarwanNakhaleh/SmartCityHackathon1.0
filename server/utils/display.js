var request = require('request');

var displayTweets = function(tweets, client, number, lat, long){
  var tweetsArr = [];
  for(var i = 0; i < tweets.statuses.length; i++){
    var eachTweet = [];
    if(tweets.statuses[i].geo){
      console.log('geo', tweets.statuses[i].geo);
    }else if (tweets.statuses[i].coordinates){
      console.log('coords', tweets.statuses[i].coordinates);
    }
    eachTweet.push(tweets.statuses[i].created_at);
    eachTweet.push(tweets.statuses[i].text);
    if(tweets.statuses[i].text.includes("emergency")){
      var formattedNumber = number.replace(/(\d{3})(\d{3})(\d{4})/, '+1$1$2$3');
      if (formattedNumber.length === 12){
        client.messages.create({
          body: 'There is an emergency!',
          to: formattedNumber,
          from: '+16143285664'
        }).then((message) => console.log(message.sid));
      }
    }
    tweetsArr.push(eachTweet);
  }
  return {
    tweets: tweetsArr,
    lat: lat,
    long: long
  };
}

var getLocation = function(location, callback) {
  request({
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}`,
    json: true,
  }, function(error, response, body) {
    if (error) {
      callback(JSON.stringify(error, undefined, 2));
    } else {
      if (body.status === 'ZERO_RESULTS') {
        callback('Unable to find address');
      } else {
        callback(undefined, {
          lat: body.results[0].geometry.location.lat,
          long: body.results[0].geometry.location.lng
        });
      }
    }
  });
}

module.exports = {
  displayTweets,
  getLocation
}
