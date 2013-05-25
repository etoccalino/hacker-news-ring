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
  this.timeout = setTimeout(function () {
    that.scrape(function (results) {
      that.emit('news', results);
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
  var results = [];
  fn(results);
}
