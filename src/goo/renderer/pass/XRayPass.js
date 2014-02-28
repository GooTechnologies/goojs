define([
	'goo/renderer/Material',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util'
],
/** @lends */
function (
	Material,
	FullscreenUtil,
	RenderTarget,
	ShaderLib,
	Util
) {
	"use strict";

	/** @class */
	function XRayPass(settings, renderSystem, exclude) {

		this.clear = [0, 0, 0, 0];
		settings = settings || {};
		var width = settings.width !== undefined ? settings.width : 1920;
		var height = settings.height !== undefined ? settings.height : 1080;

		this.renderSystem = renderSystem;
		this.exclude = exclude;

		this.material = Material.createMaterial(ShaderLib.xray);
		this.useReadBuffer = true;

		this.renderToScreen = false;

		this.renderable = {
			meshData: FullscreenUtil.quad,
			materials: [this.material]
		};

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;

		this.mousePos = [500, 500];
		var that = this;
		function mouseMove(event) {
			that.mousePos[0] = event.clientX;
			that.mousePos[1] = 900-event.clientY;
		}
		window.onmousemove = mouseMove;

		var wireframeShader = Util.clone(ShaderLib.uber);
		//wireframeShader.fshader = Util.clone(ShaderLib.simpleLit.fshader);
		this.wireframeMaterial = Material.createMaterial(wireframeShader, 'wireframeMaterial');
		//this.wireframeMaterial.wireframe = true;

		this.xRayShaded = new RenderTarget(width, height);

	}

	XRayPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		this.material.shader.uniforms.mousePos = this.mousePos;


		var renderList = this.renderSystem.renderList;
		var oldMeshData = [];
		for (var i=0; i<renderList.length; i++) {
			var meshData = renderList[i].meshDataComponent.meshData;
			oldMeshData[i] = meshData;
			if (!meshData.wireframeData) {
				meshData.wireframeData = meshData.buildWireframeData();
			}
			if (this.exclude.indexOf(renderList[i].name) == -1) {
				renderList[i].meshDataComponent.meshData = meshData.wireframeData;
			}
		}

		renderer.render(renderList, 
			this.renderSystem.camera,
			this.renderSystem.lights,
			this.xRayShaded,
			true,
			this.wireframeMaterial);

		for (var i=0; i<renderList.length; i++) {
			renderList[i].meshDataComponent.meshData = oldMeshData[i];
		}

		this.material.setTexture('FULL_SHADED', readBuffer);
		this.material.setTexture('X_RAY', this.xRayShaded);

		// Render result
		if (this.renderToScreen) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
		}
	};

	return XRayPass;
});