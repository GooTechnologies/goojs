var webdriver = require('selenium-webdriver')
,	fs = require('fs')
,  	Canvas = require('canvas')
,  	Image = Canvas.Image
,   exec = require('child_process').exec
,   imageDiff = require('./imageDiff')

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).build();

function writeScreenshot(data, name) {
  name = name || 'ss.png';
  var screenshotPath = 'out/';
  fs.writeFileSync(screenshotPath + name, data, 'base64');
};

describe('basic test', function () {
	it('should be on correct page', function (done) {
		driver.get('http://www.wingify.com');
		driver.getTitle().then(function(title) {
			expect(title.indexOf('Wingify')).not.toEqual(-1);

			console.log("asdlkmasf 111!!!")

			var p = driver.takeScreenshot().then(function(data) {

				console.log("jnskjdnf 1111 33")

				fs.writeFileSync("lol.png", data, 'base64');


				var result = imageDiff.compare('lol.png','lol.png');

					console.log(stdout,stderr)

					// Read diff image
					fs.readFile('diff.png', function(err, squid){
						if (err) throw err;

						var canvas = new Canvas(200,200);
					  	var ctx = canvas.getContext('2d');

						img = new Image;
						img.src = squid;
						ctx.drawImage(img, 0, 0, 10,10);

					  	//writeScreenshot(data, 'out1.png');

						console.log("kjnasdkjnasd!!!")

						//ctx.drawImage(img, 0, 0, 10, 10);

						console.log("knf2222")

						var imgd = ctx.getImageData(0, 0, 10, 10);
						console.log(imgd.data);

						driver.executeScript("return document.title;").then(function(title) {

						  	console.log(title);

							driver.close().then(function(){
								done();
							});
						});
				});
			});
		});
	});
});

