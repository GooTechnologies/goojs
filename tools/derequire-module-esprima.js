// jshint node:true
'use strict';

/**
 * Strips a module from its require wrapping `define([...], ...`.
 * Esprima is used to parse the source. This is saner than using regexes.
 */

var _ = require('underscore');
var esprima = require('esprima');
var escodegen = require('escodegen');

var util = require('./util');

function getProgram(body) {
	return {
		"type": "Program",
		"body": [{
			"type": "ExpressionStatement",
			"expression": body
		}]
	};
}

function prefix(moduleName) {
	var property;
	if (util.isSafeIdentifier(moduleName)) {
		property = {
			'type': 'Identifier',
			'name': moduleName
		};
	} else {
		property = {
			'type': 'Literal',
			'value': util.safenIdentifier(moduleName)
		};
	}

	return {
		'type': 'MemberExpression',
		'computed': false,
		'object': {
			'type': 'Identifier',
			'name': 'goo'
		},
		'property': property
	};
}

function getAnonymousFunctionCall(callee, args) {
	return {
		'type': 'CallExpression',
		'callee': callee,
		'arguments': args
	};
}

function getAssignment(left, right) {
	return {
		'type': 'AssignmentExpression',
		'operator': '=',
		'left': left,
		'right': right
	};
}

function transform(modulePath, source) {
	var moduleName = util.extractModuleName(modulePath);

	var tree = esprima.parse(source);
	var defineExpression = tree.body[0].expression;

	var requiredModules, wrapperFunction;

	if (defineExpression.arguments.length === 1) {
		requiredModules = [];
		wrapperFunction = defineExpression.arguments[0];
	} else {
		requiredModules = defineExpression.arguments[0].elements;
		wrapperFunction = defineExpression.arguments[1];
	}

	var namespacedArgs = _.chain(requiredModules)
		.pluck('value')
		.map(util.extractModuleName)
		.map(prefix)
		.value();

	var functionCall = getAnonymousFunctionCall(wrapperFunction, namespacedArgs);
	var assigment = getAssignment(prefix(moduleName), functionCall);
	var program = getProgram(assigment);
	return escodegen.generate(program);
}

exports.transform = transform;