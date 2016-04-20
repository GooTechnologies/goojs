var Box = require('../shapes/Box');
var Sphere = require('../shapes/Sphere');
var MeshData = require('../renderer/MeshData');
var Material = require('../renderer/Material');
var Shader = require('../renderer/Shader');
var TextureCreator = require('../renderer/TextureCreator');
var Transform = require('../math/Transform');

/**
 * Skybox
 * @param type
 * @param images
 * @param textureMode
 * @param yRotation
 */
function Skybox(type, images, textureMode, yRotation) {
	var promise;
	if (type === Skybox.SPHERE) {
		this.meshData = new Sphere(16, 32, 1, textureMode || Sphere.TextureModes.Projected);
		if (images instanceof Array) {
			images = images[0];
		}
		if (images) {
			promise = new TextureCreator().loadTexture2D(images);
		}
	} else if (type === Skybox.BOX) {
		this.meshData = new Box(1, 1, 1);
		if (images.length) {
			promise = new TextureCreator().loadTextureCube(images, {
				flipY: false,
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			});
		}
	} else {
		throw new Error('Unknown geometry type');
	}

	var material = new Material(shaders[type], 'Skybox material');
	material.cullState.cullFace = 'Front';
	material.depthState.enabled = false;
	material.renderQueue = 1;
	if (promise) {
		promise.then(function (texture) {
			material.setTexture(Shader.DIFFUSE_MAP, texture);
		});
	}

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
		normalMatrix: Shader.NORMAL_MATRIX,
		viewMatrix: Shader.VIEW_MATRIX,
		projectionMatrix: Shader.PROJECTION_MATRIX,
		near: Shader.NEAR_PLANE,
		diffuseMap: Shader.DIFFUSE_MAP
	},
	vshader: [
		'attribute vec3 vertexPosition;',

		'uniform mat3 normalMatrix;',
		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform float near;',

		'varying vec3 eyeVec;',

		'void main(void) {',
		'	eyeVec = vertexPosition * normalMatrix * near * 10.0;',
		'	vec3 worldPos = mat3(viewMatrix) * eyeVec;',
		'	gl_Position = projectionMatrix * vec4(worldPos, 1.0);',
		'}'
	].join('\n'),
	fshader: [
		'uniform samplerCube diffuseMap;',

		'varying vec3 eyeVec;',

		'void main(void) {',
		'	vec4 cube = textureCube(diffuseMap, eyeVec);',
		'	if (cube.a < 0.05) discard;',
		'	gl_FragColor = cube;',
		'}'
	].join('\n')
};
shaders.sphere = {
	attributes: {
		vertexPosition: MeshData.POSITION,
		vertexUV0: MeshData.TEXCOORD0
	},
	uniforms: {
		normalMatrix: Shader.NORMAL_MATRIX,
		viewMatrix: Shader.VIEW_MATRIX,
		projectionMatrix: Shader.PROJECTION_MATRIX,
		near: Shader.NEAR_PLANE,
		diffuseMap: Shader.DIFFUSE_MAP
	},
	vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat3 normalMatrix;',
		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform float near;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',

		'	vec3 worldPos = mat3(viewMatrix) * normalMatrix * vertexPosition * near * 10.0;',
		'	gl_Position = projectionMatrix * vec4(worldPos, 1.0);',
		'}'
	].join('\n'),
	fshader: [
		'precision mediump float;',

		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec4 sphere = texture2D(diffuseMap, texCoord0);',
		'	if (sphere.a < 0.05) discard;',
		'	gl_FragColor = sphere;',
		'}'
	].join('\n')
};

module.exports = Skybox;