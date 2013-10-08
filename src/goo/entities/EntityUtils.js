define([
	'goo/entities/components/Component',
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/entities/components/Camera',
	'goo/entities/components/Light',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Material',
	'goo/math/Transform',
	'goo/entities/components/CSSTransformComponent'
],
	/** @lends */
	function (
		Component,
		MeshData,
		MeshRenderer,
		Camera,
		Light,
		ScriptComponent,
		Material,
		Transform,
		CSSTransformComponent
	) {
		"use strict";

		/**
		 * @class Utilities for entity creation etc
		 * @description Only used to define the class. Should never be instantiated.
		 */
		function EntityUtils() {
		}

		function cloneEntity (world, entity, settings) {
			var newEntity = world.createEntity(entity.name);

			// for (var i=0;i<entity._components.length;i++) {
			// 	var component = entity._components[i];
			// 	if (component instanceof MeshData) {
			// 		component.modelBound = new component.modelBound.constructor();
			// 		if (component.currentPose) {
			// 			meshDataComponent.currentPose = component.currentPose;
			// 		}
			// 		newEntity.setComponent(meshDataComponent);
			// 	} else if (component instanceof MeshRenderer) {
			// 		var meshRenderer = new MeshRenderer();
			// 		for (var j=0;j<component.materials.length;j++) {
			// 			meshRenderer.materials.push(component.materials[j]);
			// 		}
			// 		newEntity.setComponent(meshRenderer);
			// 	} else {
			// 		newEntity.setComponent(component);
			// 	}
			// }
			// for (var j=0;j<entity.children.length;j++) {
			// 	var child = entity.children[j];
			// 	var clonedChild = cloneEntity(world, child, settings);
			// 	newEntity.attachChild(clonedChild);
			// }

			// if (settings.callback) {
			// 	settings.callback(newEntity);
			// }

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
			settings.shareData = settings.shareData || true;
			settings.shareMaterial = settings.shareMaterial || true;
			settings.cloneHierarchy = settings.cloneHierarchy || true;

			return cloneEntity(world, entity, settings);
		};

		/**
		 * Traverse entity hierarchy with callback
		 * @param {Entity} entity The entity to begin traversing from
		 * @param {function(Entity)} callback Callback to run. Runs top to bottom in the hierarchy
		 */
		EntityUtils.traverse = function (entity, callback, level) {
			level = level !== undefined ? level : 0;

			if (callback(entity, level) !== false) {
				for (var j=0;j<entity.children.length;j++) {
					var child = entity.children[j];
					EntityUtils.traverse(child, callback, level + 1);
				}
			}
		};

		EntityUtils.getRoot = function (entity) {
			while (entity.parent) {
				entity = entity.parent;
			}
			return entity;
		};

		EntityUtils.updateWorldTransform = function (entity) {
			entity.updateWorldTransform();

			for (var i = 0; i < entity.children.length; i++) {
				EntityUtils.updateWorldTransform(entity.children[i]);
			}
		};

		/**
		 * Creates an entity with an optional MeshData, MeshRenderer, Camera and Light component, placed optionally at a location. Parameters except for the first can be given in any order. First parameter must always be a World.
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
					entity.addComponent(arg);

					// attach mesh renderer component for backwards compatibility reasons
					if (!entity.hasComponent('MeshRenderer')) {
						entity.addComponent(MeshRenderer);
					}
				} else if (arg instanceof Material) {
					if (!entity.hasComponent('MeshRenderer')) {
						entity.addComponent(MeshRenderer);
					}
					entity.meshRenderer.materials.push(arg);
				} else if (arg instanceof Component) {
					entity.addComponent(arg);
				} else if (arg instanceof Transform) {
					entity.transform = arg;
				} else if (typeof arg === 'string') {
					entity.name = arg;
				} else if (Array.isArray(arg) && arg.length === 3) {
					entity.transform.translation.setd(arg[0], arg[1], arg[2]);
				} else if (typeof arg.run === 'function') {
					entity.addComponent(new ScriptComponent(arg));
				}
			}

			return entity;
		};

		EntityUtils.createDOMEntity = function (world, domElement) {
			var entity = world.createEntity();

			entity.setComponent(new CSSTransformComponent(domElement));

			return entity;
		};

		return EntityUtils;
	});
