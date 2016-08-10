var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://geekwhocode.in";
var SEARCH_TARGET = "NotGeekExactly";
var MAX_PAGES_TO_VISIT = 100;

var pagesVisited = {};
var pagesVisitedCount = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

//pass the initial URL to start with
pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(pagesVisitedCount >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  if(pagesToVisit.length>0){
    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
      // already visited this page -> repeate crawl();
      crawl();
    } 
    else {
        visitPage(nextPage, crawl);           
    }
  }
  else{
    console.log("That's all, we reached at the very last page of "+ START_URL + "we didn't find " + SEARCH_TARGET);
  }
}

function visitPage(url, crawl) {
  pagesVisited[url] = true;
  pagesVisitedCount++;

  
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // status code 200
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       crawl();
       return;
     }
     // Parse 
     var $ = cheerio.load(body);
     var isWordFound = searchTarget($, SEARCH_TARGET);
     if(isWordFound) {
       console.log('target ' + SEARCH_TARGET + ' found on page ' + url);
       return;
     } else {
       collectInternalLinks($);// get all internal links 
       crawl();
     }
  });
}

function searchTarget($, target) {
  var bodyRawText = $('html > body').text().toLowerCase();
  return(bodyRawText.indexOf(target.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var internalLinks = $("a[href^='/']"); // this is method of cheerio select element just like Jquery  
    
    console.log("Found " + internalLinks.length + " relative links on page");
    internalLinks.each(function() {
      if($(this).attr('href') !== '/' && $(this).attr('href') !== 'undefined'){
        pagesToVisit.push(baseUrl + $(this).attr('href'));
        // uncoment below line to find target; 
        pagesToVisit.push("http://geekwhocode.in/about");
      }
    });
}