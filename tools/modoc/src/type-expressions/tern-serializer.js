// jshint node:true
'use strict';

var serializers = {
	'primitive': function (node) {
		return node.name.data === 'boolean' ?
			'bool' :
			node.name.data;
	},
	'any': function (node) {
		return '?';
	},
	'class': function (node) {
		// general generic types are not supported by tern (yet), only arrays for now
		if (node.name.data === 'Array') {
			return '[' +
				(node.parameters.length === 1 ?
					serialize(node.parameters[0]) :
					'?') +
				']';
		}

		return '+' + node.name.data;
	},
	'list-item': function (node) {
		var name = node.name;

		// serializing both as '?'
		var decoratedName = name.nullable || name.optional ?
			name.data + '?':
			name.data;

		return decoratedName + ': ' +
			(node.type ? serialize(node.type) : '?');
	},
	'object': function (node) {
		return '{ ' +
			node.members.map(serialize).join(', ') +
			' }';
	},
	'function': function (node) {
		var fun = 'fn (' +
			node.parameters.map(serialize).join(', ') +
			')';

		return node.return ?
			fun + ' -> ' + serialize(node.return) :
			fun;
	},
	'either': function (node) {
		// might need parens
		// tern doesn't mention parens but without them the expression can be ambiguous
		return node.choices.map(serialize).join('|');
	}
};

var serialize = function (node) {
	return serializers[node.nodeType](node);
};

exports.serialize = serialize;