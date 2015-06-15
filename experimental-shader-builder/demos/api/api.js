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

	function getS2(typeDefinitions) {
		var context = new Context(typeDefinitions);

		var one = context.createConst();
		one.const = 1;

		var vertexNormal = context.createVarying('normal', 'vec3');

		var vec3 = context.createVec3();

		var dot = context.createDot();
		dot.multiplier = 0.5;

		one.connect(vec3.x);
		one.connect(vec3.y);
		one.connect(vec3.z);

		vec3.connect(dot.x);

		vertexNormal.connect(dot.y);

		dot.connect(context.out.r);
		dot.connect(context.out.g);
		dot.connect(context.out.b);

		return context.structureToJSON();
	}

	function getSample(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(callback);
	}

	getSample('s4', function (_typeDefinitions) {
		var typeDefinitions = dataNormalizer.normalizeNodeTypes(_typeDefinitions);
		var structure = getS2(typeDefinitions);

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