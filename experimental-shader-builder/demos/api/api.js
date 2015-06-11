(function () {
	'use strict';

	var Context = shaderBits.Context;

	function getS1(typeDefinitions) {
		var context = new Context(typeDefinitions);

		var time = context.createUniform('time', 'float');

		var sine = context.createSin01();
		sine.multiplier = 10;

		var one = context.createConst();
		one.const = 1;

		time.connect(sine);

		sine.connect(context.out.r);
		one.connect(context.out.g);
		// 0 -> b

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
})();