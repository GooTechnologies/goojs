define(['goo/renderer/MeshData', 'goo/util/Enum'], function(MeshData, Enum) {
	"use strict";

	Sphere.prototype = Object.create(MeshData.prototype);

	/**
	 * @name Sphere
	 * @class Sphere represents a 3D object with all points equi-distance from a center point.
	 */
	function Sphere(zSamples, radialSamples, radius, textureMode) {
		this.zSamples = zSamples !== undefined ? zSamples : 8;
		this.radialSamples = radialSamples !== undefined ? radialSamples : 8;
		this.radius = radius !== undefined ? radius : 0.5;
		this.textureMode = textureMode !== undefined ? textureMode : Sphere.TextureModes.Linear;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var verts = (this.zSamples - 2) * (this.radialSamples + 1) + 2;
		var tris = 6 * (this.zSamples - 2) * this.radialSamples;

		MeshData.call(this, attributeMap, verts, tris);

		this.rebuild();
	}

	Sphere.prototype.rebuild = function() {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		this.getAttributeBuffer(MeshData.POSITION).set([-xExtent, -yExtent, 0, -xExtent, yExtent, 0, xExtent, yExtent, 0, xExtent, -yExtent, 0]);
		this.getAttributeBuffer(MeshData.NORMAL).set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set([0, 0, 0, tileY, tileX, tileY, tileX, 0]);

		this.getIndexBuffer().set([0, 3, 1, 1, 3, 2]);

		return this;
	};

	Sphere.TextureModes = new Enum('Linear', 'Projected', 'Polar');

	return Sphere;
});