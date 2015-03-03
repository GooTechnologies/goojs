/**
 * Derequire-ifies a require generated minified module.
 * Replaces all define calls of the form
 * `define('moduleName', [dependencies...], function (solvedDependencies...) { return Module; }`
 * with
 * `goo.Module = (function (solvedDependencies...) { return Module })(namespacedDependencies...);`
 *
 * Note: use this on minified modules obtained with the minifyDir script
 */

'use strict';

var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('underscore');
var fs = require('fs');
var uglify = require('uglify-js');


function prefix(moduleName) {
	return {
		"type": "MemberExpression",
			"computed": false,
			"object": {
			"type": "Identifier",
				"name": "goo"
		},
		"property": {
			"type": "Identifier",
				"name": moduleName
		}
	};
}

function getAnonymousFunctionCall(callee, args) {
	return {
		"type": "CallExpression",
		"callee": callee,
		"arguments": args
	};
}

function getAssignment(left, right) {
	return {
		"type": "AssignmentExpression",
		"operator": "=",
		"left": left,
		"right": right
	};
}

function getSequence(subexpressios) {
	return {
		"type": "SequenceExpression",
		"expressions": subexpressios
	};
}

function getProgram(body) {
	return {
		"type": "Program",
		"body": [{
			"type": "ExpressionStatement",
			"expression": body
		}]
	};
}

function extractModuleName(completeName) {
	var index = completeName.lastIndexOf('/');
	return index === -1 ? completeName : completeName.substr(index + 1);
}

function transform(defineExpression) {
	var moduleName = extractModuleName(defineExpression.arguments[0].value);
	var requiredModules = defineExpression.arguments[1].elements;
	var wrapperFunction = defineExpression.arguments[2];

	var namespacedArgs = _.chain(requiredModules)
		.pluck('value')
		.map(extractModuleName)
		.map(prefix)
		.value();

	var functionCall = getAnonymousFunctionCall(wrapperFunction, namespacedArgs);
	var assigment = getAssignment(prefix(moduleName), functionCall);
	return assigment;
}

function getRequireExports(modulePaths) {
	var ret = '(function (define) {\n';
	modulePaths.forEach(function (modulePath) {
		var moduleName = extractModuleName(modulePath);
		ret += 'define("' + modulePath + '", [], function () { return goo.' + moduleName + '; });\n';
	});
	ret += '})(goo.useOwnRequire || !window.define ? goo.define : define);\n';
	return ret;
}


var inFileName = process.argv[2] || 'out/fish.js';
var outFileName = inFileName.substr(0, inFileName.length - 3) + '.dereq.js';

var source = fs.readFileSync(inFileName, 'utf8');

var tree = esprima.parse(source);

var moduleDefinitions = tree.body[0].expression.expressions;
console.log('Processing ' + (moduleDefinitions.length - 2) + ' modules...');

// filter out the last 2: which are added by our minifier
moduleDefinitions = moduleDefinitions.slice(0, moduleDefinitions.length - 2);

var processedModules = moduleDefinitions.map(transform);
var sequence = getSequence(processedModules);
var program = getProgram(sequence);


var generatorOptions = {
	format: {
		indent: {
			style: ''
		}
	},
	newline: '',
	space: '',
	compact: true
};

var outSource = escodegen.generate(program, generatorOptions);

var uglifyOptions = {
	fromString: true
};

var outMinifiedSource = uglify.minify(outSource, uglifyOptions);

var modulePaths = moduleDefinitions.map(function (moduleDefinition) {
	return moduleDefinition.arguments[0].value;
});
var requireExports = getRequireExports(modulePaths);

fs.writeFileSync(outFileName, outMinifiedSource.code + '\n' + requireExports);
console.log('Done; see ' + outFileName);