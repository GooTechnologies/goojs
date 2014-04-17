define([
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/shapes/Cylinder',
	'goo/shapes/Torus'
],
/** @lends */
/* REVIEW What's the purpose of this class? Why can't people just use the appropriate classes? */
function (
	Box,
	Quad,
	Sphere,
	Cylinder,
	Torus
) {
	"use strict";

	/**
	 * @class Factory for shape creation.
	 * @deprecated Use new Box, Quad, Sphere, Cylinder and Torus instead; Deprecated since 0.8.0 and scheduled for removal in 0.10.0
	 * @description Only used to define the class. Should never be instantiated.
	 */

	function ShapeCreator() {
	}

	/**
	 * @param {number} width Total width of quad.
	 * @param {number} height Total height of quad.
	 * @param {number} tileX Number of texture repetitions in the texture's x direction.
	 * @param {number} tileY Number of texture repetitions in the texture's y direction.
	 * @returns {Quad} The created quad.
	 */
	ShapeCreator.createQuad = function (width, height, tileX, tileY) {
		return new Quad(width, height, tileX, tileY);
	};

	/**
	 * @param {number} width Total width of box.
	 * @param {number} height Total height of box.
	 * @param {number} length Total length of box.
	 * @param {number} tileX Number of texture repetitions in the texture's x direction.
	 * @param {number} tileY Number of texture repetitions in the texture's y direction.
	 * @returns {Box} The created box.
	 */
	ShapeCreator.createBox = function (width, height, length, tileX, tileY) {
		return new Box(width, height, length, tileX, tileY);
	};

	/**
	 * @param {number} zSamples Number of segments.
	 * @param {number} radialSamples Number of slices.
	 * @param {number} radius Radius.
	 * @param {Enum} textureMode Texture wrapping mode.
	 * @returns {Sphere} The created sphere.
	 */
	ShapeCreator.createSphere = function (zSamples, radialSamples, radius, textureMode) {
		return new Sphere(zSamples, radialSamples, radius, textureMode);
	};

	/**
	 * @param {number} radialSamples Number of slices.
	 * @param {number} radius Radius.
	 * @param {Enum} textureMode Texture wrapping mode.
	 * @returns {Cylinder} The created cylinder.
	 */
	ShapeCreator.createCylinder = function (radialSamples, radius, textureMode) {
		return new Cylinder(radialSamples, radius, textureMode);
	};

	/**
	 * @param {number} circleSamples Number of segments.
	 * @param {number} radialSamples Number of slices.
	 * @param {number} tubeRadius Radius of tube.
	 * @param {number} centerRadius Radius from center.
	 * @returns {Torus} The created torus.
	 */
	ShapeCreator.createTorus = function (circleSamples, radialSamples, tubeRadius, centerRadius) {
		return new Torus(circleSamples, radialSamples, tubeRadius, centerRadius);
	};

	return ShapeCreator;
});