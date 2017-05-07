var socket = io();

socket.on('display', function(obj) {
  jQuery('#tweets').empty();

  var node  = document.getElementById("map");
  node.parentNode.removeChild(node);

  var div = document.createElement("div");
  div.setAttribute("id", "map");
  div.setAttribute("class", "col-md-6");
  jQuery('#map-row').append(div);

  var mymap = L.map('map').setView([obj.lat, obj.long], 11);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  for(var i = 0; i < obj.tweets.length; i++){
    var template = jQuery('#tweet-template').html();
    var html = Mustache.render(template, {
      created_at: obj.tweets[i][0],
      text: obj.tweets[i][1]
    });
    jQuery('#tweets').append(html);
    if(obj.tweets[i].length === 4){
      L.marker([obj.tweets[i][2], obj.tweets[i][3]]).addTo(mymap).bindPopup(obj.tweets[i][1]);
    }
  }
});

jQuery('#get-queries').on('submit', function(e) {
  e.preventDefault();
  socket.emit('getTweets', {
    query: jQuery('[name=query]').val(),
    location: jQuery('[name=location]').val(),
    number: jQuery('[name=number]').val()
  }, function() {
    // do stuff
  });
});
