var http = require('http');

exports = module.exports = scrape;

function scrape (url, fn) {
  http.get(url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      try {
        fn(JSON.parse(data));
      }
      catch (error) {
        console.log("scrapping -- found an error while parsing: " + error.message);
      }
    });
  }).on('error', function (error) {
    console.log("scrapping -- found an error: " + error.message);
  });
}
