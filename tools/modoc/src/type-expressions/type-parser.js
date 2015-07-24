// jshint node:true
'use strict';

var tokenizer = require('./tokenizer');

var makeTokenList = function (tokens) {
	var pointer = 0;

	var hasNext = function () {
		return pointer < tokens.length;
	};

	var current = function () {
		return tokens[pointer];
	};

	var next = function () {
		return tokens[pointer + 1];
	};

	var matches = function (type, data) {
		if (pointer >= tokens.length) { return false; }

		var cur = current();

		if (arguments.length === 2) {
			return cur.type === type && cur.data === data;
		} else if (arguments.length === 1) {
			return cur.type === type;
		}
	};

	var advance = function () {
		pointer++;
	};

	var stringifyToken = function (type, data) {
		if (arguments.length === 2) {
			return '[' + type + ' ' + data + ']';
		} else if (arguments.length === 1) {
			return '[' + type + ']';
		}
	};

	var expect = function (type, data) {
		if (!hasNext()) {
			throw new Error(
				'Expected ' + stringifyToken(type, data) +
				' but instead reached end of input'
			);
		}

		var cur = current();
		if (!matches(type, data)) {
			throw new Error(
				'Expected ' + stringifyToken(type, data) +
				' but instead got ' + stringifyToken(cur)
			);
		}

		advance();
	};

	return {
		hasNext: hasNext,
		current: current,
		next: next,
		matches: matches,
		advance: advance,
		expect: expect
	};
};

/*

 Type expression grammar

 S = "number" | "boolean" | "string"
   | "?"
   | Class , ["<" , S , {"," , S} , ">"]
   | "{" , P , {"," , P} , "}"
   | "function (" , P , {"," , P} , ")" , [":" , S]
   | "(" , S, {"|" , S} , ")"

 P -> name , [":", S]

 */

var parseListItem = function (tokenList) {
	var name = tokenList.current();
	tokenList.advance();

	if (tokenList.matches('symbol', ':')) {
		tokenList.advance();

		return {
			nodeType: 'list-item',
			name: name,
			type: parse(tokenList)
		};
	}

	return {
		nodeType: 'list-item',
		name: name
	};
};

var parseBindingList = function (tokenList, matchingParen) {
	var items = [];

	if (tokenList.matches('symbol', matchingParen)) {
		return items;
	}

	while (tokenList.hasNext()) {
		items.push(parseListItem(tokenList));

		if (tokenList.matches('symbol', matchingParen)) {
			break;
		} else {
			tokenList.expect('symbol', ',');
		}
	}

	return items;
};

var parseFunction = function (tokenList) {
	tokenList.expect('identifier', 'function');

	tokenList.expect('symbol', '(');

	var bindingList = parseBindingList(tokenList, ')');

	tokenList.expect('symbol', ')');

	if (tokenList.matches('symbol', ':')) {
		tokenList.advance();

		return {
			nodeType: 'function',
			parameters: bindingList,
			return: parse(tokenList)
		};
	} else {
		return {
			nodeType: 'function',
			parameters: bindingList
		};
	}
};

var parseObject = function (tokenList) {
	tokenList.expect('symbol', '{');

	var bindingList = parseBindingList(tokenList, '}');

	tokenList.expect('symbol', '}');

	return {
		nodeType: 'object',
		members: bindingList
	};
};

// there are better ways of doing this
var parseNonEmptyList = function (tokenList, matchingParen, separator) {
	var items = [];

	while (tokenList.hasNext()) {
		items.push(parse(tokenList));

		if (tokenList.matches('symbol', matchingParen)) {
			break;
		}

		tokenList.expect('symbol', separator);
	}

	return items;
};

var parseClass = function (tokenList) {
	var className = tokenList.current();
	tokenList.advance();

	var parameters;

	if (tokenList.matches('symbol', '<')) {
		tokenList.advance();

		parameters = parseNonEmptyList(tokenList, '>', ',');

		tokenList.expect('symbol', '>');
	} else {
		parameters = [];
	}

	return {
		nodeType: 'class',
		name: className,
		parameters: parameters
	};
};

var parseEither = function (tokenList) {
	tokenList.advance();
	var choices = parseNonEmptyList(tokenList, ')', '|');
	tokenList.expect('symbol', ')');

	return {
		nodeType: 'either',
		choices: choices
	};
};

var parse = function (tokenList) {
	var cur = tokenList.current();

	if (cur.type === 'identifier') {
		// check if it's a known type
		if (['number', 'boolean', 'string'].indexOf(cur.data) !== -1) {
			tokenList.advance();

			return {
				nodeType: 'primitive',
				name: cur
			};
		}

		// check if it's a function
		if (cur.data === 'function') {
			return parseFunction(tokenList);
		}

		// if all else fails it must be a class
		return parseClass(tokenList);
	}

	if (cur.type === 'symbol') {
		if (cur.data === '*') {
			tokenList.advance();
			return {
				nodeType: 'any'
			};
		} else if (cur.data === '{') {
			return parseObject(tokenList);
		} else if (cur.data === '(') {
			return parseEither(tokenList);
		}
	}
};

var _parse = function (stringOrTokens) {
	var tokens = typeof stringOrTokens === 'string' ?
		tokenizer.tokenize(stringOrTokens) :
		stringOrTokens;

	var tokenList = makeTokenList(tokens);
	var parsed = parse(tokenList);
	if (tokenList.hasNext()) {
		throw new Error('Unexpected tokens remain unparsed');
	}
	return parsed;
};

exports.parse = _parse;