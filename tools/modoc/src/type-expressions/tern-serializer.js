// jshint node:true
'use strict';

var definitionsCounter = 0;

var serializers = {
	'primitive': function (node) {
		return node.name.data === 'boolean' ?
			'bool' :
			node.name.data;
	},
	'any': function (node) {
		return '?';
	},
	'class': function (node, definitions) {
		// general generic types are not supported by tern (yet), only arrays for now
		if (node.name.data === 'Array') {
			return '[' +
				(node.parameters.length === 1 ?
					serialize(node.parameters[0], definitions) :
					'?') +
				']';
		}

		return '+' + node.name.data;
	},
	'list-item': function (node, definitions) {
		var name = node.name;

		// serializing both as '?'
		var decoratedName = name.nullable || name.optional ?
			name.data + '?':
			name.data;

		return decoratedName + ': ' +
			(node.type ? serialize(node.type, definitions) : '?');
	},
	'object': function (node, definitions) {
		var name = '_t_' + definitionsCounter;
		definitionsCounter++;

		definitions[name] = node.members.reduce(function (definition, member) {
			definition[member.name.data] = member.type ?
				serialize(member.type, definitions) :
				'?';
			return definition;
		}, {});

		return name;
	},
	'function': function (node, definitions) {
		var fun = 'fn (' +
			node.parameters.map(function (parameter) {
				return serialize(parameter, definitions);
			}).join(', ') +
			')';

		return node.return ?
			fun + ' -> ' + serialize(node.return, definitions) :
			fun;
	},
	'either': function (node, definitions) {
		// might need parens
		// tern doesn't mention parens but without them the expression can be ambiguous
		return node.choices.map(function (parameter) {
			return serialize(parameter, definitions);
		}).join('|');
	}
};

var serialize = function (node, definitions) {
	return serializers[node.nodeType](node, definitions);
};

var _serialize = function (node, options) {
	if (options && typeof options._forceCounter === 'number') {
		definitionsCounter = options._forceCounter;
	}

	var definitions = {};
	var serialized = serialize(node, definitions);
	return {
		definitions: definitions,
		serialized: serialized
	};
};


exports.serialize = _serialize;