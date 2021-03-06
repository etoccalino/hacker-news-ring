var EventEmitter = require('events').EventEmitter
  , sigmund = require('sigmund')
  , scrape = require('./scraper');

exports = module.exports = Monitor;

//
// Will emit "news" when there are news that don't match the
// previously emitted.
//
// The listener function should expect an array of news.
//
function Monitor (params) {
  params = params || {};
  this.interval = params.interval || 60000;
  this.url = params.url || 'http://api.ihackernews.com/page';
  this.debug = params.debug || false;

  // Keep a signature of the last news, to compare
  this.newsSignature = '';

  this.timeout = null;
  this.running = false;
}

Monitor.prototype.__proto__ = EventEmitter.prototype;

Monitor.prototype.start = function () {
  if (this.running)
    return;
  this.running = true;

  // Make the first request right away
  this.checkNews();

  // Schedule next requests at regular intervals
  var that = this;
  this.timeout = setTimeout(function () {
    that.checkNews();

    that.timeout = setTimeout(arguments.callee, that.interval);
  }, this.interval);
}

Monitor.prototype.stop = function () {
  if (! this.running)
    return;

  clearTimeout(this.timeout);
  this.running = false;
}

Monitor.prototype.checkNews = function () {
  if (this.debug) {
    return this.emit('news', Monitor.dummyNews);
  }

  var that = this;

  scrape(this.url, function (results) {
    var news = results.items
      , signature = sigmund(news);

    // Only emit the news if they are new
    if (that.newsSignature !== signature) {
      that.emit('news', news);
      that.newsSignature = signature;
    }
  });
}

Monitor.dummyNews = [{
    title: 'dummy 0'
  , url: 'http://github.com/'
}, {
    title: 'dummy 1'
  , url: 'http://github.com/'
}, {
    title: 'dummy 2'
  , url: 'http://github.com/'
}, {
    title: 'dummy 3'
  , url: 'http://github.com/'
}, {
    title: 'dummy 4'
  , url: 'http://github.com/'
}, {
    title: 'dummy 5'
  , url: 'http://github.com/'
}, {
    title: 'dummy 6'
  , url: 'http://github.com/'
}, {
    title: 'dummy 7'
  , url: 'http://github.com/'
}, {
    title: 'dummy 8'
  , url: 'http://github.com/'
}, {
    title: 'dummy 9'
  , url: 'http://github.com/'
}, {
}];
