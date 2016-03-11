
	'use strict';

	V.describe([
		'Tests that cubemaps with mipmaps works with typed array images. Should display two spheres with checkerboard reflections (left using images and right using arrays).'
	].join('\n'));

	var cubemapShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			near: Shader.NEAR_PLANE,
			diffuseMap: 'DIFFUSE_MAP'
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 eyeVec;',
			'varying vec3 normal;',

			'void main(void) {',
				'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
				'gl_Position = projectionMatrix * viewMatrix * worldPos;',
				'normal = vertexNormal;',
				'eyeVec = worldPos.xyz - cameraPosition;',
			'}'
		].join('\n'),
		fshader: [
			'precision mediump float;',

			'uniform samplerCube diffuseMap;',

			'varying vec3 eyeVec;',
			'varying vec3 normal;',

			'void main(void) {',
				'vec3 reflectionVector = reflect(normalize(eyeVec), normal);',
				'reflectionVector.yz = -reflectionVector.yz;',
				'gl_FragColor = textureCube(diffuseMap, reflectionVector);',
			'}'
		].join('\n')
	};

	function createSphereEntity(texture) {
		var meshData = new Sphere(16, 16, 1);
		var material = new Material(cubemapShader);

		material.setTexture('DIFFUSE_MAP', texture);

		var entity = world.createEntity(meshData, material);

		return entity;
	}

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var settings = {};

	// Images with checkerboard pattern
	var images = [
		'../../../../resources/check.png',
		'../../../../resources/check-alt.png',
		'../../../../resources/check.png',
		'../../../../resources/check-alt.png',
		'../../../../resources/check.png',
		'../../../../resources/check-alt.png'
	];
	new TextureCreator().loadTextureCube(images, settings).then(function (texture) {
		var sphereEntity = createSphereEntity(texture);
		sphereEntity.setTranslation(-1.5, 0, 0).addToWorld();
	});

	// Typed array checkerboard of same size as above images
	var size = 256;
	var tiles = 4;
	var tileSize = size / tiles;
	var imageData = [];
	for (var x = 0; x < tiles; x++) {
		for (var y = 0; y < tiles; y++) {
			var r = Math.floor(MathUtils.fastRandom() * 255);
			var g = Math.floor(MathUtils.fastRandom() * 255);
			var b = Math.floor(MathUtils.fastRandom() * 255);
			for (var xx = 0; xx < tileSize; xx++) {
				for (var yy = 0; yy < tileSize; yy++) {
					var index = (y * tileSize + yy) * size + (x * tileSize + xx);
					imageData[index * 4 + 0] = r;
					imageData[index * 4 + 1] = g;
					imageData[index * 4 + 2] = b;
					imageData[index * 4 + 3] = 255;
				}
			}
		}
	}
	var image = new Uint8Array(imageData);
	for (var i = 0; i < 6; i++) {
		images[i] = image;
	}
	var texture = new Texture(images, settings, size, size);
	texture.variant = 'CUBE';
	var sphereEntity = createSphereEntity(texture);
	sphereEntity.setTranslation(1.5, 0, 0).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(10, Math.PI / 2, 0), new Vector3(0, 0.5, 0));

	V.process();
});