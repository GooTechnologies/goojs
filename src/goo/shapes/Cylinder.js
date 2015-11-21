var MeshData = require('../renderer/MeshData');
var Vector3 = require('../math/Vector3');
var ObjectUtils = require('../util/ObjectUtils');

	'use strict';

	/**
	 * A 3D object representing a cylinder.
	 * @extends MeshData
	 * @param {number} [radialSamples=8] Number of slices
	 * @param {number} [radiusTop=0.5] Radius of the cylinder at the top.
	 * @param {number} [radiusBottom=radiusTop] Radius of the cylinder at the bottom. Defaults to radiusTop.
	 * @param {number} [height=1] Height
	 */
	function Cylinder(radialSamples, radiusTop, radiusBottom, height) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			radialSamples = props.radialSamples;
			radiusTop = props.radiusTop;
			radiusBottom = props.radiusBottom;
			height = props.height;
		}
		this.radialSamples = radialSamples || 8;
		this.radiusTop = typeof radiusTop === 'undefined' ? 0.5 : radiusTop;
		this.radiusBottom = typeof radiusBottom === 'undefined' ? this.radiusTop : radiusBottom;
		this.height = typeof height === 'undefined' ? 1 : height;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, this.radialSamples * 4 + 2 + 2, (this.radialSamples * 3) * 4);

		// could be done better with 2 triangle fans and a triangle strip
		this.indexModes = ['Triangles'];

		this.rebuild();
	}

	Cylinder.prototype = Object.create(MeshData.prototype);
	Cylinder.prototype.constructor = Cylinder;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Cylinder} Self for chaining.
	 */
	Cylinder.prototype.rebuild = function () {
		var verts = [];
		var norms = [];
		var tex = [];
		var indices = [];
		var height = this.height;
		var halfHeight = height / 2;
		var radiusTop = this.radiusTop;
		var radiusBottom = this.radiusBottom;
		var radialSamples = this.radialSamples;

		var ak = Math.PI * 2 / radialSamples;
		var at = 1 / radialSamples;

		var lastIndex = radialSamples * 4 + 2 + 2 - 1;
		var normal = new Vector3();

		var tan = 0;
		if (height) {
			tan = Math.tan((radiusBottom - radiusTop) / height);
		}

		for (var i = 0, k = 0, t = 0; i < radialSamples; i++, k += ak, t += at) {
			var cos = Math.cos(k);
			var sin = Math.sin(k);
			var xTop = cos * radiusTop;
			var yTop = sin * radiusTop;
			var xBottom = cos * radiusBottom;
			var yBottom = sin * radiusBottom;

			verts.push(
				xTop, yTop, halfHeight, // disk top
				xBottom, yBottom, -halfHeight, // disk bottom
				xTop, yTop, halfHeight,  // side top
				xBottom, yBottom, -halfHeight  // side bottom
			);

			normal.setDirect(cos, sin, tan);
			normal.normalize();

			norms.push(
				0, 0, 1,
				0, 0, -1,
				normal.x, normal.y, normal.z,
				normal.x, normal.y, normal.z
				//cos, sin, 0,
				//cos, sin, 0
			);

			tex.push(
				cos / 4 + 0.25, sin / 4 + 0.75,
				cos / 4 + 0.25, sin / 4 + 0.25,
				0.5, t,
				1.0, t
			);
		}

		verts.push(
			radiusTop, 0.0, halfHeight,
			radiusBottom, 0.0, -halfHeight
		);

		norms.push(
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0
		);

		tex.push(
			0.5, 1.0,
			1.0, 1.0
		);

		for (var i = 0; i < radialSamples - 1; i++) {
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
			0, 0, -halfHeight,
			0, 0, halfHeight
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

	/**
	 * Returns a clone of this cylinder
	 * @returns {Cylinder}
	 */
	Cylinder.prototype.clone = function () {
		var options = _.shallowSelectiveClone(this, ['radialSamples', 'radiusTop', 'radiusBottom', 'height']);

		return new Cylinder(options);
	};

	module.exports = Cylinder;