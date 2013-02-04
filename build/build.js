if (process.argv.indexOf('--help') > 0 || process.argv.length < 8) {
	console.log("Run\n" + 
		"node build.js --path [my_app_directory] --name [my_app_main] --out [out_name] [[--closure]]\n" + 
		"\n" + 
		"Arguments\n" + 
		"--path	Path to js entry-point.\n" + 
		"--name	Name of entry-point.\n" + 
		"--out Optimized file output name.\n" +
		"[[--closure]] Optional argument to optimize with closure instead of uglify.\n"
		);
	process.exit();
}

// Parse command line arguments
var i = process.argv.indexOf('--path');
if (i > 0 && process.argv[i + 1] && process.argv[i + 1][0] !== '-') {
	appPath = process.argv[i + 1];
	console.log('Path to entry-point: ' + appPath);
} else {
	console.log('Not valid input: ' + process.argv[i + 1]);
	process.exit();
}

i = process.argv.indexOf('--name');
if (i > 0 && process.argv[i + 1] && process.argv[i + 1][0] !== '-') {
	appName = process.argv[i + 1];
	console.log('Name of entry-point: ' + appName);
} else {
	console.log('Not valid input: ' + process.argv[i + 1]);
	process.exit();
}

i = process.argv.indexOf('--out');
if (i > 0 && process.argv[i + 1] && process.argv[i + 1][0] !== '-') {
	appOut = process.argv[i + 1];
	console.log('Optimized file output name: ' + appOut);
} else {
	console.log('Not valid input: ' + process.argv[i + 1]);
	process.exit();
}

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

var requirejs = require('requirejs');

var config = {
	baseUrl : appPath,
	paths : {
		goo : '../src/goo',
		almond : '../build/almond'
	},
	name : 'almond',
	include : [appName],
	insertRequire : [appName],
	out : doClosureStep ? 'extracted.js' : appOut,
	useStrict : true,
	optimize : optimizer,
	wrap : true
};

console.log(config);

requirejs.optimize(config, function(buildResponse) {
	// buildResponse is just a text output of the modules
	// included. Load the built file for the contents.
	// Use config.out to get the optimized file contents.
//	var contents = fs.readFileSync(config.out, 'utf8');
	
	if (doClosureStep) {
		var command = 'java -jar compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --language_in ECMASCRIPT5_STRICT --jscomp_off=internetExplorerChecks --js extracted.js --js_output_file '
			+ appOut;
		var exec = require('child_process').exec;
		exec(command, function callback(error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});
	}
}, function(error) {
	console.log('exec error: ' + error);
});
