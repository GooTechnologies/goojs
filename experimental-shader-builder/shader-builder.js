(function () {
	'use strict';

	function sort(graph) {
		var unvisited = new Set(graph.keys());
		var visited = new Set();
		var order = [];

		function df(nodeId) {
			if (visited.has(nodeId)) {
				return;
			}

			visited.add(nodeId);
			unvisited.delete(nodeId);

			graph.get(nodeId).outputsTo.filter(function (output) {
				return output.to !== '_';
			}).forEach(function (output) {
				df(output.to);
			});

			order.push(graph.get(nodeId));
		}

		while (unvisited.size) {
			df(unvisited.values().next().value);
		}

		return order;
	}

	// just converts a structure (array) to an map (id -> node)
	function toGraph(structure) {
		var graph = new Map();

		structure.forEach(function (node) {
			graph.set(node.id, node);
		});

		return graph;
	}

	// nodes are sorted
	function generateCode(nodeTypes, nodes) {
		function getInputVar(nodeId, varName) {
			return 'inp_' + nodeId + '_' + varName;
		}

		var stringifiedExternals = nodes.filter(function (node) {
			return node.externalInputs;
		}).map(function (node) {
			return node.externalInputs.map(function (externalInput) {
				return 'uniform ' + externalInput.type + ' ' + externalInput.externalName + ';';
			}).join('\n');
		}).join('\n');

		function isExternalInput(node, inputName) {
			if (!node.externalInputs) { return true; }

			return !node.externalInputs.some(function (externalInput) {
				return externalInput.externalName !== inputName;
			});
		}

		// declare the inputs of all nodes
		var copyIn = nodes.map(function (node) {
			var nodeDefinition = nodeTypes[node.type];

			return nodeDefinition.inputs.filter(function (input) {
				return isExternalInput(input.name);
			}).map(function (input) {
				return input.type + ' ' + getInputVar(node.id, input.name) + ';';
			}).join('\n');
		}).join('\n');

		var stringifiedNodes = nodes.map(function (node) {
			var nodeDefinition = nodeTypes[node.type];


			// declare outputs of the node
			var outputDeclarations;
			if (nodeDefinition.outputs) {
				outputDeclarations = nodeDefinition.outputs.map(function (output) {
					return '\t' + output.type + ' ' + output.name + ';';
				}).join('\n');
			} else {
				outputDeclarations = '';
			}


			// copy the outputs of this node to the inputs of the next node
			var copyOut = node.outputsTo.map(function (outputTo) {
				return '\t' + getInputVar(outputTo.to, outputTo.input) +
					' = ' + outputTo.output + ';';
			}).join('\n');


			// process inputs (from other shader's outputs)
			var processedBody = nodeDefinition.inputs.filter(function (input) {
				return isExternalInput(node, input.name);
			}).reduce(function (partial, input) {
				// should do a tokenization of the shader coder instead
				// this regex will fail for comments, strings
				return partial.replace(
					new RegExp('\\b' + input.name + '\\b', 'g'),
					getInputVar(node.id, input.name)
				);
			}, nodeDefinition.body);


			// process external inputs (direct uniforms)
			if (node.externalInputs) {
				processedBody = node.externalInputs.reduce(function (partial, input) {
					// should do a tokenization of the shader code instead
					// this regex will fail for comments, strings
					return partial.replace(
						new RegExp('\\b' + input.name + '\\b', 'g'),
						input.externalName
					);
				}, processedBody);
			}

			return '// node ' + node.id + ', ' + node.type + '\n' +
				'{\n' +
				outputDeclarations + '\n' +
				'\t' + processedBody + '\n'
				+ copyOut +
				'\n}\n';
		}).join('\n');

		return stringifiedExternals + '\n\nvoid main(void) {\n' +
			copyIn + '\n' +
			stringifiedNodes + '\n' +
			'}';
	}

	function buildShader(types, structure) {
		var graph = toGraph(structure);
		var sorted = sort(graph);
		sorted.reverse(); // easier to reverse this than to invert the graph
		return generateCode(types, sorted);
	}

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.buildShader = buildShader;
})();