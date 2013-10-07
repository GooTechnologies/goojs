define([
	'goo/shapes/ShapeCreator',
	'goo/shapes/Sphere',
	'goo/entities/components/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/Entity',
	'goo/renderer/TextureCreator',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/entities/components/ScriptComponent',
	'goo/math/Transform'

], /** @lends */ function (
	ShapeCreator,
	Sphere,
	MeshData,
	Material,
	Shader,
	Entity,
	TextureCreator,
	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	ScriptComponent,
	Transform
) {
	'use strict';

	function Skybox(type, images, textureMode, yRotation) {
		var texture;
		if (type === Skybox.SPHERE) {
			this.meshData = ShapeCreator.createSphere(48, 48, 1, textureMode || Sphere.TextureModes.Projected);
			if (images instanceof Array) {
				images = images[0];
			}
			if(images) {
				texture = new TextureCreator().loadTexture2D(images);
			}
		} else if (type === Skybox.BOX) {
			this.meshData = ShapeCreator.createBox(1, 1, 1);
			if (images.length) {
				texture = new TextureCreator().loadTextureCube(images);
			}
		} else {
			throw new Error('Unknown geometry type');
		}
		var material = Material.createMaterial(shaders[type], 'Skybox material');

		material.setTexture(Shader.DIFFUSE_MAP, texture);

		material.cullState.cullFace = 'Front';
		material.depthState.enabled = false;

		material.renderQueue = 1;

		this.materials = [material];
		this.transform = new Transform();
		var xAngle = (type === Skybox.SPHERE) ? Math.PI / 2 : 0;
		this.transform.rotation.fromAngles(xAngle, yRotation, 0);
		this.transform.update();
		this.active = true;
	}

	Skybox.SPHERE = 'sphere';
	Skybox.BOX = 'box';

	var shaders = {};
	shaders.box = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			near: Shader.NEAR_PLANE,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [ //
			'attribute vec3 vertexPosition;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //
			'uniform float near;',

			'varying vec3 eyeVec;',//

			'void main(void) {', //
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition * near * 10.0, 1.0);', //
			' worldPos += vec4(cameraPosition, 0.0);',
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //
			' eyeVec.x = -eyeVec.x;',
			' eyeVec = (worldMatrix * vec4(eyeVec, 0.0)).xyz;',
			'}'//
		].join('\n'),
		fshader: [//
			'precision mediump float;',//

			'uniform samplerCube diffuseMap;',//

			'varying vec3 eyeVec;',//

			'void main(void)',//
			'{',//
			'	vec4 cube = textureCube(diffuseMap, eyeVec);',//
			'	gl_FragColor = cube;',//
			 //' gl_FragColor = vec4(1.0,0.0,0.0,1.0);',//
			'}'//
		].join('\n')
	};
	shaders.sphere = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			near: Shader.NEAR_PLANE,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //
			'uniform float near;',

			'varying vec2 texCoord0;',
			'varying vec3 eyeVec;',//

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',
			' texCoord0.y = 1.0 - texCoord0.y;',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition * near * 10.0, 1.0);', //
			' worldPos += vec4(cameraPosition, 0.0);',
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //
			'}'//
		].join('\n'),
		fshader: [//
			'precision mediump float;',

			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
			'}'//
		].join('\n')
	};



	return Skybox;
});