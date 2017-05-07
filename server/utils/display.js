var request = require('request');

var displayTweets = function(tweets, client, number, lat, long){
  var tweetsArr = [];
  for(var i = 0; i < tweets.statuses.length; i++){
    var eachTweet = [];
    eachTweet.push(tweets.statuses[i].created_at);
    eachTweet.push(tweets.statuses[i].text);
    if(tweets.statuses[i].text.includes('emergency') || tweets.statuses[i].text.includes('fire') || tweets.statuses[i].text.includes('rescue') || tweets.statuses[i].text.includes('victim') || tweets.statuses[i].text.includes('burning') ||
    tweets.statuses[i].text.includes('flames')){
      var formattedNumber = number.replace(/(\d{3})(\d{3})(\d{4})/, '+1$1$2$3');
      if (formattedNumber.length === 12){
        client.messages.create({
          body: 'There is an emergency!',
          to: formattedNumber,
          from: '+16143285664'
        }).then((message) => console.log(message.sid));
      }
    }
    if(tweets.statuses[i].geo){
      console.log('geo');
      console.log(tweets.statuses[i].geo.coordinates[0]);
      console.log(tweets.statuses[i].geo.coordinates[1]);
      eachTweet.push(tweets.statuses[i].geo.coordinates[0]);
      eachTweet.push(tweets.statuses[i].geo.coordinates[1]);
    }else if (tweets.statuses[i].coordinates){
      console.log('coords');
      console.log(tweets.statuses[i].coordinates);
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
