var i = process.argv.indexOf('--path');
var appPath = '../examples/';
if (i > 0 && process.argv[i + 1] && process.argv[i + 1][0] !== '-') {
	appPath = process.argv[i + 1];
	console.log('Path to entry-point: ' + appPath);
}

var doModify = false;
i = process.argv.indexOf('--modify');
if (i > 0) {
	doModify = true;
}

var wrench = require('wrench');
var fs = require('fs');
var lazy = require("lazy");
var requirejs = require('requirejs');
var workingDir = process.cwd();
var esprima = require('esprima');
var traverse = require('traverse');
var escodegen = require('escodegen');

var files = [];
wrench.readdirRecursive(appPath, function (error, curFiles) {
	if (curFiles) {
		for ( var i = 0; i < curFiles.length; i++) {
			var name = curFiles[i];
			if (name.indexOf('.js', name.length - 3) !== -1) {
				files.push(name);
			}
		}
	} else {
		parseJs(files);
	}
});

function parseJs (files) {
	function parseFile (inFile) {
		fs.readFile(appPath + inFile, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}

			var parsed = esprima.parse(data);

//			var streamWrite = fs.createWriteStream('../fish/' + inFile, {
//				flags: 'w'
//			});
//			streamWrite.write(JSON.stringify(parsed, null, 4));
//			streamWrite.end();

			var usedVariables = [];
			var usedDefs = [];
			var args1 = parsed.body[parsed.body.length - 1];
			if (args1.expression && args1.expression.arguments && args1.expression.arguments.length > 1) {
				var args2 = args1.expression.arguments[0].elements;
				var args3 = args1.expression.arguments[1].params;
				for ( var i = 0; i < args3.length; i++) {
					var name = args3[i];
					if (usedVariables.indexOf(name) === -1) {
						usedVariables.push(args3[i].name);
						usedDefs.push(args2[i].value);
					}
				}

				traverse(args1.expression.arguments[1].body).forEach(function (x) {
					if (this.key === 'name' && 
						(this.parent.key === 'callee' || 
							this.parent.key === 'object' || 
							this.parent.key === 'left' || 
							this.parent.key === 'right')) {
						var name = this.node;
						var index = usedVariables.indexOf(name);
						if (index !== -1) {
							usedVariables.splice(index, 1);
							usedDefs.splice(index, 1);
						}
					}
				});

				if (usedVariables.length > 0) {
					console.log('Import fixes: ' + inFile + ' = ' + usedVariables.length);
					// console.log(usedVariables);

					var startRequire = new RegExp('(require|define)(?!.config)\\([\\[.\\\'a-zA-Z/,\\s\\]\\(\\d\\*@"]*\\)', 'g');
					var hit = startRequire.exec(data);
					var hitIndex = hit.index;
					var hitLength = hit[0].length;
					var data1 = data.substring(0, hitIndex);
					var data2 = data.substring(hitIndex, hitIndex + hitLength);
					var data3 = data.substring(hitIndex + hitLength, data.length);
					for ( var i = 0; i < usedVariables.length; i++) {
						var variable = usedVariables[i];
						var def = usedDefs[i];
						var regex = new RegExp('\\s*(\\\'*\"*\\b' + def + '\\b\\\'*\"*|\\b' + variable + '\\b)\\s*,*\\s*', 'g');
						data2 = data2.replace(regex, '\n\t');
					}

					if (doModify) {
						var streamWrite = fs.createWriteStream(appPath + inFile, {
							flags: 'w'
						});
						streamWrite.write(data1);
						streamWrite.write(data2);
						streamWrite.write(data3);
						streamWrite.end();
					}
				}
			}

			inFile = files.shift();
			if (inFile) {
				 parseFile(inFile);
			}
		});
	}
	var inFile = files.shift();
	if (inFile) {
		parseFile(inFile);
	}
}
