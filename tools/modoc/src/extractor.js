'use strict';

var esprima = require('../lib/esprima');
var estraverse = require('estraverse');

var util = require('./util');


var getFirstJSDoc = function (comments) {
	for (var i = 0; i < comments.length; i++) {
		var comment = comments[i];
		if (comment.type === 'Block' && comment.value[0] === '*') {
			return comment.value;
		}
	}
};

var extractTree = function (tree, fileName, options) {
	var extractors = {
		constructor: {
			match: function (node, fileName) {
				return node.type === 'FunctionDeclaration' && node.id.name === fileName;
			},
			extract: function (node) {
				var params = node.params.map(function (param) {
					return param.name;
				});

				var comment;
				var leadingComments = node.leadingComments || node.id.leadingComments;
				if (leadingComments) {
					comment = getFirstJSDoc(leadingComments);
				}

				return {
					name: node.id.name,
					params: params,
					rawComment: comment
				};
			}
		},
		method: {
			match: function (node, fileName) {
				return node.type === 'AssignmentExpression' && node.operator === '=' &&
					node.left.type === 'MemberExpression' &&
					node.left.object.type === 'MemberExpression' &&
					node.left.object.property.name === 'prototype' &&
					node.left.object.object.name === fileName &&
					node.right.type === 'FunctionExpression' &&
					options.nameFilter(node.left.property.name);
			},
			extract: function (node) {
				var params = node.right.params.map(function (param) {
					return param.name;
				});

				var comment;
				var leadingComments = node.leadingComments || node.left.leadingComments;

				if (leadingComments) {
					comment = getFirstJSDoc(leadingComments);
				}

				return {
					name: node.left.property.name,
					params: params,
					rawComment: comment
				};
			}
		},
		static_: {
			match: function (node, fileName) {
				return node.type === 'AssignmentExpression' && node.operator === '=' &&
					node.left.type === 'MemberExpression' &&
					node.left.object.name === fileName &&
					node.right.type === 'FunctionExpression' &&
					options.nameFilter(node.left.property.name);
			},
			extract: function (node) {
				var params = node.right.params.map(function (param) {
					return param.name;
				});

				var comment;
				var leadingComments = node.leadingComments || node.left.leadingComments;

				if (leadingComments) {
					comment = getFirstJSDoc(leadingComments);
				}

				return {
					name: node.left.property.name,
					params: params,
					rawComment: comment
				};
			}
		},
		staticMembers: {
			match: function (node, parent, fileName) {
				return node.type === 'AssignmentExpression' && node.operator === '=' &&
					node.left.type === 'MemberExpression' &&
					node.left.object.name === fileName &&
					node.right.type !== 'FunctionExpression' &&
					parent.leadingComments &&
					getFirstJSDoc(parent.leadingComments) &&
					options.nameFilter(node.left.property.name);
			},
			extract: function (node, parent) {
				var comment;
				var leadingComments = parent.leadingComments;

				if (leadingComments) {
					comment = getFirstJSDoc(leadingComments);
				}

				return {
					name: node.left.property.name,
					rawComment: comment
				};
			}
		},
		member: {
			match: function (node, parent, fileName) {
				return node.type === 'AssignmentExpression' && node.operator === '=' &&
					node.left.type === 'MemberExpression' &&
					node.left.object.type === 'ThisExpression' &&
					parent.leadingComments &&
					getFirstJSDoc(parent.leadingComments) &&
					options.nameFilter(node.left.property.name);
			},
			extract: function (node, parent) {
				var comment = getFirstJSDoc(parent.leadingComments);

				return {
					name: node.left.property.name,
					rawComment: comment
				};
			}
		}
	};



	var constructor, statics = [], methods = [], members, staticMembers = [];

	var collectMembers = function (node) {
		var members = [];
		estraverse.traverse(node, {
			enter: function (node, parent) {
				if (extractors.member.match(node, parent, fileName)) {
					members.push(extractors.member.extract(node, parent));
				}
			}
		});
		return members;
	};

	estraverse.traverse(tree, {
		enter: function (node, parent) {
			if (extractors.constructor.match(node, fileName)) {
				constructor = extractors.constructor.extract(node);
				members = collectMembers(node.body);
			} else if (extractors.method.match(node, fileName)) {
				methods.push(extractors.method.extract(node));
			} else if (extractors.static_.match(node, fileName)) {
				statics.push(extractors.static_.extract(node));
			} else if (extractors.staticMembers.match(node, parent, fileName)) {
				staticMembers.push(extractors.staticMembers.extract(node, parent));
			}
		}
	});

	return {
		constructor: constructor,
		statics: statics,
		staticMembers: staticMembers,
		methods: methods,
		members: members
	};
};

var extract = function (source, file, options) {
	options = options || {};
	options.nameFilter = function (name) {
		return name[0] !== '_'; // skip 'private' methods
	};

	var fileName = util.getFileName(file);

	var parseOptions = { attachComment: true };
	var tree = esprima.parse(source, parseOptions);

	return extractTree(tree, fileName, options);
};

exports.extract = extract;