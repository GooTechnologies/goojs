define(['goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent', 'goo/entities/components/MeshRendererComponent'],
	/** @lends EntityUtils */
	function (TransformComponent, MeshDataComponent, MeshRendererComponent) {
		"use strict";

		/**
		 * @class Utilities for entity creation etc
		 */
		function EntityUtils() {
		}

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

		return EntityUtils;
	});
