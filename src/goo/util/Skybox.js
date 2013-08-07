define([
	'goo/shapes/ShapeCreator',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/Entity',
	'goo/renderer/TextureCreator',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/ScriptComponent'

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
	ScriptComponent
) {
	'use strict';

	function Skybox(world, cameraEntity, type, images) {
		Entity.call(this, world, 'Skybox');
		this._cameraPos = cameraEntity.transformComponent.transform.translation;
		var meshData, texture;
		if (type === Skybox.SPHERE) {
			meshData = ShapeCreator.createSphere(10, 10, 1, Sphere.TextureModes.Projected);
			if (images instanceof Array) {
				images = images[0];
			}
			texture = new TextureCreator().loadTexture2D(images);
		} else if (type === Skybox.BOX) {
			meshData = ShapeCreator.createBox(1, 1, 1);
			texture = new TextureCreator().loadTextureCube(images);
		} else {
			throw new Error('Unknown geometry type');
		}

		var tfc = new TransformComponent();
		tfc.transform.scale.scale(100);
		if(type === Skybox.SPHERE) {
			tfc.transform.setRotationXYZ(-Math.PI/2, 0, 0);
		}

		var parent = cameraEntity.transformComponent.parent;
		if (parent) {
			parent.attachChild(tfc);
		}
		this.setComponent(tfc);
		this.setComponent(new MeshDataComponent(meshData));

		var mrc = new MeshRendererComponent();
		var material = Material.createMaterial(shaders[type], 'Skybox material');

		material.setTexture(Shader.DIFFUSE_MAP, texture);
		material.cullState.cullFace = 'Front';
		material.depthState.enabled = false;
		material.renderQueue = 0;

		mrc.materials[0] = material;
		mrc.cullMode = 'Never';

		this.setComponent(mrc);

		this.setComponent(
			new ScriptComponent({
				run: function(entity) {
					entity.transformComponent.transform.translation.setv(this._cameraPos);
					entity.transformComponent.setUpdated();
				}.bind(this)
			})
		);
	}

	Skybox.prototype = Object.create(Entity.prototype);


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
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [ //
			'attribute vec3 vertexPosition;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //

			'varying vec3 eyeVec;',//

			'void main(void) {', //
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //
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
			// ' gl_FragColor = vec4(1.0,0.0,0.0,1.0);',//
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
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//
			'uniform vec3 cameraPosition;', //

			'varying vec2 texCoord0;',
			'varying vec3 eyeVec;',//

			'void main(void) {', //
			'	texCoord0 = vertexUV0;',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
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