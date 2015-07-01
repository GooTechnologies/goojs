(function () {
	'use strict';

	/**
	 * Stringifies a shader type definition (inputs, outputs, body)
	 * @param definition
	 * @returns {string}
	 */
	function stringifyNodeDefinition(definition) {
		var inputs = definition.inputs.map(function (input) {
			return '#input ' + input.type + ' ' + input.name;
		}).join('\n');

		var outputs = definition.outputs.map(function (output) {
			return '#output ' + output.type + ' ' + output.name;
		}).join('\n');

		return inputs + '\n' + outputs + '\n\n' + definition.body;
	}


	/**
	 * Stringifies a shader instance (defines, externals).
	 * Fetches defines from the node type definition if they are not present on the node instance.
	 * @param node
	 * @param definition
	 * @returns {string}
	 */
	function stringifyNodeInstance(node, definition) {
		if (node.type === 'external') {
			return node.external ?
				('#' + node.external.inputType + ' ' + node.external.dataType + ' ' + node.external.name) :
				'';
		} else {
			return Object.keys(definition.defines).map(function (key) {
				if (node.defines[key] !== undefined) {
					return '#define ' + key + ' ' + node.defines[key];
				} else {
					return '#define ' + key + ' ' + definition.defines[key].default;
				}
			}).join('\n');
		}
	}


	var declarationRegex = /^\s*#(\w+)\s+(\w+)\s+([\w\d.-]+)\s*$/;
	var isDeclaration = function (line) {
		return declarationRegex.test(line);
	};

	var isWhite = function (line) {
		return line.trim().length === 0;
	};

	var processDeclaration = function (trimmed) {
		var matching = trimmed.match(declarationRegex);

		return {
			directive: matching[1],
			part1: matching[2],
			part2: matching[3]
		};
	};

	var objMapper = function (map) {
		return function(obj) {
			return Object.keys(map).reduce(function (newObj, key) {
				newObj[map[key]] = obj[key];
				return newObj;
			}, {});
		};
	};

	/**
	 * Parses a node definition given as code (#input ... #output ... body)
	 * @param {string} code
	 * @returns {{inputs: Array, outputs: Array, body: string}}
	 */
	function parseNodeDefinition(code) {
		var lines = code.split('\n');

		var lineCounter = 0;

		// figure out where the declarations end and the body starts
		while (
			(isWhite(lines[lineCounter]) || isDeclaration(lines[lineCounter])) &&
			lineCounter < lines.length - 1
		) {
			lineCounter++;
		}

		var declarations = lines.slice(0, lineCounter - 1)
			.filter(isDeclaration)
			.map(processDeclaration);

		var inputs = declarations.filter(function (declaration) {
			return declaration.directive === 'input';
		}).map(objMapper({ part1: 'type', part2: 'name' }));

		var outputs = declarations.filter(function (declaration) {
			return declaration.directive === 'output';
		}).map(objMapper({ part1: 'type', part2: 'name' }));

		var body = lines.slice(lineCounter).join('\n');

		return {
			inputs: inputs,
			outputs: outputs,
			body: body
		};
	}

	/**
	 * Parses a node definition given as code (#define ... OR #uniform ...)
	 * @param {string} code
	 * @returns Either an external definition or parsed define statements
	 */
	function parseNodeInstance(code) {
		var lines = code.split('\n');

		var declarations = lines
			.filter(isDeclaration)
			.map(processDeclaration);

		// we're only interested in the first entry for now
		// any point in nodes representing more than one external?
		var externals = declarations.filter(function (declaration) {
			return declaration.directive === 'uniform' ||
				declaration.directive === 'attribute' ||
				declaration.directive === 'varying';
		}).map(objMapper({ directive: 'inputType', part1: 'dataType', part2: 'name' }));

		if (externals.length) {
			return {
				type: 'external',
				external: {
					inputType: externals[0].inputType,
					dataType: externals[0].dataType,
					name: externals[0].name
				}
			};
		} else {
			var defines = declarations.filter(function (declaration) {
				return declaration.directive === 'define';
			})
				.map(objMapper({ part1: 'name', part2: 'value' }))
				.reduce(function (defines, entry) {
					defines[entry.name] = entry.value;
					return defines;
				}, {});

			return {
				defines: defines
			};
		}
	}

	return {
		stringifyNodeDefinition: stringifyNodeDefinition,
		stringifyNodeInstance: stringifyNodeInstance,
		parseNodeDefinition: parseNodeDefinition,
		parseNodeInstance: parseNodeInstance
	};
});
