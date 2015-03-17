// jshint node:true
'use strict';

var _ = require('underscore');

function isSafeIdentifier(identifier) {
	return /^[\w_]+$/.test(identifier);
}

function safenIdentifier(identifier) {
	return identifier.replace(/[^\w_]/g, '');
}

function prefix(moduleName) {
	var property;
	if (isSafeIdentifier(moduleName)) {
		property = {
			"type": "Identifier",
			"name": moduleName
		};
	} else {
		property = {
			"type": "Literal",
			"value": safenIdentifier(moduleName)
		};
	}

	return {
		"type": "MemberExpression",
		"computed": false,
		"object": {
			"type": "Identifier",
			"name": "goo"
		},
		"property": property
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

function extractModuleName(completeName) {
	var index = completeName.lastIndexOf('/');
	return index === -1 ? completeName : completeName.substr(index + 1);
}

function transform(moduleName, defineExpression) {
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
		.map(extractModuleName)
		.map(prefix)
		.value();

	var functionCall = getAnonymousFunctionCall(wrapperFunction, namespacedArgs);
	var assigment = getAssignment(prefix(extractModuleName(moduleName)), functionCall);
	return assigment;
}


exports.transform = transform;