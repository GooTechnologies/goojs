// jshint node:true
'use strict';

function isSafeIdentifier(identifier) {
	return /^[\w_]+$/.test(identifier);
}

function safenIdentifier(identifier) {
	return identifier.replace(/[^\w_]/g, '');
}

function extractModuleName(completeName) {
	var index = completeName.lastIndexOf('/');
	return index === -1 ? completeName : completeName.substr(index + 1);
}

exports.isSafeIdentifier = isSafeIdentifier;
exports.safenIdentifier = safenIdentifier;
exports.extractModuleName = extractModuleName;
