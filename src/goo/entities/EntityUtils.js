define(['goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent', 'goo/entities/components/MeshRendererComponent', 'goo/entities/components/CSSTransformComponent'],
	/** @lends EntityUtils */
	function (TransformComponent, MeshDataComponent, MeshRendererComponent, CSSTransformComponent) {
		"use strict";

		/**
		 * @class Utilities for entity creation etc
		 */
		function EntityUtils() {
		}

		function cloneEntity (world, entity, settings) {
			var newEntity = world.createEntity(entity.name);
			for (var i=0;i<entity.components.length;i++) {
				var component = entity.components[i];
				if (component instanceof TransformComponent) {
					newEntity.transformComponent.transform.copy(component.transform);
				} else {
					newEntity.setComponent(component);
				}
				
				for (var j=0;j<entity.transformComponent.children.length;j++) {
					var child = entity.transformComponent.children[j];
					var clonedChild = cloneEntity(child);
					newEntity.transformComponent.attachChild(clonedChild.transformComponent);
				}
			}
		}
		
		EntityUtils.clone = function (world, entity, settings) {
			settings = settings || {};
			settings.shareData = settings.shareData || true;
			settings.shareMaterial = settings.shareMaterial || true;
			settings.cloneHierarchy = settings.cloneHierarchy || true;
			
			cloneEntity(world, entity, settings);
		};
		
		/**
		 * Creates an entity with the common rendering components.
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
