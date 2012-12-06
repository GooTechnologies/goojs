define(['goo/renderer/MeshData'], function(MeshData) {
	"use strict";

	Plane.prototype = Object.create(MeshData.prototype);

	/**
	 * @name Plane
	 * @class <code>Quad</code> defines a four sided, two dimensional shape. The local height of the <code>Quad</code> defines it's size about the
	 *        y-axis, while the width defines the x-axis. The z-axis will always be 0.
	 */
	function Plane(width, height, tileX, tileY) {
		this.xExtent = width !== undefined ? width * 0.5 : 0.5;
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;
		this.tileX = tileX || 1;
		this.tileY = tileY || 1;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, 4, 6);

		this.rebuild();
	}

	Plane.prototype.rebuild = function() {
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

	return Plane;
});