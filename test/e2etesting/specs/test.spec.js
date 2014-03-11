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

describe('visual test', function () {

	beforeEach(function(done){
 		if(!shooter) shooter = new ScreenShooter();
		 done();
	});

	for(var i=0; i<testFiles.length; i++){
		it('should render URL '+testFiles[i]+' correctly',function(done){
			var testFile = testFiles.shift();
			var url = 'http://localhost:8081/goojs/'+testFile;
			var pngPath = path.join(os.tmpdir(),'tmp.png');
			var refPath = path.join(__dirname,'..','screenshots',testFile.replace('visual-test','').replace('.html','.png'));

			// Take a screenshot
			shooter.takeScreenshot(url, pngPath, function(err){
				expect(err).toBeFalsy();

				// Compare to the reference image
				imgcompare.compare(pngPath,refPath,{
					maxDist : 1,
					maxSumSquares : 1,
				},function(err,result){

					console.log(err)

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
