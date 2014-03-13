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

var ignoredTests = [
	'goo/addons/Ammo/Ammo-vehicle-vtest',
	'goo/addons/Ammo/Ammo-vtest',
	'goo/addons/Cannon/Cannon-vtest',
	'goo/addons/p2/p2-vtest',
	'goo/components/Box2DComponent/Box2DComponent-vtest',
	'goo/components/LightDebugComponent/LightDebugComponent-vtest',
	'goo/entities/ApplyRemoveAPI/ApplyRemoveAPI-vtest',
	'goo/entities/CallbacksNextFrame/CallbacksNextFrame-vtest',   // Animation
	'goo/misc/FlatwaterAndParticles/FlatwaterAndParticles-vtest', // Animation fails this
	'goo/util/FrustumViewer/FrustumViewer-vtest',
	'goo/util/LightPointer/LightPointer-vtest',
	'goo/components/CameraDebugComponent/CameraDebugComponent-vtest',
	'goo/addons/Sound/Sound-vtest', // Animation
	'goo/addons/Howler/Howler-vtest',
	'AnimationComponent',
	'FSMSystem',
	'ProjectHandler',
	'WalkAround-script',
	'occlusionculling',
	'FSMHandler'
];

console.log('Ignored tests (todo: fix these!): ',ignoredTests)

for(var i=0; i<ignoredTests.length; i++){
	for(var j=testFiles.length-1; j>=0; j--){
		if(testFiles[j].indexOf(ignoredTests[i]) != -1){
			// Remove
			var removed = testFiles.splice(j,1);
		}
	}
}

var rootUrl = process.env.GOOJS_ROOT_URL;
var gooRootPath = path.join(__dirname,'..','..','..');

if(!rootUrl){
	console.error('Please set environment variable GOOJS_ROOT_URL!');
	process.exit();
}

// testFilePath should be something like visual-test/.../lol-test.html
function getTestInfo(testFilePath){
	var testFile = path.relative(gooRootPath,testFilePath);
	var url = rootUrl+'/'+testFile + '?deterministic=1';
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
				maxDist : 0.5,
				maxSumSquares : 1e-6,
			},function(err,result,stdout,stderr){
				expect(err).toBeFalsy();
				//expect(result).toBeTruthy();
				if(!result){
					// Only way to make custom message?
					expect(stdout).toBeFalsy();
				}

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
