define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shaders/ShaderFragment',
	'goo/math/Matrix3',
	'goo/math/Matrix4',
	'goo/math/Vector2',
	'goo/renderer/MeshData',
	'goo/renderer/Shader'
], function (
	System,
	SystemBus,
	SimplePartitioner,
	Material,
	ShaderLib,
	ShaderFragment,
	Matrix3,
	Matrix4,
	Vector2,
	MeshData,
	Shader
) {
	'use strict';

	/**
	 * Renders transform gizmos<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/util/TransformGizmos/TransformGizmos-vtest.html Working example
	 * @property {boolean} doRender Only render if set to true
	 * @extends System
	 */
	function PipRenderSystem(renderSystem) {
		System.call(this, 'PipRenderSystem', null);

		this.renderSystem = renderSystem;

		this.renderables = [];
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));
	}

	PipRenderSystem.prototype = Object.create(System.prototype);
	PipRenderSystem.prototype.constructor = PipRenderSystem;

	PipRenderSystem.prototype.render = function (renderer) {
		renderer.updateShadows(this.renderSystem.partitioner, this.renderSystem.entities, this.renderSystem.lights);

		for (var i = 0; i < this.renderSystem.preRenderers.length; i++) {
			var preRenderer = this.renderSystem.preRenderers[i];
			preRenderer.process(renderer, this.renderSystem.entities, this.renderSystem.partitioner, this.camera, this.renderSystem.lights);
		}

		this.renderSystem.partitioner.process(this.camera, this.renderSystem.entities, this.renderList);

		if (this.renderSystem.composers.length > 0) {
			for (var i = 0; i < this.renderSystem.composers.length; i++) {
				var composer = this.renderSystem.composers[i];
				composer.render(renderer, this.renderSystem.currentTpf, this.camera, this.renderSystem.lights, null, true);
			}
		} else {
			var overrideMaterial = null;
			renderer.render(this.renderList, this.camera, this.renderSystem.lights, target, true, overrideMaterial);
		}
	};

	return PipRenderSystem;
});