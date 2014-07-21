var path = require('path');
var program = require('commander');
require('coffee-script');
var toc = require(__dirname + '/../../visual-test/toc');
var ScreenShooter = require('./ScreenShooter');
var exec = require('child_process').exec;

//! AT: putting this here for now - it's in test.spec.js too
var ignoredTests = [
	'example',
	'carousel',
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
	'FSMHandler',
	'goo/addons/Water/water-vtest',
	'DynamicLoaderDestroy'
];

program
	.version('0.0.0')
	.option('-u, --url [url]',				'URL of the goojs root folder')
	.option('-w, --wait [milliseconds]',	'Number of milliseconds to wait for the test to run before taking a screenshot.')
	.parse(process.argv);

program.url = program.url || process.env.GOOJS_ROOT_URL || 'http://localhost:3000';

var gooRootPath = path.join(__dirname, '..', '..');

console.log('Using test URL: '+program.url);

var shooter = new ScreenShooter({
	script : ScreenShooter.removeGooStuffScript
});

if (typeof program.wait !== 'undefined') {
	shooter.wait = program.wait;
}

shooter.on('shoot', function (evt) {
	console.log('Took a screenshot!');
	console.log('    URL:  ' + evt.url);
	console.log('    Path: ' + evt.path + '\n');
});

// Get all visual test files
var files = toc.getFilePathsSync();

var screenshotsPath = path.join(__dirname,'screenshots');

var urlToPathMap = {};
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	if (ignoredTests.some(function (term) { return file.indexOf(term) !== -1; })) {
		continue;
	}

	var basename = path.basename(file);
	var dirname = path.dirname(file);

	var pngPath = path.join(__dirname, 'screenshots', path.relative(path.join(gooRootPath, 'visual-test'), file)).replace(/\.html$/, '.png');

	var url = program.url + '/' + path.relative(gooRootPath, file) + '?deterministic=1';

	urlToPathMap[url] = pngPath;
}

exec('rm -rf ' + __dirname + '/screenshots',function (err, out) {
	if (err) {
		throw err;
	}
	shooter.takeScreenshots(urlToPathMap, function (err) {
		if (err) {
			throw err;
		}
		shooter.shutdown();
	});
});
