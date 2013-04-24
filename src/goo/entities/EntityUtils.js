define([
		'goo/entities/components/TransformComponent',
		'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent',
		'goo/entities/components/CSSTransformComponent'
	],
	/** @lends */
	function (
		TransformComponent,
		MeshDataComponent,
		MeshRendererComponent,
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

				for (var j=0;j<entity.transformComponent.children.length;j++) {
					var child = entity.transformComponent.children[j];
					var clonedChild = cloneEntity(world, child.entity, settings);
					newEntity.transformComponent.attachChild(clonedChild.transformComponent);
				}
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
		 * @param {function} [settings.callback] Callback to be run on every new entity. Takes entity as argument. Runs bottom to top in the cloned hierarchy.
		 */
		EntityUtils.clone = function (world, entity, settings) {
			console.log('Cloning', settings);
			settings = settings || {};
			settings.shareData = settings.shareData || true;
			settings.shareMaterial = settings.shareMaterial || true;
			settings.cloneHierarchy = settings.cloneHierarchy || true;
			console.log('Share material?', settings.shareMaterial);

			return cloneEntity(world, entity, settings);
		};

		/**
		 * Traverse entity hierarchy with callback
		 * @param {Entity} entity The entity to begin traversing from
		 * @param {function} callback Callback to run. Runs top to bottom in the hierarchy
		 */
		EntityUtils.traverse = function (entity, callback) {
			if (callback) {
				callback(entity);
			}

			for (var j=0;j<entity.transformComponent.children.length;j++) {
				var child = entity.transformComponent.children[j];
				EntityUtils.traverse(child.entity, callback);
			}
		};

		EntityUtils.updateWorldTransform = function (transformComponent) {
			transformComponent.updateWorldTransform();

			for (var i = 0; i < transformComponent.children.length; i++) {
				EntityUtils.updateWorldTransform(transformComponent.children[i]);
			}
		};

		/**
		 * Creates an entity with the common rendering components and a mesh.
		 * @param {World} world
		 * @param {MeshData} meshData
		 */
		EntityUtils.createTypicalEntity = function (world, meshData) {
			// Create entity
			var entity = world.createEntity();

			// Create meshdata component using above data
			var meshDataComponent = new MeshDataComponent(meshData);
			entity.setComponent(meshDataComponent);

			// Create meshrenderer component with material and shader
			var meshRendererComponent = new MeshRendererComponent();
			entity.setComponent(meshRendererComponent);

			return entity;
		};

		EntityUtils.createDOMEntity = function (world, domElement) {
			var entity = world.createEntity();

			entity.setComponent(new CSSTransformComponent(domElement));

			return entity;
		};

		return EntityUtils;
	});
