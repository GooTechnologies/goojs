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

	function getDiffuseLight(context) {
		var one = context.createConst();
		one.const = 1;

		var vec3 = context.createVec3();

		one.connect(vec3.x);
		one.connect(vec3.y);
		one.connect(vec3.z);

		var normal = context.createVarying('normal', 'vec3');

		var dot = context.createDot();
		dot.multiplier = 0.7;

		vec3.connect(dot.x);

		normal.connect(dot.y);

		return dot;
	}

	function getDiffuseTexture(context) {
		var texCoord = context.createVarying('texCoord0', 'vec2');
		var diffuse = context.createUniform('diffuseMap', 'sampler2D');

		var texture2D = context.createTexture2D();
		texCoord.connect(texture2D.coords);
		diffuse.connect(texture2D.sampler);

		return texture2D;
	}

	function getS2(typeDefinitions) {
		var context = new Context(typeDefinitions);

		var light = getDiffuseLight(context);
		var texture = getDiffuseTexture(context);

		// epic code!
		var mul1 = context.createMul();
		light.connect(mul1.x);
		texture.r.connect(mul1.y);
		mul1.connect(context.out.r);

		var mul2 = context.createMul();
		light.connect(mul2.x);
		texture.g.connect(mul2.y);
		mul2.connect(context.out.g);

		var mul3 = context.createMul();
		light.connect(mul3.x);
		texture.b.connect(mul3.y);
		mul3.connect(context.out.b);

		return context.structureToJSON();
	}

	function getS3(typeDefinitions) {
		var context = new Context(typeDefinitions);

		var normal = context.createVarying('normal', 'vec3');

		var light0Pos = context.createUniform('light0Pos', 'vec3');
		var light0Color = context.createUniform('light0Color', 'vec3');

		var diffuse0 = context.createDiffuse();
		light0Pos.connect(diffuse0.position);
		light0Color.connect(diffuse0.color);
		normal.connect(diffuse0.normal);

		var light1Pos = context.createUniform('light1Pos', 'vec3');
		var light1Color = context.createUniform('light1Color', 'vec3');

		var diffuse1 = context.createDiffuse();
		light1Pos.connect(diffuse1.position);
		light1Color.connect(diffuse1.color);
		normal.connect(diffuse1.normal);

		var add = context.createAdd();
		diffuse0.connect(add.x);
		diffuse1.connect(add.y);

		var vec3Comp = context.createVec3Comp();
		add.connect(vec3Comp);

		vec3Comp.x.connect(context.out.r);
		vec3Comp.y.connect(context.out.g);
		vec3Comp.z.connect(context.out.b);

		return context.structureToJSON();
	}

	function getSample(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(callback);
	}

	getSample('s4', function (_typeDefinitions) {
		var typeDefinitions = dataNormalizer.normalizeNodeTypes(_typeDefinitions);
		var structure = getS3(typeDefinitions);

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