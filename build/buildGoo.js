if (process.argv.indexOf('--help') > 0 || process.argv.length < 4) {
	console.log("Run\n" + "node build.js --out [out_name] [[--closure]]\n" + "\n" + "Arguments\n" + "--out Optimized file output name.\n"
		+ "[[--closure]] Optional argument to optimize with closure instead of uglify.\n",
		+"[[--beautify]] Optional argument to beautify code (use with simple).\n",
		"[[--simple]] Optional argument to not mangle the code, needed for angularjs atm.\n");
	process.exit();
}

// Parse command line arguments
var i = process.argv.indexOf('--out');
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

var doSimple = false;
i = process.argv.indexOf('--simple');
if (i > 0) {
	doSimple = true;
	console.log('Not mangling code');
}

var doBeautify = false;
i = process.argv.indexOf('--beautify');
if (doSimple && i > 0) {
	doBeautify = true;
	console.log('Beautifying code');
}

var requirejs = require('requirejs');
var workingDir = process.cwd();

var config = {
	baseUrl : './',
	paths : {
		goo : workingDir + '/../src/goo',
		almond : workingDir + '/almond'
	},
	name : 'almond',
	include : ['main'],
	insertRequire : ['main'],
	out : doClosureStep ? 'extracted.js' : appOut,
	useStrict : true,
	uglify : doSimple ? {
		no_mangle : true,
		no_copyright : true,
		beautify : doBeautify
	} : {},
	optimize : optimizer,
	wrap : true,
};

console.log(config);

var wrench = require('wrench'), util = require('util');
var fs = require('fs');

var stream = fs.createWriteStream("main.js", {
	flags : 'w'
});

stream.on('close', function() {
	requirejs.optimize(config, function(buildResponse) {
		console.log(buildResponse);

		if (doClosureStep) {
			var command = 'java -jar compiler.jar ' + '--compilation_level=SIMPLE_OPTIMIZATIONS --language_in ECMASCRIPT5_STRICT '
				+ '--jscomp_off=internetExplorerChecks --js extracted.js --js_output_file ' + appOut;
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
});

var s = 'require.config({\n' + 'baseUrl : "./",\n' + 'paths : {\n' + '    goo : "../src/goo",\n' + '}\n' + '});\n';
// stream.write(s);

stream.write('require([');

var files = [];
wrench.readdirRecursive(workingDir + '/../src', function(error, curFiles) {
	if (curFiles) {
		for ( var i = 0; i < curFiles.length; i++) {
			var name = curFiles[i];
			if (name.indexOf('.js') !== -1) {
				name = name.substring(0, name.length - 3);
				name = name.replace(/\\/g, '/');
				files.push(name);
			}
		}
	} else {
		var end = ', ';
		for ( var i = 0; i < files.length; i++) {
			if (i === files.length - 1) {
				end = '';
			}
			stream.write('\'' + files[i] + '\'' + end + '');
		}
		stream.write(']);\n');
		// stream.write('], function(){});\n');
		stream.end();
		// stream.destroy();
		// fs.closeSync(stream);
	}
});
