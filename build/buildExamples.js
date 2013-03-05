var doClosureStep = false;
i = process.argv.indexOf('--closure');
if (i > 0) {
	optimizer = 'none';
	doClosureStep = true;
	console.log('Using closure');
} else {
	optimizer = 'uglify';
	console.log('Using uglify');
}

var doSimple = false;
i = process.argv.indexOf('--simple');
if (i > 0) {
	doSimple = true;
	console.log('Not mangling code');
}

var wrench = require('wrench');
var fs = require('fs');
var lazy = require("lazy");
var requirejs = require('requirejs');
var workingDir = process.cwd();
var appPath = '../examples';
var outPath = '../examples_opt';

var files = [];
wrench.readdirRecursive(appPath, function(error, curFiles) {
	if (curFiles) {
		for ( var i = 0; i < curFiles.length; i++) {
			var name = curFiles[i];
			if (name.indexOf('.js') !== -1) {

				var inHtml = appPath + '/' + name.substring(0, name.length-3) + '.html';
				var outHtml =  name.substring(0, name.length-3) + '.html';
				var optNameJs = name.substring(0, name.length-3) + '_opt.js';
				createNewHtml(inHtml, outHtml, optNameJs);
				optimize(name, outPath + '/' + optNameJs);
			}
		}
	} else {
		// done
	}
});

function createNewHtml(inFile, outFile, optNameJs) {
//	console.log(inFile, outFile);
	
	var streamWrite = fs.createWriteStream(outPath + '/' + outFile, {
		flags : 'w'
	});

	new lazy(fs.createReadStream(inFile)).lines.forEach(function (line) {
		var str = line.toString();
		if (str.indexOf('data-main') === -1) {
			streamWrite.write(str);
		} else {
			streamWrite.write('<script src="'+optNameJs+'"></script>\n');
		}
	});
}

function optimize(appName, appOut) {
	var config = {
		baseUrl : appPath,
		paths : {
			goo : workingDir+'/../src/goo',
			'goo/lib': workingDir+'/../lib',
			almond : workingDir+'/../build/almond'
		},
		name : 'almond',
		include : [appName],
//		exclude : ['lib/angularjs/angular'],
		insertRequire : [appName],
		out : doClosureStep ? 'extracted.js' : appOut,
		useStrict : true,
		uglify : doSimple ? {
			no_mangle: true,
			no_copyright: true
		} : {},
		optimize : optimizer,
		wrap : true,
	};

	// console.log(config);

	requirejs.optimize(config, function(buildResponse) {
		// buildResponse is just a text output of the modules
		// included. Load the built file for the contents.
		// Use config.out to get the optimized file contents.
//		var contents = fs.readFileSync(config.out, 'utf8');
		
		console.log(buildResponse);
		
		if (doClosureStep) {
			var command = 'java -jar compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --language_in ECMASCRIPT5_STRICT --jscomp_off=internetExplorerChecks --js extracted.js --js_output_file '
				+ appOut;
			var exec = require('child_process').exec;
			exec(command, function callback(error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('closure error: ' + error);
				}
			});
		}
	}, function(error) {
		console.log('optimize error: ' + error);
	});
}