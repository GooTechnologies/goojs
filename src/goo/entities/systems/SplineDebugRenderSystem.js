define([
	'goo/entities/EntitySelection',
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/addons/physicspack/util/Pool'
],
function (
	EntitySelection,
	System,
	SystemBus,
	Box,
	Sphere,
	Quaternion,
	Vector3,
	Transform,
	Material,
	ShaderLib,
	Pool
) {
	'use strict';

	var SCALE = 0.1;

	/**
	 * Renders all the SplineComponents in the scene.
	 *
	 * @extends System
	 * @example
	 * world.setSystem(new SplineDebugRenderSystem());
	 */
	function SplineDebugRenderSystem() {
		System.call(this, 'SplineDebugRenderSystem', ['TransformComponent']);

		this.priority = 3;

		this.renderList = [];
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		/**
		 * If set to true, all entities with a ColliderComponent attached are
		 * rendered, and the selection is disregarded.
		 *
		 * @type {Boolean}
		 */
		this.renderAll = true;

		/**
		 * The entities whose splines are to be rendered.
		 *
		 * @type {EntitySelection}
		 */
		this.selection = new EntitySelection();

		this.sphereMeshData = new Sphere(16, 16, 0.5);
		this.boxMeshData = new Box(1, 1, 1);

		this.splineMaterial = new Material(ShaderLib.simpleColored);
		this.splineMaterial.uniforms.color = [0, 0, 1];

		this.centerControlPointMaterial = new Material(ShaderLib.simpleColored);
		this.centerControlPointMaterial.uniforms.color = [0, 1, 1];

		this.controlPointMaterial = new Material(ShaderLib.simpleColored);
		this.controlPointMaterial.uniforms.color = [1, 1, 0];

		this.renderablePool = new Pool({
			create: function () {
				return {
					meshData: null,
					transform: new Transform(),
					materials: []
				};
			},
			init: function (meshData, material) {
				this.meshData = meshData;
				this.materials[0] = material;
			},
			destroy: function (renderable) {
				renderable.meshData = null;
				renderable.materials.length = 0;
			}
		});
	}
	SplineDebugRenderSystem.prototype = Object.create(System.prototype);
	SplineDebugRenderSystem.prototype.constructor = SplineDebugRenderSystem;

	/**
	 * @private
	 * @param  {array} entities
	 */
	SplineDebugRenderSystem.prototype.process = function (entities) {
		this.clear();

		if (this.passive) {
			return;
		}

		for (var i = 0; i < entities.length; ++i) {
			var entity = entities[i];

			// Render selection is enabled, but this entity is not a part of it.
			if (!this.renderAll && !this.selection.contains(entity)) {
				continue;
			}

			// Render the spline control points.
			var splineControlComponent = entity.splineControlComponent;
			if (splineControlComponent) {
				// Before
				if (splineControlComponent.beforePoint) {
					var beforeRenderable = this.renderablePool.get(this.boxMeshData, this.controlPointMaterial);
					beforeRenderable.transform.setIdentity();
					beforeRenderable.transform.translation.setVector(splineControlComponent.beforePoint);
					beforeRenderable.transform.scale.setDirect(SCALE, SCALE, SCALE);
					beforeRenderable.transform.update();
					this.renderList.push(beforeRenderable);
				}

				// Center
				var centerRenderable = this.renderablePool.get(this.sphereMeshData, this.centerControlPointMaterial);
				centerRenderable.transform.setIdentity();
				centerRenderable.transform.translation.setVector(splineControlComponent.centerPoint);
				centerRenderable.transform.scale.setDirect(SCALE, SCALE, SCALE);
				centerRenderable.transform.update();
				this.renderList.push(centerRenderable);

				// After
				if (splineControlComponent.afterPoint) {
					var afterRenderable = this.renderablePool.get(this.boxMeshData, this.controlPointMaterial);
					afterRenderable.transform.setIdentity();
					afterRenderable.transform.translation.setVector(splineControlComponent.afterPoint);
					afterRenderable.transform.scale.setDirect(SCALE, SCALE, SCALE);
					afterRenderable.transform.update();
					this.renderList.push(afterRenderable);
				}
			}

			// Render the spline.
			if (entity.splineComponent) {
				var renderable = this.renderablePool.get(entity.splineComponent.meshData, this.splineMaterial);
				renderable.transform.copy(entity.transformComponent.worldTransform);
				renderable.transform.scale.setDirect(1, 1, 1);
				renderable.transform.update();
				this.renderList.push(renderable);
			}
		}
	};

	/**
	 * @private
	 * @param  {Renderer} renderer
	 */
	SplineDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, null, null, false);
		}
	};

	/**
	 * Release all previous renderables in the renderList
	 * @private
	 */
	SplineDebugRenderSystem.prototype.clear = function () {
		for (var i = 0; i < this.renderList.length; ++i) {
			this.renderablePool.release(this.renderList[i]);
		}
		this.renderList.length = 0;
	};

	/**
	 * @private
	 */
	SplineDebugRenderSystem.prototype.cleanup = function () {
		this.clear();
	};

	SplineDebugRenderSystem.play = function () { this.passive = true; };

	SplineDebugRenderSystem.pause = function () { this.passive = true; };

	SplineDebugRenderSystem.stop = function () { this.passive = false; };

	return SplineDebugRenderSystem;
});