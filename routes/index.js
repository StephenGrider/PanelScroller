var yelp = require('./yelpconfig');

exports.items = function(req, res){

    var latitude = .1*Math.random()*2-.1+37.771529
    var longitude = .1*Math.random()*2-.1+122.444741
    console.log('gettin stuff')
    yelp.search({term: "food", ll:latitude+",-"+longitude,limit:"20"}, function(error, data) {
      res.end(JSON.stringify(data));
    });
};