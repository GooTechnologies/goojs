define(['goo/renderer/MeshData'],
	/** @lends */
	function (MeshData) {
	"use strict";

	/**
	 * @class A disk
	 * @param {number} [nSegments=8] Number of slices
	 * @param {number} [radius=1] Radius of the disk
	 * @param {number} [pointiness=0] By default a disk is flat, however, its center can be raised above the disk's outer edge
	 */
	function Disk(nSegments, radius, pointiness) {
		this.nSegments = nSegments || 8;
		this.radius = radius || 1;
		this.pointiness = pointiness || 0;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		MeshData.call(this, attributeMap, this.nSegments + 1, this.nSegments + 2);

		this.indexModes = ['TriangleFan'];

		this.rebuild();
	}

	Disk.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Disk} Self for chaining.
	 */
	Disk.prototype.rebuild = function () {
		var verts = [];
		var norms = [];
		var indices = [];

		verts.push(0, 0, this.pointiness);
		norms.push(0, 0, 1);
		indices.push(0);

		var slope = Math.atan2(this.radius, this.pointiness);

		var ak = Math.PI * 2 / this.nSegments;
		for (var i = 1, k = 0; i <= this.nSegments; i++, k += ak) {
			verts.push(
				Math.cos(k) * this.radius,
				Math.sin(k) * this.radius,
				0);

			norms.push(
				Math.cos(k) * Math.cos(slope),
				Math.sin(k) * Math.cos(slope),
				Math.sin(slope));

			indices.push(i);
		}
		indices.push(1);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getIndexBuffer().set(indices);

		return this;
	};

	return Disk;
});