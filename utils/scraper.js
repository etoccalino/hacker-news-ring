var EventEmitter = require('events').EventEmitter
  , http = require('http');


exports = module.exports = Scraper;



function Scraper (params) {
  params = params || {};
  this.url = params.url || "http://api.ihackernews.com/page/";
  this.interval = params.interval || 60000;

  this.timeout = null;
  this.started = false;
}

Scraper.prototype.__proto__ = EventEmitter.prototype;

Scraper.prototype.start = function () {
  if (this.started)
    return;

  this.started = true;


  var that = this;

  // Make the first request right away
  that.scrape(function (results) {
    that.emit('news', results.items);
  });

  // Schedule next requests at regular intervals
  this.timeout = setTimeout(function () {
    that.scrape(function (results) {
      that.emit('news', results.items);
    });
    that.timeout = setTimeout(arguments.callee, that.interval);
  }, this.interval);
}

Scraper.prototype.stop = function () {
  if (! this.started)
    return;

  clearTimeout(this.timeout);
  this.started = false;
}

Scraper.prototype.scrape = function (fn) {

  http.get(this.url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      try {
        fn(JSON.parse(data));
      }
      catch (error) {
        console.log("Scraper found an error while parsing: " + error.message);
      }
    });
  }).on('error', function (error) {
    console.log("Scraper found an error: " + error.message);
  });
}
