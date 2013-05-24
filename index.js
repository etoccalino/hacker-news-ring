var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

app.use(express.static('public'));
app.get('/', function(req, res, next){
  res.sendfile('index.html');
});

var news = [{
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

io.sockets.on('connection', function (socket) {
  socket.emit('news', news);
});

var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log('\033[96mlistening on localhost:' + port + '\033[39m');
});
