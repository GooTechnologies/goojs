var webdriver = require('selenium-webdriver')
,	fs = require('fs')
,	os = require('os')
,	path = require('path')
,  	Canvas = require('canvas')
,  	Image = Canvas.Image
,   exec = require('child_process').exec
,   imageDiff = require('./imageDiff')

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

function writeScreenshot(data, name) {
  name = name || 'ss.png';
  var screenshotPath = 'out/';
  fs.writeFileSync(screenshotPath + name, data, 'base64');
};

describe('basic test', function () {
	it('should be on correct page', function (done) {
		driver.get('http://localhost:8081/goojs/visual-test/goo/addons/p2/p2-vtest.html');
		driver.getTitle().then(function(title) {

			var w = new webdriver.WebDriver.Window(driver);
			w.setSize(500,500).then(function(){

				driver.executeScript("return 'haha';").then(function() {

					var p = driver.takeScreenshot().then(function(data) {

						var tmpdir = os.tmpdir();
						var tmpImagePath = path.join(tmpdir,"screenshot.png");

						console.log(tmpImagePath)

						fs.writeFileSync(tmpImagePath, data, 'base64');
						var cmd = __dirname + "/../../../tools/imgcompare/bin/imgcompare "+tmpImagePath + " " + tmpImagePath +  " 1 1";
						console.log("command",cmd)

						exec(cmd, function(err,stdout,stderr){
							if(err && err.code == 1){
								console.log("Didnt match!");
							} else if(err)
								throw err;

							console.log(stdout,stderr)

							driver.close().then(function(){
								done();
							});
						});
					});
				});
			});
		});
	});
});

