define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],

	function (
		MeshData,
		MathUtils
	) {
	'use strict';

	/**
	 * @class Triangle. Only creates an attributeMap with MeshData.POSITION and MeshData.NORMAL.
	 * @constructor
	 * @param {number[]} verts array with 9 elements. These 9 elements must be 3 x,y,z positions.
	 */
	 function Triangle(verts) {
		this.verts = verts;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		MeshData.call(this, attributeMap, 3, 3);

		this.rebuild();
	}

	Triangle.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Triangle} Self for chaining.
	 */
	Triangle.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var normals = MathUtils.getTriangleNormal(
			this.verts[0], this.verts[1], this.verts[2],
			this.verts[3], this.verts[4], this.verts[5],
			this.verts[6], this.verts[7], this.verts[8]);

		this.getAttributeBuffer(MeshData.NORMAL).set([
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2]]);

		this.getIndexBuffer().set([0, 1, 2]);

		return this;
	};

	return Triangle;
});