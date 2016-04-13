var Scripts = require('../scripts/Scripts');
var BoundingBox = require('../renderer/bounds/BoundingBox');
var ObjectUtils = require('../util/ObjectUtils');

/**
 * Utilities for entity creation etc
 * Only used to define the class. Should never be instantiated.
 */
function EntityUtils() {}

/**
 * Returns a clone of the given SkeletonPose. Also stores the cloned poses into settings, in order not to
 * clone multiple instances of the same SkeletonPose.
 * @param {SkeletonPose} skeletonPose
 * @param {Object} settings
 */
function cloneSkeletonPose(skeletonPose, settings) {
	settings.skeletonMap = settings.skeletonMap || {
		originals: [],
		clones: []
	};
	var idx = settings.skeletonMap.originals.indexOf(skeletonPose);
	var clonedSkeletonPose;
	if (idx === -1) {
		clonedSkeletonPose = skeletonPose.clone();
		settings.skeletonMap.originals.push(skeletonPose);
		settings.skeletonMap.clones.push(clonedSkeletonPose);
	} else {
		clonedSkeletonPose = settings.skeletonMap.clones[idx];
	}

	return clonedSkeletonPose;
}

//! AT: this is a huge mess
// cloneEntity will only work for very few cases anyways, for very specific components
function cloneEntity(world, entity, settings) {
	// settings is also used to store stuff on it, like animation skeletons
	var newEntity = world.createEntity(entity.name);

	newEntity._tags = ObjectUtils.cloneSet(entity._tags);
	newEntity._attributes = ObjectUtils.cloneMap(entity._attributes);
	newEntity._hidden = entity._hidden;
	newEntity.static = entity.static;

	for (var i = 0; i < entity._components.length; i++) {
		var component = entity._components[i];
		if (component.type === 'TransformComponent') {
			newEntity.transformComponent.transform.copy(component.transform);
		} else if (component.type === 'MeshDataComponent') {
			var clonedMeshDataComponent = component.clone(settings);
			if (component.currentPose) {
				clonedMeshDataComponent.currentPose = cloneSkeletonPose(component.currentPose, settings);
			}
			newEntity.setComponent(clonedMeshDataComponent);
		} else if (component.type === 'AnimationComponent') {
			var clonedAnimationComponent = component.clone();
			clonedAnimationComponent._skeletonPose = cloneSkeletonPose(component._skeletonPose, settings);
			newEntity.setComponent(clonedAnimationComponent);
		} else if (component.type === 'ScriptComponent') {
			var scriptComponent = new component.constructor();
			for (var j = 0; j < component.scripts.length; j++) {
				var newScript;
				var script = component.scripts[j];
				var key = script.externals ? script.externals.key || script.externals.name : null;
				if (key && Scripts.getScript(key)) { // Engine script
					newScript = Scripts.create(key, script.parameters);
				} else { // Custom script
					newScript = {
						externals: script.externals,
						name: (script.name || '') + '_clone',
						enabled: !!script.enabled
					};
					if (script.parameters) { newScript.parameters = ObjectUtils.deepClone(script.parameters); }

					if (script.setup) { newScript.setup = script.setup; }
					if (script.update) { newScript.update = script.update; }
					if (script.cleanup) { newScript.cleanup = script.cleanup; }

					if (script.fixedUpdate) { newScript.fixedUpdate = script.fixedUpdate; }
					if (script.lateUpdate) { newScript.lateUpdate = script.lateUpdate; }
					if (script.enter) { newScript.enter = script.enter; }
					if (script.exit) { newScript.exit = script.exit; }

					scriptComponent.scripts.push(newScript);
				}
			}
			newEntity.setComponent(scriptComponent);
			if (world.getSystem('ScriptSystem').manualSetup && component.scripts[0].context) {
				scriptComponent.setup(newEntity);
			}
		} else if (component.clone) {
			newEntity.setComponent(component.clone(settings));
		} else {
			newEntity.setComponent(component);
		}
	}
	for (var j = 0; j < entity.transformComponent.children.length; j++) {
		var child = entity.transformComponent.children[j];
		var clonedChild = cloneEntity(world, child.entity, settings);
		newEntity.transformComponent.attachChild(clonedChild.transformComponent);
	}

	if (settings.callback) {
		settings.callback(newEntity);
	}

	return newEntity;
}

/**
 * Clone entity hierarchy with optional settings for sharing data and callbacks.
 * @param {World} world
 * @param {Entity} entity The entity to clone
 * @param {Object} [settings]
 * @param {boolean} [settings.shareMeshData=false] Cloning entities clones their mesh data by default
 * @param {boolean} [settings.shareMaterials=false] Cloning entities clones their materials by default
 * @param {boolean} [settings.shareUniforms=false] Cloning entities clones their materials' uniforms by default
 * @param {boolean} [settings.shareTextures=false] Cloning entities clones their materials' textures by default
 * @param {function (entity: Entity)} [settings.callback] Callback to be run on every new entity. Takes entity as argument. Runs bottom to top in the cloned hierarchy.
 * @returns {Entity} The cloned entity.
 */
EntityUtils.clone = function (world, entity, settings) {
	settings = settings || {};
	// REVIEW: It's bad style to modify the settings object provided by the caller.
	// I.e. if the caller does:
	//   var s = {};
	//   EntityUtils.clone(w, e, s);
	// ...he wouldn't expect s to have changed.
	// REVIEW: `settings.shareData || true` will evaluate to true if shareData is false,
	// which means that the setting will always be true.
	//settings.shareData = settings.shareData || true;
	//settings.shareMaterial = settings.shareMaterial || true;  // REVIEW: these are not used nor documented but would be great if they were
	//settings.cloneHierarchy = settings.cloneHierarchy || true;

	//! AT: why is everything here overridden anyways?
	// Why is this function just defaulting some parameters and then calling cloneEntity to do the rest?

	return cloneEntity(world, entity, settings);
};

/**
 * Traverse the entity hierarchy upwards, returning the root entity
 * @param {Entity} entity The entity to begin traversing from
 * @returns {Entity} The root entity
 */
EntityUtils.getRoot = function (entity) {
	while (entity.transformComponent.parent) {
		entity = entity.transformComponent.parent.entity;
	}
	return entity;
};

/**
 * @deprecated Deprecated with warning on 2016-04-06
 */
EntityUtils.updateWorldTransform = ObjectUtils.warnOnce('EntityUtils.updateWorldTransform is deprecated. Please use entity.transformComponent.sync instead', function (transformComponent) {
	transformComponent.updateWorldTransform();

	for (var i = 0; i < transformComponent.children.length; i++) {
		EntityUtils.updateWorldTransform(transformComponent.children[i]);
	}
});

/**
 * Returns the merged bounding box of the entity and its children
 * @param entity
 */
EntityUtils.getTotalBoundingBox = function (entity) {
	var mergedWorldBound = new BoundingBox();
	var first = true;
	entity.traverse(function (entity) {
		if (entity.meshRendererComponent) {
			if (first) {
				var boundingVolume = entity.meshRendererComponent.worldBound;
				if (boundingVolume instanceof BoundingBox) {
					mergedWorldBound.copy(boundingVolume);
				} else {
					mergedWorldBound.center.set(boundingVolume.center);
					mergedWorldBound.xExtent = mergedWorldBound.yExtent = mergedWorldBound.zExtent = boundingVolume.radius;
				}
				first = false;
			} else {
				mergedWorldBound.merge(entity.meshRendererComponent.worldBound);
			}
		}
	});

	// if the whole hierarchy lacked mesh renderer components return
	// a tiny bounding box centered around the coordinates of the parent
	if (first) {
		var translation = entity.transformComponent.worldTransform.translation;
		mergedWorldBound = new BoundingBox(translation.clone(), 0.001, 0.001, 0.001);
	}

	return mergedWorldBound;
};

module.exports = EntityUtils;
