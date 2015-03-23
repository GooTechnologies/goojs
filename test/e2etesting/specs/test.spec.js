var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var ScreenShooter = require(__dirname + '/../ScreenShooter');
var imgCompare = require(__dirname + '/../../../tools/imgcompare2/imgCompare');
var toc = require(__dirname + '/../../../tools/toc');
var filterList = require('../filterList').filterList;

function filterArray(array, filters) {
	return array.filter(function (entry) {
		return filters.some(function (filter) {
			return entry.indexOf(filter) === -1 && entry.indexOf('Ammo') !== -1;
		});
	});
}

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

var shooter;
var testFiles = toc.getFilesSync(__dirname + '/../../../visual-test/');
testFiles = filterArray(testFiles, filterList);

var rootUrl = process.env.GOOJS_ROOT_URL;
var gooRootPath = path.join(__dirname, '..', '..', '..');

if (!rootUrl) {
	console.error('Please set environment variable GOOJS_ROOT_URL!');
	process.exit();
}

// testFilePath should be something like visual-test/.../lol-test.html
function getTestInfo(testFilePath) {
	var testFile = path.relative(gooRootPath, testFilePath);
	var url = rootUrl + '/' + testFile + '?deterministic=1';
	var pngPath = path.join(__dirname, '..', 'screenshots-tmp', testFile.replace('visual-test','').replace('.html','.png'));
	var refPath = path.join(__dirname, '..', 'screenshots',     testFile.replace('visual-test','').replace('.html','.png'));

	return {
		url:     url,
		refPath: refPath,
		pngPath: pngPath
	};
}


describe('visual test', function () {
	beforeEach(function (done) {
		if (!shooter) {
			shooter = new ScreenShooter();
		}
		done();
	});

	function getTestFunc() {
		var testCounter = 0;

		return function testFunc(done) {
			var testFile = testFiles[testCounter++];

			var info2 = getTestInfo(testFile);

			var url = info2.url;
			var pngPath = info2.pngPath;
			var refPath = info2.refPath;

			// Take a screenshot
			shooter.takeScreenshot(url, pngPath, function (err) {
				expect(err).toBeFalsy();

				// Compare to the reference image
				imgCompare.compare(pngPath, refPath, function (dissimilarity) {
					expect(dissimilarity).toBeLessThan(0.02);

					var severeLogEntries = [];
					for (var j = 0; j < shooter.browserLog.length; j++) {
						var entry = shooter.browserLog[j];
						if (entry.level.name == 'SEVERE') {
							severeLogEntries.push(entry);
						}
					}

					expect(severeLogEntries).toEqual([]);

					if (testCounter >= testFiles.length) {
						// Shut down if there are no more tests
						shooter.shutdown(function () {
							done();
						});
					} else {
						done();
					}
				});

				/*
				imgcompare.compare(pngPath, refPath, {
					maxDist: 0.5,
					maxSumSquares: 1e-6
				}, function (err, result, stdout, stderr) {
					expect(err).toBeFalsy();
					//expect(result).toBeTruthy();
					if (!result) {
						// Only way to make custom message?
						expect(stdout).toBeFalsy();
					}

					var severeLogEntries = [];
					for (var j = 0; j < shooter.browserLog.length; j++) {
						var entry = shooter.browserLog[j];
						if (entry.level.name == 'SEVERE') {
							severeLogEntries.push(entry);
						}
					}

					expect(severeLogEntries).toEqual([]);

					if (testCounter >= testFiles.length) {
						// Shut down if there are no more tests
						shooter.shutdown(function () {
							done();
						});
					} else {
						done();
					}
				});
				*/
			});
		}
	}

	var testFunc = getTestFunc();

	for (var i = 0; i < testFiles.length; i++) {
		var info = getTestInfo(testFiles[i]);

		// Register test
		it('should render URL ' + info.url +
			' correctly (ref: ' + info.refPath + ', screenshot: ' + info.pngPath + ')',
			testFunc
		);
	}
});
