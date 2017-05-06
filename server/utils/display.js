var request = require('request');

var displayTweets = function(tweets){
  var tweetsArr = [];
  for(var i = 0; i < tweets.statuses.length; i++){
    var eachTweet = [];
    eachTweet.push(tweets.statuses[i].created_at);
    eachTweet.push(tweets.statuses[i].text);
    tweetsArr.push(eachTweet);
  }
  return tweetsArr;
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
