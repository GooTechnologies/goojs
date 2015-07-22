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
		// general generic types are not supported by tern (yet)
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
		var name = node.name.data;

		return node.type ?
			name + ': ' + serialize(node.type) :
			name;
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
	}
};

var serialize = function (node) {
	return serializers[node.nodeType](node);
};

exports.serialize = serialize;