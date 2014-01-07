define([
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Camera',
	'goo/renderer/light/Light',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Transform',
	'goo/entities/components/CSSTransformComponent',
	'goo/entities/components/AnimationComponent'
],
	/** @lends */
	function (
		TransformComponent,
		MeshDataComponent,
		MeshRendererComponent,
		CameraComponent,
		LightComponent,
		ScriptComponent,
		Camera,
		Light,
		Material,
		MeshData,
		BoundingBox,
		Transform,
		CSSTransformComponent,
		AnimationComponent
	) {
		'use strict';

		/**
		 * @class Utilities for entity creation etc
		 * @description Only used to define the class. Should never be instantiated.
		 */
		function EntityUtils() {
		}

		/**
		* REVIEW : Proof read this please.
		* @description Returns a clone of the given SkeletonPose. Also stores the cloned poses into settings, in order not to 
		* clone multiple instances of the same SkeletonPose.
		* @param {SkeletonPose} skeletonPose
		* @param {Object} settings
		*/
		function cloneSkeletonPose(skeletonPose, settings) {
			settings.skeletonMap = settings.skeletonMap || {
				originals: [],
				clones:[]
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

		function cloneEntity(world, entity, settings) {
			var newEntity = world.createEntity(entity.name);

			for (var i = 0; i < entity._components.length; i++) {
				var component = entity._components[i];
				if (component instanceof TransformComponent) {
					newEntity.transformComponent.transform.copy(component.transform);
				} else if (component instanceof MeshDataComponent) {
					var meshDataComponent = new MeshDataComponent(component.meshData);
					meshDataComponent.modelBound = new component.modelBound.constructor();
					if (component.currentPose) {
						meshDataComponent.currentPose = cloneSkeletonPose(component.currentPose, settings);
					}
					newEntity.setComponent(meshDataComponent);
				} else if (component instanceof MeshRendererComponent) {
					// REVIEW: Should the cloned new meshrendercomponent not get all the set member varialbes from the
					// cloned component? Now it gets defaulted from the constructor instead. The materials are also shared.
					// Maybe this is something to be pushed to another story, to actually use the settings sent to cloneEntity, as 
					// stated in the old review comment in clone() 
					var meshRendererComponent = new MeshRendererComponent();
					for (var j = 0; j < component.materials.length; j++) {
						meshRendererComponent.materials.push(component.materials[j]);
					}
					newEntity.setComponent(meshRendererComponent);

				} else if (component instanceof AnimationComponent) {
					var clonedAnimationComponent = component.clone();
					clonedAnimationComponent._skeletonPose = cloneSkeletonPose(component._skeletonPose, settings);
					newEntity.setComponent(clonedAnimationComponent);
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
		 * Clone entity hierarcy with optional settings for sharing data and callbacks
		 * @param {World} world
		 * @param {Entity} entity The entity to clone
		 * @param {Object} [settings]
		 * @param {function(Entity)} [settings.callback] Callback to be run on every new entity. Takes entity as argument. Runs bottom to top in the cloned hierarchy.
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
			settings.shareData = settings.shareData || true;
			settings.shareMaterial = settings.shareMaterial || true;  // REVIEW: these are not used nor documented but would be great if they were
			settings.cloneHierarchy = settings.cloneHierarchy || true;

			return cloneEntity(world, entity, settings);
		};

		/**
		 * Traverse entity hierarchy with callback
		 * @param {Entity} entity The entity to begin traversing from
		 * @param {function(Entity)} callback Callback to run. Runs top to bottom in the hierarchy.
		 * The traversing can be stopped from propagating if the callback returns false.
		 */
		EntityUtils.traverse = function (entity, callback, level) {
			level = level !== undefined ? level : 0;

			if (callback(entity, level) !== false) {
				for (var i = 0; i < entity.transformComponent.children.length; i++) {
					var child = entity.transformComponent.children[i];
					EntityUtils.traverse(child.entity, callback, level + 1);
				}
			}
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

		EntityUtils.updateWorldTransform = function (transformComponent) {
			transformComponent.updateWorldTransform();

			for (var i = 0; i < transformComponent.children.length; i++) {
				EntityUtils.updateWorldTransform(transformComponent.children[i]);
			}
		};

		/**
		 * Shows an entity and its descendants if they are not hidden
		 * @param {Entity} entity The entity to show
		 */
		EntityUtils.show = function(entity) {
			entity.hidden = false;

			//first search if it has hidden parents to determine if itself should be visible
			var pointer = entity;
			while (pointer.transformComponent.parent) {
				pointer = pointer.transformComponent.parent.entity;
				if (pointer.hidden) {
					// extra check and set needed might be needed
					if (entity.meshRendererComponent) {
						entity.meshRendererComponent.hidden = true;
					}
					return;
				}
			}

			EntityUtils.traverse(entity, function(entity) {
				if (entity.hidden) { return false; }
				if (entity.meshRendererComponent) {
					entity.meshRendererComponent.hidden = entity.hidden;
				}
				if (entity.lightComponent) {
					entity.lightComponent.hidden = entity.hidden;
				}
			});
		};

		/**
		 * Hides the entity and its descendants
		 * @param {Entity} entity The entity to hide
		 */
		EntityUtils.hide = function(entity) {
			entity.hidden = true;

			// hide everything underneath this
			EntityUtils.traverse(entity, function(entity) {
				if (entity.meshRendererComponent) {
					entity.meshRendererComponent.hidden = true;
				}
				if (entity.lightComponent) {
					entity.lightComponent.hidden = true;
				}
			});
		};

		/**
		 * Creates an entity with an optional MeshData, MeshRenderer, Camera, Script and Light component, placed optionally at a location. Parameters except for the first can be given in any order. First parameter must always be a World.
		 * @param {World} world
		 * @param {MeshData} [meshData]
		 * @param {Material} [material]
		 * @param {String} [name]
		 * @param {Camera} [camera]
		 * @param {Light} [light]
		 */
		EntityUtils.createTypicalEntity = function (world) {
			// Create entity
			var entity = world.createEntity();

			for (var i = 1; i < arguments.length; i++) {
				var arg = arguments[i];

				if (arg instanceof MeshData) {
					var meshDataComponent = new MeshDataComponent(arg);
					entity.setComponent(meshDataComponent);

					// attach mesh renderer component for backwards compatibility reasons
					if (!entity.hasComponent('MeshRendererComponent')) {
						var meshRendererComponent = new MeshRendererComponent();
						entity.setComponent(meshRendererComponent);
					}
				} else if (arg instanceof Material) {
					if (!entity.hasComponent('MeshRendererComponent')) {
						var meshRendererComponent = new MeshRendererComponent();
						entity.setComponent(meshRendererComponent);
					}
					entity.meshRendererComponent.materials.push(arg);
				} else if (arg instanceof Light) {
					var lightComponent = new LightComponent(arg);
					entity.setComponent(lightComponent);
				} else if (arg instanceof Camera) {
					var cameraComponent = new CameraComponent(arg);
					entity.setComponent(cameraComponent);
				} else if (arg instanceof Transform) {
					entity.transformComponent.transform = arg;
				} else if (typeof arg === 'string') {
					entity.name = arg;
				} else if (Array.isArray(arg) && arg.length === 3) {
					entity.transformComponent.transform.translation.setd(arg[0], arg[1], arg[2]);
				} else if (typeof arg.run === 'function') {
					if (!entity.hasComponent('ScriptComponent')) {
						entity.setComponent(new ScriptComponent());
					}
					entity.scriptComponent.scripts.push(arg);
				}
			}

			return entity;
		};

		EntityUtils.createDOMEntity = function (world, domElement) {
			var entity = world.createEntity();

			entity.setComponent(new CSSTransformComponent(domElement));

			return entity;
		};

		/**
		 * Returns an array of all this entity's children
		 * @param entity
		 * @returns {Entity[]}
		 */
		EntityUtils.getChildren = function (entity) {
			return entity.transformComponent.children.map(function(childTransformComponent) {
				return childTransformComponent.entity;
			});
		};

		/**
		 * Returns the merged bounding box of the entity and its children
		 * @param entity
		 */
		EntityUtils.getTotalBoundingBox = function (entity) {
			var mergedWorldBound = new BoundingBox();
			var first = true;
			EntityUtils.traverse(entity, function (entity) {
				if (entity.meshRendererComponent) {
					if (first) {
						var boundingVolume = entity.meshRendererComponent.worldBound;
						if (boundingVolume instanceof BoundingBox) {
							boundingVolume.clone(mergedWorldBound);
						} else {
							mergedWorldBound.center.setv(boundingVolume.center);
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

		return EntityUtils;
	});
