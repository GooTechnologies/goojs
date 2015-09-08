require([
	'shader-bits/core/ShaderBuilder',
	'shader-bits/core/DataNormalizer',
	'shader-bits/Shader'
], function (
	ShaderBuilder,
	DataNormalizer,
	Shader
) {
	'use strict';

	function createVertex(shader) {
		var context = shader.vertexContext;

		var viewProjectionMatrix = shader.setVertexUniform('viewProjectionMatrix', 'mat4', goo.Shader.VIEW_PROJECTION_MATRIX);
		var worldMatrix = shader.setVertexUniform('worldMatrix', 'mat4', goo.Shader.WORLD_MATRIX);
		var vertexPosition = shader.setAttribute('vertexPosition', 'vec3', goo.MeshData.POSITION);

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

		var vertexUV0 = shader.setAttribute('vertexUV0', 'vec2', goo.MeshData.TEXCOORD0);
		var texCoord0 = shader.setVertexVarying('texCoord0', 'vec2');

		vertexUV0.connect(texCoord0);
	}

	function createFragment(shader) {
		var context = shader.fragmentContext;

		var texCoord = shader.setFragmentVarying('texCoord0', 'vec2');
		var diffuse = shader.setFragmentUniform('diffuseMap', 'sampler2D', goo.Shader.DIFFUSE_MAP);

		var texture2D = context.createTexture2D();
		texCoord.connect(texture2D.coords);
		diffuse.connect(texture2D.sampler);

		texture2D.connect(context.fragColor);
	}

	function getS1(typeDefinitions) {
		var shader = new Shader(typeDefinitions);

		createVertex(shader);
		createFragment(shader);

		return shader.compileDefinition();
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
		var shaderDefinition = getS1(typeDefinitions);

		replaceBox(shaderDefinition);
	});

	function replaceBox(shaderDefinition) {
		var gooRunner = v.initGoo();
		var world = gooRunner.world;
		v.addOrbitCamera(new goo.Vector3(5, Math.PI / 2, 0));

		var textureCreator = new goo.TextureCreator();

		textureCreator.loadTexture2D('../../../visual-test/resources/check-alt.png', { anisotropy: 16 })
			.then(function (diffuseMap) {
				material.setTexture('DIFFUSE_MAP', diffuseMap);
			});

		textureCreator.loadTexture2D('../../../visual-test/resources/normal-map2.jpg', { anisotropy: 16 })
			.then(function (normalMap) {
				material.setTexture('NORMAL_MAP', normalMap);
			});

		var meshData = new goo.Box();
		goo.TangentGenerator.addTangentBuffer(meshData);

		var material = new goo.Material(shaderDefinition);

		world.createEntity(meshData, material).addToWorld();
	}
});