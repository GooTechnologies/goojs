var System = require('../../entities/systems/System');
var SystemBus = require('../../entities/SystemBus');
var MeshData = require('../../renderer/MeshData');
var Shader = require('../../renderer/Shader');
var Quad = require('../../shapes/Quad');
var RenderTarget = require('../../renderer/pass/RenderTarget');
var Material = require('../../renderer/Material');
var ShaderLib = require('../../renderer/shaders/ShaderLib');
var FullscreenPass = require('../../renderer/pass/FullscreenPass');
var FullscreenUtils = require('../../renderer/pass/FullscreenUtils');

/**
 * Renders transform gizmos<br>
 * @example-link http://code.gooengine.com/latest/visual-test/goo/util/TransformGizmos/TransformGizmos-vtest.html Working example
 * @property {boolean} doRender Only render if set to true
 * @extends System
 */
function PipRenderSystem(renderSystem) {
	System.call(this, 'PipRenderSystem', null);

	this.renderSystem = renderSystem;

	this.target = new RenderTarget(512, 512);

	this.outPass = new FullscreenPass(ShaderLib.copy);
	var that = this;
	this.outPass.render = function (renderer, writeBuffer, readBuffer) {
		this.material.setTexture('DIFFUSE_MAP', readBuffer);
		renderer.render(this.renderable, FullscreenUtils.camera, [], that.target, true);
	};

	var material = new Material(renderPipQuad);
	material.setTexture('DIFFUSE_MAP', this.target);
	this.quad = new Quad(1, 1);
	this.aspect = null;
	this.width = null;
	this.height = null;
	this.renderableQuad = {
		meshData: this.quad,
		materials: [material]
	};

	this.renderList = [];
	this.usePostEffects = false;
	this.camera = null;
	this.size = null;
	this.dirty = false;

	SystemBus.addListener('goo.setPipCamera', function (newCam) {
		this.camera = newCam.camera;
		this.usePostEffects = newCam.usePostEffects !== undefined ? newCam.usePostEffects : false;
		this.dirty = true;
	}.bind(this));

	this._viewportResizeHandler = function (size) {
		this.size = size;
		this.dirty = true;
	}.bind(this);

	SystemBus.addListener('goo.viewportResize', this._viewportResizeHandler, true);
}

PipRenderSystem.prototype = Object.create(System.prototype);
PipRenderSystem.prototype.constructor = PipRenderSystem;

PipRenderSystem.prototype.updateQuad = function (quad, x, y, width, height) {
	quad.getAttributeBuffer(MeshData.POSITION).set([
		x, y, 0,
		x, y + height, 0,
		x + width, y + height, 0,
		x + width, y, 0
	]);
	quad.setVertexDataUpdated();
};

PipRenderSystem.prototype.render = function (renderer) {
	if (!this.camera || !this.size) {
		return;
	}

	this.renderer = renderer;

	if (this.dirty) {
		this.dirty = false;
		renderer.checkResize(this.camera, true);
	}

	var aspect = this.camera.aspect;
	var height = this.size.height * 0.2;
	var width = height * aspect;

	if (aspect !== this.aspect || width !== this.width || height !== this.height) {
		this.aspect = aspect;
		this.width = width;
		this.height = height;

		this.updateQuad(this.quad, 10, 10, width, height);
	}

	renderer.updateShadows(this.renderSystem.partitioner, this.renderSystem.entities, this.renderSystem.lights);

	for (var i = 0; i < this.renderSystem.preRenderers.length; i++) {
		var preRenderer = this.renderSystem.preRenderers[i];
		preRenderer.process(renderer, this.renderSystem.entities, this.renderSystem.partitioner, this.camera, this.renderSystem.lights);
	}

	this.renderSystem.partitioner.process(this.camera, this.renderSystem.entities, this.renderList);

	if (this.usePostEffects && this.renderSystem.composers.length > 0) {
		var composer = this.renderSystem.composers[0];

		var index = composer.passes.length - 1;

		var savedPass = composer.passes[index];
		composer.passes[index] = this.outPass;

		composer.render(renderer, this.renderSystem.currentTpf, this.camera, this.renderSystem.lights, null, true);

		composer.passes[index] = savedPass;
	} else {
		var overrideMaterial = null;
		renderer.render(this.renderList, this.camera, this.renderSystem.lights, this.target, true, overrideMaterial);
	}

	renderer.render(this.renderableQuad, FullscreenUtils.camera, [], null, false);
};

var renderPipQuad = {
	defines: {
		EDGE: true
	},
	attributes: {
		vertexPosition: MeshData.POSITION,
		vertexUV0: MeshData.TEXCOORD0
	},
	uniforms: {
		viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
		worldMatrix: Shader.WORLD_MATRIX,
		diffuseMap: Shader.DIFFUSE_MAP,
		resolution: Shader.RESOLUTION
	},
	vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform vec2 resolution;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'  texCoord0 = vertexUV0;',

		'  gl_Position = vec4(',
		'    2.0 * vertexPosition.x / resolution.x - 1.0,',
		'    2.0 * vertexPosition.y / resolution.y - 1.0,',
		'    -1.0,',
		'    1.0',
		'  );',
		'}'
	].join('\n'),
	fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform vec2 resolution;',

		'varying vec2 texCoord0;',
		'const vec4 edgeCol = vec4(0.2, 0.2, 0.2, 1.0);',

		'void main(void) {',
		'  vec4 color = texture2D(diffuseMap, texCoord0);',
		'  #ifdef EDGE',
		'  float edge = step(10.0 / resolution.x, min(texCoord0.x, 1.0 - texCoord0.x)) * step(10.0 / resolution.y, min(texCoord0.y, 1.0 - texCoord0.y));',
		'  gl_FragColor = mix(edgeCol, color, edge);',
		'  #else',
		'  gl_FragColor = color;',
		'  #endif',
		'}'
	].join('\n')
};

module.exports = PipRenderSystem;
