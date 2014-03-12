var webdriver = require('selenium-webdriver');
var fs = require('fs');
var os = require('os');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var EventEmitter = require('events').EventEmitter;

module.exports = ScreenShooter;

/**
 * @class ScreenShooter
 * @param {object} [options]
 * @param {number} [options.wait]   How long to wait before taking each screenshot.
 * @param {string} [options.script]	JavaScript to run in the browser before each screenshot.
 * @param {number} [options.width]	Width of the browser window
 * @param {number} [options.height]	Height of the window
 */
function ScreenShooter(options){
	options = options || {};

	var settings = this.settings = {
		wait   : 600,
		script : ScreenShooter.removeGooStuffScript,
		width  : 400, // This is sort of the smallest possible in Chrome
		height : 180,
	};
	for(var key in options){
		if(typeof settings[key] !== 'undefined'){
			settings[key] = options[key];
		}
	}

	// Init driver
	this.driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
}

ScreenShooter.prototype = new EventEmitter();

// Script that removes stats, logos, dat.gui etc from a visual test
ScreenShooter.removeGooStuffScript = [
	"var statsEl = document.getElementById('stats');", // Remove stats box
	"if(statsEl) statsEl.style.display='none';",
	"var logoEl = document.getElementById('goologo');", // Remove logo
	"if(logoEl) logoEl.style.display='none';",
	"var dgEls = document.getElementsByClassName('dg ac');", // Remove dat gui
	"if(dgEls && dgEls.length) dgEls[0].style.display='none';",
].join('\n');

// Take a screenshot on an url and store it to a file. Will emit a 'shoot' event
ScreenShooter.prototype.takeScreenshot = function(url,pngPath,callback){

	var self = this;
	var driver = this.driver;

	// Point the browser to it
	driver.get(url).then(function(){

		// Get the window and resize it
		var w = new webdriver.WebDriver.Window(driver);
		w.setSize(self.settings.width,self.settings.height).then(function(){

			// Wait for webgl to set up and so on
			setTimeout(function(){

				// Run our startup script
				driver.executeScript(self.settings.script).then(function() {

					// Wait for webgl to set up and so on
					setTimeout(function(){

						// Take screenshot
						var p = driver.takeScreenshot().then(function(data) {

							// Create out folder if it does not exist
							mkdirp.mkdirp(path.dirname(pngPath),function(err){
								if(err){
									return callback(err);
								}

								// Save screenshot
								fs.writeFileSync(pngPath, data, 'base64');

								self.emit('shoot',{
									url:url,
									path:pngPath,
								});

								callback();
							});
						});
					}, self.settings.wait);
				});
			}, self.settings.wait);
		});
	});
};

// Take many screenshots. First arg is a map from url to png path.
ScreenShooter.prototype.takeScreenshots = function(urlToPathMap,callback){
	var self = this;

	// Get all urls
	var urls = [];
	for(var url in urlToPathMap){
		urls.push(url);
	}

	// Loop asynchronously over all files
	async.eachSeries(urls, function(url,done){

		// Take screenshot
		self.takeScreenshot(url,urlToPathMap[url],function(){
			done();
		});

	},function(){
		if(callback){
			callback();
		}
	});
};

// Shut down the shooter.
ScreenShooter.prototype.shutdown = function(callback){
	// Shut down
	this.driver.close().then(function(){
		if(callback){
			callback();
		}
	});
};


