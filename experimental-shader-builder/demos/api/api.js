(function () {
	'use strict';

	var FunctionNode = shaderBits.FunctionNode;
	var ExternalNode = shaderBits.ExternalNode;
	var IODefinition = shaderBits.IODefinition;
	var Connection = shaderBits.Connection;
	var Structure = shaderBits.Structure;

	function getS1() {
		var structure = new Structure();

		var node1 = new FunctionNode('i1', 'const');
		node1.setDefine('value', "1.0");
		structure.addNode(node1);

		var nodeOut = new FunctionNode('i2', 'out');
		structure.addNode(nodeOut);

		structure.addConnection(node1, new Connection('value', nodeOut.id, 'r'));
		structure.addConnection(node1, new Connection('value', nodeOut.id, 'g'));
		structure.addConnection(node1, new Connection('value', nodeOut.id, 'b'));

		return structure.toJSON();
	}

	function getSample(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(callback);
	}

	getSample('s3', function (_typeDefinitions) {
		var typeDefinitions = dataNormalizer.normalizeNodeTypes(_typeDefinitions);
		var structure = getS1();

		_replaceBox(typeDefinitions, structure);
	});

	// crap functions that do the same thing but take in different sort of data
	var __replaceBox = shaderBitsCommon.makeDemo();

	function _replaceBox(nodeTypes, structure) {
		var result = shaderBits.buildShader(nodeTypes, structure);
		window._result = result;
		__replaceBox(result);
	}

	function replaceBox(typeDefinitions, graph) {
		var structure = graphToStructure.toStructure(graph);

		//var normalizedTypeDefinitions = dataNormalizer.normalizeNodeTypes(data.nodeTypes);
		var _structure = dataNormalizer.normalizeStructure(structure);

		_replaceBox(typeDefinitions, _structure);
	}
})();