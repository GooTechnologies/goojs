var webdriver = require('selenium-webdriver');
var fs = require('fs');
var os = require('os');
var path = require('path');
var Canvas = require('canvas');
var Image = Canvas.Image;
var exec = require('child_process').exec;
var ScreenShooter = require(__dirname + '/../ScreenShooter');
var imgcompare = require(__dirname + '/../../../tools/imgcompare');
var coffeescript = require('coffee-script');
var toc = require(__dirname + '/../../../visual-test/toc');

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var shooter, testFiles=toc.getFilePathsSync();

var rootUrl = process.env.GOOJS_ROOT_URL;
var gooRootPath = path.join(__dirname,'..','..','..');

if(!rootUrl){
	console.error('Please set environment variable GOOJS_ROOT_URL!');
	process.exit();
}

// testFilePath should be something like visual-test/.../lol-test.html
function getTestInfo(testFilePath){
	var testFile = path.relative(gooRootPath,testFilePath);
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

	beforeEach(function (done){
		if(!shooter){
			shooter = new ScreenShooter();
		}
		done();
	});

	var testCounter = 0;
	function testFunc (done){
		var testFile = testFiles[testCounter++];

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
				expect(err).toBeFalsy();
				expect(result).toBeTruthy();

				var severeLogEntries = [];
				for(var j=0; j<shooter.browserLog.length; j++){
					var entry = shooter.browserLog[j];
					if(entry.level.name == 'SEVERE'){
						severeLogEntries.push(entry);
					}
				}

				expect(severeLogEntries).toEqual([]);

				if(testCounter >= testFiles.length){
					// Shut down if there are no more tests
					shooter.shutdown(function(){
						done();
					});
				} else {
					done();
				}
			});
		});
	}

	for(var i=0; i<testFiles.length; i++){
		var info = getTestInfo(testFiles[i]);

		// Register test
		it('should render URL '+info.url+' correctly (ref: '+info.refPath+', screenshot: '+info.pngPath+')', testFunc);
	}
});
