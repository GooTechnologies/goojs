define([
	'goo/renderer/MeshData'
],
/** @lends */
function (
	MeshData
) {
	"use strict";

	/**
	 * @class A 3D object representing a cylinder.
	 * @param {number} [radialSamples=8] Number of slices
	 * @param {number} [radius=0.5] Radius
	 */
	function Cylinder(radialSamples, radius) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			radialSamples = props.radialSamples;
			radius = props.radius;
		}
		this.radialSamples = radialSamples || 8;
		this.radius = radius || 1;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, this.radialSamples * 4 + 2 + 2, (this.radialSamples * 3) * 4);

		// could be done better with 2 triangle fans and a triangle strip
		this.indexModes = ['Triangles'];

		this.rebuild();
	}

	Cylinder.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Cylinder} Self for chaining.
	 */
	Cylinder.prototype.rebuild = function () {
		var verts = [];
		var norms = [];
		var tex = [];
		var indices = [];

		var ak = Math.PI * 2 / this.radialSamples;
		var at = 1 / this.radialSamples;

		var lastIndex = this.radialSamples * 4 + 2 + 2 - 1;
		for (var i = 0, k = 0, t = 0; i < this.radialSamples; i++, k += ak, t += at) {
			var cos = Math.cos(k);
			var sin = Math.sin(k);
			var x = cos * this.radius;
			var y = sin * this.radius;

			verts.push(
				x, y, 0.5, // disk 1
				x, y, -0.5, // disk 2
				x, y, 0.5,  // side 1
				x, y, -0.5  // side 2
			);

			norms.push(
				0, 0, 1,
				0, 0, -1,
				cos, sin, 0,
				cos, sin, 0
			);

			tex.push(
				cos / 4 + 0.25, sin / 4 + 0.75,
				cos / 4 + 0.25, sin / 4 + 0.25,
				0.5, t,
				1.0, t
			);
		}

		verts.push(
			1.0, 0.0, 0.5,
			1.0, 0.0, -0.5
		);

		norms.push(
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0
		);

		tex.push(
			0.5, 1.0,
			1.0, 1.0
		);

		for (var i = 0; i < this.radialSamples - 1; i++) {
			indices.push(
				lastIndex, i * 4 + 0, i * 4 + 4,
				i * 4 + 1, lastIndex - 1, i * 4 + 5,
				i * 4 + 4 + 2, i * 4 + 2, i * 4 + 4 + 3,
				i * 4 + 2, i * 4 + 3, i * 4 + 4 + 3
			);
		}

		indices.push(
			lastIndex, i * 4 + 0, 0,
			i * 4 + 1, lastIndex - 1, 0 + 1,
			i * 4 + 4, i * 4 + 2, i * 4 + 5,
			i * 4 + 2, i * 4 + 3, i * 4 + 5
		);

		verts.push(
			0, 0, -0.5,
			0, 0, 0.5
		);

		norms.push(
			0, 0, -0.5,
			0, 0, 0.5
		);

		tex.push(
			0.25, 0.25,
			0.25, 0.75
		);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
		this.getIndexBuffer().set(indices);

		return this;
	};

	return Cylinder;
});