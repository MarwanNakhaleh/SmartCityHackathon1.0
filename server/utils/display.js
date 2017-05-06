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

module.exports = {
  displayTweets
}
