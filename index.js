var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , Monitor = require('./utils/monitor')
  , io = require('socket.io').listen(server);

io.set('log level', 1);

// The express app will serve the client code

app.use(express.static('public'));
app.get('/', function(req, res, next){
  res.sendfile('index.html');
});

// The scraper will keep clients updated

var oldNews = [];

var scraper = new Monitor({interval: 10000});
// var scraper = new Scraper();
scraper.on('news', function (news) {
  console.log('Server received news update')

  // Keep a copy to serve to newly connected clients
  oldNews = news;
});
scraper.start();

// Configure updates

io.of('/news').on('connection', function (socket) {
  socket.emit('news', oldNews);

  scraper.on('news', function (news) {
    socket.emit('news', news);
  });
});

// Start the server

var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log('\033[96mlistening on localhost:' + port + '\033[39m');
});
