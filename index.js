var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , Scraper = require('./utils/scraper')
  , io = require('socket.io').listen(server);

io.set('log level', 1);

// The express app will serve the client code

app.use(express.static('public'));
app.get('/', function(req, res, next){
  res.sendfile('index.html');
});

// The scraper will keep clients updated

scraper = new Scraper();
scraper.on('news', function (news) {
  // Keep a copy to serve to newly connected clients
  // oldNews = news;
});
scraper.start();

var oldNews = [{
  url: 'http://google.com',
  headline: 'the most popular search engine ever'
}, {
  url: 'http://yahoo.com',
  headline: 'one of the first popular search engines'
}, {
  url: 'http://news.ycombinator.com',
  headline: 'indexes the news most interesting... to you'
}, {
  url: 'http://stackoverflow.com',
  headline: 'cosmopolitan hub of news and discusison'
}, {
  url: 'http://github.com',
  headline: 'social coding, for real'
}, {
  url: 'http://imdb.com',
  headline: 'the internet movie database. say no more'
}, {
  url: 'http://creativa77.com.ar',
  headline: 'smart people, turtle robots and lots of monitors'
}];

// Configure updates

io.of('/news').on('connection', function (socket) {
  socket.emit('news', oldNews);

  scraper.on('news', function (news) {
    // socket.emit('news', news);
  });
});

// Start the server

var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log('\033[96mlistening on localhost:' + port + '\033[39m');
});
