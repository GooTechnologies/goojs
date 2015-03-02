'use strict';

var esprima = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');



function buildCall(id) {
	return {
		type: 'ExpressionStatement',
		expression: {
			type: 'CallExpression',
			callee: {
				type: 'Identifier',
				name: '__touch'
			},
			arguments: [{
				type: 'Literal',
				value: id,
				raw: id + ''
			}]
		}
	};
}

function instrument(originalSource, previousEntries) {
	var parsed = esprima.parse(originalSource, { range: true, loc: true });

	var idCounter = previousEntries || 0;
	var mapping = [];

	function insert(node, parent) {
		if (node.type === 'Program' || node.type === 'BlockStatement') {

			var newBody = [];
			node.body.forEach(function (statement) {
				newBody.push(statement);

				if (statement.type !== 'IfStatement' && statement.type !== 'ForStatement') {
					newBody.push(buildCall(idCounter));

					mapping.push({
						line: statement.loc.start.line,
						range: statement.range
					});
					idCounter++;
				}
			});

			node.body = newBody;
		}
	}

	estraverse.traverse(parsed, {
		enter: insert
	});

	return {
		source: escodegen.generate(parsed),
		mapping: mapping
	};
}

exports.instrument = instrument;