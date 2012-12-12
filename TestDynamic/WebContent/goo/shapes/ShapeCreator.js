define(['goo/renderer/MeshData', 'goo/shapes/Box', 'goo/shapes/Quad', 'goo/shapes/Teapot', 'goo/shapes/Sphere', 'goo/shapes/Torus',
		'goo/entities/EntityUtils'], function(MeshData, Box, Quad, Teapot, Sphere, Torus, EntityUtils) {
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

	ShapeCreator.createQuad = function(width, height, tileX, tileY) {
		return new Quad(width, height, tileX, tileY);
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

	ShapeCreator.createTorus = function(circleSamples, radialSamples, tubeRadius, centerRadius) {
		return new Torus(circleSamples, radialSamples, tubeRadius, centerRadius);
	};

	return ShapeCreator;
});