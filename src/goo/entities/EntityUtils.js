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
	'goo/math/Transform',
	'goo/entities/components/CSSTransformComponent'
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

			for (var i=0;i<entity._components.length;i++) {
				var component = entity._components[i];
				if (component instanceof TransformComponent) {
					newEntity.transformComponent.transform.copy(component.transform);
				} else if (component instanceof MeshDataComponent) {
					var meshDataComponent = new MeshDataComponent(component.meshData);
					meshDataComponent.modelBound = new component.modelBound.constructor();
					if (component.currentPose) {
						meshDataComponent.currentPose = component.currentPose;
					}
					newEntity.setComponent(meshDataComponent);
				} else if (component instanceof MeshRendererComponent) {
					var meshRendererComponent = new MeshRendererComponent();
					for (var j=0;j<component.materials.length;j++) {
						meshRendererComponent.materials.push(component.materials[j]);
					}
					newEntity.setComponent(meshRendererComponent);
				} else {
					newEntity.setComponent(component);
				}
			}
			for (var j=0;j<entity.transformComponent.children.length;j++) {
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
			settings.shareData = settings.shareData || true;
			settings.shareMaterial = settings.shareMaterial || true;
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

		return EntityUtils;
	});
