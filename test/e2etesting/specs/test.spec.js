var webdriver = require('selenium-webdriver')
,	fs = require('fs')
,	os = require('os')
,	path = require('path')
,  	Canvas = require('canvas')
,  	Image = Canvas.Image
,   exec = require('child_process').exec
,   ScreenShooter = require(__dirname + '/../ScreenShooter')
,   imgcompare = require(__dirname + '/../../../tools/imgcompare')
,   coffeescript = require('coffee-script')
,   toc = require(__dirname + '/../../../visual-test/toc')

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var shooter, testFiles=toc.getFilesSync();

var rootUrl = process.env.GOOJS_ROOT_URL;

if(!rootUrl){
	console.error('Please set environment variable GOOJS_ROOT_URL!');
	process.exit();
}

// testFilePath should be something like visual-test/.../lol-test.html
function getTestInfo(testFilePath){
	var testFile = testFilePath;
	var url = rootUrl+'/'+testFile;
	var pngPath = path.join(__dirname,'..','screenshots-tmp',testFile.replace('visual-test','').replace('.html','.png'));
	var refPath = path.join(__dirname,'..','screenshots',    testFile.replace('visual-test','').replace('.html','.png'));
	return {
		url:     url,
		refPath: refPath,
		pngPath: pngPath
	};
}

describe('visual test', function () {

	beforeEach(function(done){
 		if(!shooter) shooter = new ScreenShooter();
		 done();
	});

	for(var i=0; i<testFiles.length; i++){
		var info = getTestInfo(testFiles[i]);

		// Register test
		it('should render URL '+info.url+' correctly (ref: '+info.refPath+', screenshot: '+info.pngPath+')',function(done){
			var testFile = testFiles.shift();

			var info2 = getTestInfo(testFile);

			var url = info2.url;
			var pngPath = info2.pngPath;
			var refPath = info2.refPath;

			// Take a screenshot
			shooter.takeScreenshot(url, pngPath, function(err){
				expect(err).toBeFalsy();

				// Compare to the reference image
				imgcompare.compare(pngPath,refPath,{
					maxDist : 0.1,
					maxSumSquares : 1e-8,
				},function(err,result){

					//console.log(err)

					expect(err).toBeFalsy();
					expect(result).toBeTruthy();

					if(!testFiles.length){
						// Shut down if there are no more tests
						shooter.shutdown(function(){
							done();
						});
					} else {
						done();
					}
				});
			});
		});
	}
});
