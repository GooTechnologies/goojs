// jshint node:true
/**
 * Reports any undocumented function parameter
 * Ignores function that have no documentation at all
 *
 * Usage: node tools/jsdoc-param-checker.js
 */

'use strict';

var fs = require('fs');
var glob = require('glob');

require('colors');

var extractor = require('./modoc/src/extractor');
var jsdocParser = require('./modoc/src/jsdoc-parser');

var allFiles = glob.sync('src/**/*.js');

function pluck(property) {
	return function (obj) {
		return obj[property];
	};
}

// don't use for long arrays
function contains(array, element) {
	return array.indexOf(element) !== -1;
}

function makeError(functionName, message) {
	return {
		functionName: functionName,
		message: message
	};
}

function validate(data) {
	function validateFunction(data) {
		if (!data.rawComment) { return []; }

		var functionParams = data.params;

		var jsdoc = jsdocParser.extract(data.rawComment);

		if (!jsdoc['@param']) {
			if (functionParams.length) {
				return [makeError(data.name, 'missing @params')];
			} else {
				return [];
			}
		}

		var jsdocParams = jsdoc['@param'].map(pluck('name'));

		return functionParams.reduce(function (errors, functionParam) {
			if (!contains(jsdocParams, functionParam)) {
				errors.push(makeError(
					data.name,
					'parameter ' + functionParam + ' is missing from the jsdoc'
				));
			}
			return errors;
		}, []);
	}

	var constructorErrors = data.constructor ? validateFunction(data.constructor) : [];
	var methodErrors = Array.prototype.concat.apply([], data.methods.map(validateFunction));
	var staticMethodErrors = Array.prototype.concat.apply([], data.staticMethods.map(validateFunction));

	return constructorErrors.concat(methodErrors, staticMethodErrors);
}

var count = 0;

allFiles.forEach(function (file) {
	var source = fs.readFileSync(file, 'utf8');

	var data = extractor.extract(source, file);

	var errors = validate(data, file);

	if (errors.length) {
		count += errors.length;

		console.log(file.yellow);
		errors.forEach(function (error) {
			console.log(error.functionName, error.message.grey);
		});
		console.log();
	}
});

console.log(('Total number of errors ' + count)[count ? 'red' : 'green']);