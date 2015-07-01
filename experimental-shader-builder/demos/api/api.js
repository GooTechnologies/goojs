require([
	'shader-bits/core/ShaderBuilder',
	'shader-bits/core/DataNormalizer',
	'shader-bits/data/ContextPair'
], function (
	ShaderBuilder,
	DataNormalizer,
	ContextPair
) {
	'use strict';

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

		return context.structureToJson();
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

		return context.structureToJson();
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

		return context.structureToJson();
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

		return context.structureToJson();
	}

	function getS4(typeDefinitions) {
		var context = new FragmentContext(typeDefinitions);

		var normal = context.createVarying('normal', 'vec3');
		var binormal = context.createVarying('binormal', 'vec3');
		var tangent = context.createVarying('tangent', 'vec3');

		var texCoord0 = context.createVarying('texCoord0', 'vec2');
		var normalMap = context.createUniform('normalMap', 'sampler2D');

		var light0Pos = context.createUniform('light0Pos', 'vec3');
		var light0Color = context.createUniform('light0Color', 'vec3');

		var diffuse = context.createDiffuse2();
		light0Pos.connect(diffuse.position);
		light0Color.connect(diffuse.color);
		normal.connect(diffuse.normal);
		binormal.connect(diffuse.binormal);
		tangent.connect(diffuse.tangent);
		normalMap.connect(diffuse.normalMap);
		texCoord0.connect(diffuse.texCoord0);

		var vec3Comp = context.createVec3Comp();
		diffuse.connect(vec3Comp);

		vec3Comp.x.connect(context.fragColor.r);
		vec3Comp.y.connect(context.fragColor.g);
		vec3Comp.z.connect(context.fragColor.b);

		return {
			structure: context.structureToJson(),
			typeDefinitions: context.typeDefinitions
		};
	}

	function getS5(typeDefintions) {
		var contextPair = new ContextPair(typeDefintions);
		var fragmentContext = contextPair.fragmentContext;

		var texture = getDiffuseTexture(fragmentContext);

		texture.r.connect(fragmentContext.fragColor.r);
		texture.g.connect(fragmentContext.fragColor.g);
		texture.b.connect(fragmentContext.fragColor.b);

		return {
			vertex: {},
			fragment: {
				structure: fragmentContext.structureToJson(),
				typeDefinitions: fragmentContext.typeDefinitions
			}
		};
	}

	function createBasicVertex(context) {
		var viewProjectionMatrix = context.createUniform('viewProjectionMatrix', 'mat4');
		var worldMatrix = context.createUniform('worldMatrix', 'mat4');
		var vertexPosition = context.createAttribute('vertexPosition', 'vec3');

		var mul1 = context.createMul();
		viewProjectionMatrix.connect(mul1.x);
		worldMatrix.connect(mul1.y);

		var vec43 = context.createVec43();
		vec43.w = 1;
		vertexPosition.connect(vec43);

		var mul2 = context.createMulMV();
		mul1.connect(mul2.x);
		vec43.connect(mul2.y);

		mul2.connect(context.position);

		var vertexUV0 = context.createAttribute('vertexUV0', 'vec2');

		var texCoord0 = context.createVarying('texCoord0', 'vec2');

		vertexUV0.connect(texCoord0);
	}

	function getS6(typeDefintions) {
		var contextPair = new ContextPair(typeDefintions);
		var fragmentContext = contextPair.fragmentContext;

		var texture = getDiffuseTexture(fragmentContext);

		texture.connect(fragmentContext.fragColor);

		var vertexContext = contextPair.vertexContext;
		createBasicVertex(vertexContext);

		return {
			vertex: {
				structure: vertexContext.structureToJson(),
				typeDefinitions: vertexContext.typeDefinitions
			},
			fragment: {
				structure: fragmentContext.structureToJson(),
				typeDefinitions: fragmentContext.typeDefinitions
			}
		};
	}

	function getSample(name, callback) {
		$.ajax({
			url: '../../samples/' + name + '/types.json'
		}).done(function (typeDefinitions) {
			// for convenience, writing strings on a single line is not healthy for the mind
			_(typeDefinitions).forEach(function (shaderDefinition) {
				if (shaderDefinition.body instanceof Array) {
					shaderDefinition.body = shaderDefinition.body.join('\n');
				}
			});
			callback(typeDefinitions);
		});
	}

	getSample('s4', function (_typeDefinitions) {
		var typeDefinitions = DataNormalizer.normalizeNodeTypes(_typeDefinitions);
		var pair = getS6(typeDefinitions);

		_replaceBox(pair);
	});

	// crap functions that do the same thing but take in different sort of data
	var __replaceBox = shaderBitsCommon.makeDemo();

	function _replaceBox(pair) {
		var vertexShader = ShaderBuilder.buildShader(pair.vertex.typeDefinitions, pair.vertex.structure);
		var fragmentShader = ShaderBuilder.buildShader(pair.fragment.typeDefinitions, pair.fragment.structure);

		window._vertexShader = vertexShader;
		window._fragmentShader = fragmentShader;

		__replaceBox(fragmentShader, vertexShader);
	}
})();