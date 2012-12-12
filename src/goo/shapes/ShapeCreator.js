define(['goo/renderer/MeshData', 'goo/shapes/Box', 'goo/shapes/Quad', 'goo/shapes/Teapot', 'goo/shapes/Sphere', 'goo/shapes/Torus',
		'goo/entities/EntityUtils'], function(MeshData, Box, Quad, Teapot, Sphere, Torus, EntityUtils) {
	"use strict";

	/**
	 * @name ShapeCreator
	 * @class Factory for shape creation.
	 * @constructor
	 * @description Only used to define the class. Should never be instantiated.
	 */

	function ShapeCreator() {
	}

	/**
	 * @static
	 * @description Creates an entity with box mesh data.
	 * @param {World} world The world in which to create the entity.
	 * @param {Float} width Total width of box.
	 * @param {Float} height Total height of box.
	 * @param {Float} length Total length of box.
	 * @param {Integer} tileX Number of texture repetitions in the texture's x direction.
	 * @param {Integer} tileY Number of texture repetitions in the texture's y direction.
	 * @returns {Entity} The created entity.
	 */

	// REVIEW: This factory class is for creating shapes. This method creates an entity.
	ShapeCreator.createBoxEntity = function(world, width, height, length, tileX, tileY) {
		var meshData = ShapeCreator.createBox(width, height, length, tileX, tileY);
		var entity = EntityUtils.createTypicalEntity(world, meshData);

		return entity;
	};

	/**
	 * @static
	 * @description Creates a quad shape.
	 * @param {Float} width Total width of quad.
	 * @param {Float} height Total height of quad.
	 * @param {Integer} tileX Number of texture repetitions in the texture's x direction.
	 * @param {Integer} tileY Number of texture repetitions in the texture's y direction.
	 * @returns {Quad} The created quad.
	 */

	ShapeCreator.createQuad = function(width, height, tileX, tileY) {
		return new Quad(width, height, tileX, tileY);
	};

	/**
	 * @static
	 * @description Creates a box shape.
	 * @param {Float} width Total width of box.
	 * @param {Float} height Total height of box.
	 * @param {Float} length Total length of box.
	 * @param {Integer} tileX Number of texture repetitions in the texture's x direction.
	 * @param {Integer} tileY Number of texture repetitions in the texture's y direction.
	 * @returns {Box} The created box.
	 */

	ShapeCreator.createBox = function(width, height, length, tileX, tileY) {
		return new Box(width, height, length, tileX, tileY);
	};

	/**
	 * @static
	 * @description Creates a teapot shape.
	 * @returns {Teapot} The created teapot.
	 */

	ShapeCreator.createTeapot = function() {
		return new Teapot();
	};

	/**
	 * @static
	 * @description Creates a sphere shape.
	 * @param {Integer} zSamples Number of segments.
	 * @param {Integer} radialSamples Number of slices.
	 * @param {Float} radius Radius.
	 * @param {Enum} textureMode Texture wrapping mode.
	 * @returns {Sphere} The created sphere.
	 */

	ShapeCreator.createSphere = function(zSamples, radialSamples, radius, textureMode) {
		return new Sphere(zSamples, radialSamples, radius, textureMode);
	};

	/**
	 * @static
	 * @description Creates a torus shape.
	 * @param {Integer} circleSamples Number of segments.
	 * @param {Integer} radialSamples Number of slices.
	 * @param {Float} tubeRadius Radius of tube.
	 * @param {Float} centerRadius Radius from center.
	 * @returns {Torus} The created torus.
	 */

	ShapeCreator.createTorus = function(circleSamples, radialSamples, tubeRadius, centerRadius) {
		return new Torus(circleSamples, radialSamples, tubeRadius, centerRadius);
	};

	return ShapeCreator;
});