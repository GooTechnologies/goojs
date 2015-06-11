(function () {
	'use strict';

	var Context = shaderBits.Context;

	function getS1(typeDefinitions) {
		var context = new Context(typeDefinitions);

		var node1 = context.createConst();
		node1.const = '1.0';

		node1.value.connect(context.out.r);
		node1.value.connect(context.out.g);
		node1.value.connect(context.out.b);

		return context.structureToJSON();
	}

	function getSample(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(callback);
	}

	getSample('s4', function (_typeDefinitions) {
		var typeDefinitions = dataNormalizer.normalizeNodeTypes(_typeDefinitions);
		var structure = getS1(typeDefinitions);

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