var Scraper = require('./scraper')
  , scraper = new Scraper({interval: 3000});

scraper.on('news', function (news) {
  console.log('scraped ' + news.length + ' news.');
});

scraper.start();
