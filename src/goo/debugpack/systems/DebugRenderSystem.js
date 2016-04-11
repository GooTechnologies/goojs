var System = require('../../entities/systems/System');
var SystemBus = require('../../entities/SystemBus');
var DebugDrawHelper = require('../../debugpack/DebugDrawHelper');

/**
 * Renders entities/renderables using a configurable partitioner for culling
 * @property {boolean} doRender Only render if set to true
 * @extends System
 */
function DebugRenderSystem() {
	System.call(this, 'DebugRenderSystem', ['TransformComponent']);

	this._renderablesTree = {};
	this.renderList = [];
	this.preRenderers = []; // unused
	this.composers = []; // unused
	this.doRender = {
		CameraComponent: false,
		LightComponent: false,
		MeshRendererComponent: false,
		SkeletonPose: false
	};
	this.inserted();

	this._interestComponents = [
		'CameraComponent',
		'LightComponent'
		//'MeshRendererComponent'
	];

	this.camera = null;
	this.lights = [];
	this.currentTpf = 0.0;
	this.scale = 20;

	this.cameraListener = function (newCam) {
		this.camera = newCam.camera;
	}.bind(this);

	this.lightsListener = function (lights) {
		this.lights = lights;
	}.bind(this);

	this.selectionRenderable = DebugDrawHelper.getRenderablesFor({ type: 'MeshRendererComponent' });
	this.selectionActive = false;
	this.oldSelectionActive = false;
}

DebugRenderSystem.prototype = Object.create(System.prototype);
DebugRenderSystem.prototype.constructor = DebugRenderSystem;

DebugRenderSystem.prototype.setup = function () {
	SystemBus.addListener('goo.setCurrentCamera', this.cameraListener);
	SystemBus.addListener('goo.setLights', this.lightsListener);
};

DebugRenderSystem.prototype.deleted = function (entity) {
	delete this._renderablesTree[entity.id];
};

DebugRenderSystem.prototype.process = function (entities, tpf) {
	var count = this.renderList.length = 0;
	var renderables;
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		for (var j = 0, max = this._interestComponents.length; j < max; j++) {
			var componentName = this._interestComponents[j];
			if (!entity._hidden && entity.hasComponent(componentName)) {
				var component = entity.getComponent(componentName);

				// Don't debug components that have been marked.
				if (component.debugLevel === 'none') {
					continue;
				}

				var options = { full: this.doRender[componentName] || component.debugLevel === 'full' };
				var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};

				if (tree[componentName] && ((tree[componentName].length === 2 && options.full) || (tree[componentName].length === 1 && !options.full))) {
					renderables = tree[componentName];
				} else {
					renderables = DebugDrawHelper.getRenderablesFor(component, options);
					for (var k = 0; k < renderables.length; k++) {
						var renderable = renderables[k];
						renderable.id = entity.id;
						renderable._index = entity._index;
					}
					tree[componentName] = renderables;
				}

				for (var k = 0; k < renderables.length; k++) {
					var renderable = renderables[k];
					renderable.transform.translation.set(entity.transformComponent.sync().worldTransform.translation);
					renderable.transform.rotation.copy(entity.transformComponent.sync().worldTransform.rotation);
					renderable.transform.scale.setDirect(1, 1, 1);
					renderable.transform.update();
				}
				DebugDrawHelper.update(renderables, component, this.camera, this.renderer);
				for (var k = 0; k < renderables.length; k++) {
					this.renderList[count++] = renderables[k];
				}
			}
		}
		// Skeleton debug
		if (this.doRender.SkeletonPose && entity.meshDataComponent && entity.meshDataComponent.currentPose) {
			var pose = entity.meshDataComponent.currentPose;
			var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};
			if (tree.skeleton) {
				renderables = tree.skeleton;
			} else {
				renderables = DebugDrawHelper.getRenderablesFor(pose);
				for (var k = 0; k < renderables.length; k++) {
					renderables[k].id = entity.id;
				}
				tree.skeleton = renderables;
			}
			for (var k = 0; k < renderables.length; k++) {
				var renderable = renderables[k];
				renderable.transform.copy(entity.transformComponent.sync().worldTransform);
				this.renderList[count++] = renderable;
			}
		}
	}

	if (this.selectionActive) {
		this.renderList[count++] = this.selectionRenderable[0];
	}
	this.renderList.length = count;
	this.currentTpf = tpf;
};

DebugRenderSystem.prototype.render = function (renderer) {
	this.renderer = renderer;

	renderer.checkResize(this.camera);

	if (this.camera) {
		renderer.render(this.renderList, this.camera, this.lights, null, false);
	}
};

DebugRenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
	renderer.renderToPick(this.renderList, this.camera, false, skipUpdateBuffer);
};

DebugRenderSystem.prototype.invalidateHandles = function (renderer) {
	var entityIds = Object.keys(this._renderablesTree);
	entityIds.forEach(function (entityId) {
		var components = this._renderablesTree[entityId];

		var componentTypes = Object.keys(components);
		componentTypes.forEach(function (componentType) {
			var renderables = components[componentType];

			renderables.forEach(function (renderable) {
				renderable.materials.forEach(function (material) {
					renderer.invalidateMaterial(material);
				});

				renderer.invalidateMeshData(renderable.meshData);
			});
		});
	}.bind(this));

	// there are 2 selection renderables, but one has a null meshData (it's beyond me why it's like that)
	this.selectionRenderable[0].materials.forEach(function (material) {
		renderer.invalidateMaterial(material);
	});

	renderer.invalidateMeshData(this.selectionRenderable[0].meshData);
};

DebugRenderSystem.prototype.cleanup = function () {
	SystemBus.removeListener('goo.setCurrentCamera', this.cameraListener);
	SystemBus.removeListener('goo.setLights', this.lightsListener);
};

module.exports = DebugRenderSystem;