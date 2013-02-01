define(['goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent', 'goo/entities/components/MeshRendererComponent', 'goo/entities/components/CSSTransformComponent'],
	/** @lends EntityUtils */
	function (TransformComponent, MeshDataComponent, MeshRendererComponent, CSSTransformComponent) {
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

		EntityUtils.createDOMEntity = function (world, domElement) {
			var entity = world.createEntity();

			entity.setComponent(new CSSTransformComponent(domElement));

			return entity;
		};

		return EntityUtils;
	});
