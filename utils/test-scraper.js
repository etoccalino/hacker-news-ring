var Scraper = require('./scraper')
  , scraper = new Scraper({interval: 3000});

scraper.on('news', function (news) {
  console.log('NEWS: ' + JSON.stringify(news));
});

scraper.start();
