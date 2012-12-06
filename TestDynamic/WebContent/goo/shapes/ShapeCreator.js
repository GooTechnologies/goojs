define(['goo/renderer/MeshData', 'goo/shapes/Box', 'goo/shapes/Plane', 'goo/shapes/Teapot', 'goo/shapes/Sphere', 'goo/entities/EntityUtils'],
	function(MeshData, Box, Plane, Teapot, Sphere, EntityUtils) {
		"use strict";

		/**
		 * @name ShapeCreator
		 * @class Utils for creating standard shapes/primitives
		 */
		function ShapeCreator() {
		}

		ShapeCreator.createBoxEntity = function(world, width, height, length, tileX, tileY) {
			var meshData = ShapeCreator.createBox(width, height, length, tileX, tileY);
			var entity = EntityUtils.createTypicalEntity(world, meshData);

			return entity;
		};

		ShapeCreator.createPlane = function(width, height, tileX, tileY) {
			return new Plane(width, height, tileX, tileY);
		};

		ShapeCreator.createBox = function(width, height, length, tileX, tileY) {
			return new Box(width, height, length, tileX, tileY);
		};

		ShapeCreator.createTeapot = function() {
			return new Teapot();
		};

		ShapeCreator.createSphere = function(zSamples, radialSamples, radius, textureMode) {
			return new Sphere(zSamples, radialSamples, radius, textureMode);
		};

		return ShapeCreator;
	});