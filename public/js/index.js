var socket = io();

socket.on('display', function(tweets) {
  jQuery('#tweets').empty();
  for(var i = 0; i < tweets.length; i++){
    var template = jQuery('#tweet-template').html();
    var html = Mustache.render(template, {
      created_at: tweets[i][0],
      text: tweets[i][1]
    });
    jQuery('#tweets').append(html);
  }
});

jQuery('#get-queries').on('submit', function(e) {
  e.preventDefault();
  socket.emit('getTweets', {
    query: jQuery('[name=query]').val(),
    location: jQuery('[name=location]').val()
  }, function() {
    // do something
  });
});
