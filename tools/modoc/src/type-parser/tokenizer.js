// jshint node:true
'use strict';

var makeToken = function (type, data) {
	var token = { type: type };
	if (data) { token.data = data; }
	return token;
};

var isNumber = function (char) {
	return char >= '0' && char <= '9';
};

var isIdentifierStart = function (char) {
	return char === '_' ||
		char === '?' ||
		(char >= 'A' && char <= 'Z') ||
		(char >= 'a' && char <= 'z');
};

var isIdentifierMiddle = function (char) {
	return isNumber(char) ||
		char === '_' ||
		char === '.' ||
		(char >= 'A' && char <= 'Z') ||
		(char >= 'a' && char <= 'z');
};

var isIdentifierEnd = function (char) {
	return isNumber(char) ||
		char === '_' ||
		char === '=' ||
		(char >= 'A' && char <= 'Z') ||
		(char >= 'a' && char <= 'z');
};

var isSymbol = function (char) {
	return '*:,|(){}<>'.indexOf(char) !== -1;
};

var chopNumber = function (string, offset) {
	var pointer = offset;

	while (
		pointer < string.length &&
		isNumber(string[pointer])
	) {
		pointer++;
	}

	return {
		token: makeToken('number', string.substring(offset, pointer)),
		pointer: pointer
	};
};

var chopIdentifier = function (string, offset) {
	var pointer = offset;

	// skip first char, we already know it's ok
	pointer++;

	while (
		pointer < string.length &&
		isIdentifierMiddle(string[pointer])
	) {
		pointer++;
	}

	// let's see if it has any special terminations
	if (
		pointer < string.length &&
		isIdentifierEnd(string[pointer])
	) {
		pointer++;
	}

	// nullable/optional notations should be handled by the parser, not the lexer
	var identifier = string.substring(offset, pointer);
	var token = makeToken('identifier', identifier);

	if (identifier.substr(0, 1) === '?') { token.nullable = true; }
	if (identifier.substr(-1, 1) === '=') { token.optional = true; }

	return {
		token: token,
		pointer: pointer
	};
};

var chopSymbol = function (string, offset) {
	return {
		token: makeToken('symbol', string[offset]),
		pointer: offset + 1
	};
};

var choppers = [
	{ test: isNumber, chop: chopNumber },
	{ test: isIdentifierStart, chop: chopIdentifier },
	{ test: isSymbol, chop: chopSymbol }
];

var tokenize = function (string) {
	var tokens = [];
	var pointer = 0;

	var z = 0;
	while (pointer < string.length) {
		z++; if (z > 100) { throw ''; } /* this needs to go away */

		var current = string[pointer];

		for (var i = 0; i < choppers.length; i++) {
			var chopper = choppers[i];
			if (chopper.test(current)) {
				var result = chopper.chop(string, pointer);
				tokens.push(result.token);
				pointer = result.pointer;
				break;
			}
		}

		// no chopper matched - treat as whitespace
		if (i >= choppers.length) {
			pointer++;
		}
	}

	return tokens;
};

exports._makeToken = makeToken;
exports.tokenize = tokenize;