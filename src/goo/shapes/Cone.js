define([
	'goo/renderer/MeshData',
	'goo/util/ObjectUtils'
], function (
	MeshData,
	_
) {
	'use strict';

	/**
	 * @class
	 * Cone mesh data
	 * @extends MeshData
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/shapes/Cone/Cone-vtest.html Working example
	 * @param {number} [radialSamples=8] Number of slices
	 * @param {number} [radius=1] Radius of the cone
	 * @param {number} [height=2] The height of the cone
	 */
	function Cone(radialSamples, radius, height) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			radialSamples = props.radialSamples;
			radius = props.radius;
			height = props.height;
		}
		this.radialSamples = radialSamples || 8;
		this.radius = radius || 1;
		this.height = typeof height === 'undefined' ? 2 : height;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, this.radialSamples * 3 + this.radialSamples + 1, this.radialSamples * 3 * 2);

		this.indexModes = ['Triangles'];

		this.rebuild();
	}

	Cone.prototype = Object.create(MeshData.prototype);
	Cone.prototype.constructor = Cone;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Cone} Self for chaining.
	 */
	Cone.prototype.rebuild = function () {
		var verts = [];
		var norms = [];
		var tex = [];
		var indices = [];

		// pointy part
		var slope = Math.atan2(this.radius, this.height);

		var ak = Math.PI * 2 / this.radialSamples;
		var at = 1 / this.radialSamples;
		for (var i = 0, k = 0, t = 0; i < this.radialSamples; i++, k += ak, t += at) {
			verts.push(
				0, 0, this.height,
				Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0,
				Math.cos(k + ak) * this.radius, Math.sin(k + ak) * this.radius, 0
			);

			norms.push(
				0, 0, 1,
				Math.cos(k) * Math.cos(slope), Math.sin(k) * Math.cos(slope), Math.sin(slope),
				Math.cos(k + ak) * Math.cos(slope), Math.sin(k + ak) * Math.cos(slope), Math.sin(slope)
			);

			tex.push(
				t + at / 2, 1.0,
				t, 0.5,
				t + at, 0.5
			);

			indices.push(i * 3 + 0, i * 3 + 1, i * 3 + 2);
		}

		var baseCenterIndex = i * 3 + 0;

		verts.push(0, 0, 0);
		norms.push(0, 0, -1);
		tex.push(0.25, 0.25);

		// base
		for (var i = 1, k = 0; i <= this.radialSamples - 1; i++, k += ak) {
			verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
			norms.push(0, 0, -1);
			tex.push(Math.cos(k) * 0.25 + 0.25, Math.sin(k) * 0.25 + 0.25);

			indices.push(baseCenterIndex + i, baseCenterIndex, baseCenterIndex + i + 1);
		}

		verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
		norms.push(0, 0, -1);
		tex.push(Math.cos(k) * 0.25 + 0.25, Math.sin(k) * 0.25 + 0.25);

		indices.push(baseCenterIndex + this.radialSamples, baseCenterIndex, baseCenterIndex + 1);

		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
		this.getIndexBuffer().set(indices);

		return this;
	};

	/**
	 * Returns a clone of this cone
	 * @returns {Cone}
	 */
	Cone.prototype.clone = function () {
		var options = _.shallowSelectiveClone(this, ['radialSamples', 'radius', 'height']);

		return new Cone(options);
	};

	return Cone;
});