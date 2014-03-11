var webdriver = require('selenium-webdriver')
,	fs = require('fs')
,	os = require('os')
,	path = require('path')
,   async = require('async')
,   mkdirp = require('mkdirp')
,   EventEmitter = require('events').EventEmitter

module.exports = ScreenShooter;

function ScreenShooter(options){
	options = options || {};

	var settings = this.settings = {
		wait   : 200,
		script : ScreenShooter.removeGooStuffScript,
		width  : 500,
		height : 500,
	};
	for(var key in options){
		if(typeof settings[key] != 'undefined'){
			settings[key] = options[key];
		}
	}

	// Init driver
	this.driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
};

ScreenShooter.prototype = new EventEmitter();

ScreenShooter.removeGooStuffScript = [
	"var statsEl = document.getElementById('stats');", // Remove stats box
	"if(statsEl) statsEl.style.display='none';",
	"var logoEl = document.getElementById('goologo');", // Remove logo
	"if(logoEl) logoEl.style.display='none';",
	"var dgEls = document.getElementsByClassName('dg ac');", // Remove dat gui
	"if(dgEls && dgEls.length) dgEls[0].style.display='none';",
].join('\n');

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
								if(err) return callback(err);

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

// Many screenshots
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
		if(callback) callback();
	});
};

ScreenShooter.prototype.shutdown = function(callback){
	// Shut down
	this.driver.close().then(function(){
		if(callback) callback();
	});
};


