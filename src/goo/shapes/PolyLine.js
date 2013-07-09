define([
	'goo/renderer/MeshData',
	'goo/shapes/Surface'
],
	/** @lends */
	function (
		MeshData,
		Surface
		) {
	"use strict";

	/**
	 * @class A polygonal line
	 * @param {number[]} [verts] The vertices data array
	 * @param {boolean} [closed=false] True if its ends should be connected
	 */
	function PolyLine(verts, closed) {
		this.verts = verts;
		this.closed = !!closed;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		MeshData.call(this, attributeMap, this.verts.length / 3, this.verts.length / 3);

		if(this.closed) {
			this.indexModes = ['LineLoop'];
		}
		else {
			this.indexModes = ['LineStrip'];
		}

		this.rebuild();
	}

	PolyLine.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data
	 * @returns {PolyLine} Self for chaining
	 */
	PolyLine.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var indices = [];
		var nVerts = this.verts.length / 3;
		for (var i = 0; i < nVerts; i++) {
			indices.push(i);
		}

		this.getIndexBuffer().set(indices);

		return this;
	};

	/**
	 * @description Builds a surface as a result of multiplying 2 polyLines
	 * @returns {Surface} The resulting surface
	 */
	PolyLine.prototype.mul = function (that) {
		if(!(that instanceof PolyLine)) {
			return ;
		}

		var thatNVerts = that.verts.length / 3;
		var verts = [];

		for (var i = 0; i < this.verts.length; i += 3) {
			for (var j = 0; j < that.verts.length; j += 3) {
				verts.push(
					this.verts[i + 0] + that.verts[j + 0],
					this.verts[i + 1] + that.verts[j + 1],
					this.verts[i + 2] + that.verts[j + 2]);
			}
		}

		return new Surface(verts, thatNVerts);
	};

	/**
	 * @description Builds a surface as a result of rotating this polyLine around the Y axis
	 * @returns {Surface} The resulting surface
	 */
	PolyLine.prototype.lathe = function (nSegments) {
		nSegments = nSegments || 8;

		var ak = Math.PI * 2 / nSegments;
		var verts = [];

		for (var i = 0; i < this.verts.length; i += 3) {
			for (var j = 0, k = 0; j <= nSegments; j++, k += ak) {
				verts.push(
					-Math.cos(k) * this.verts[i + 0],
					this.verts[i + 1],
					Math.sin(k) * this.verts[i + 0]);
			}
		}

		return new Surface(verts, nSegments + 1);
	};

	return PolyLine;
});