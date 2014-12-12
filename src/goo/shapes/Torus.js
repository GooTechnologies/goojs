define([
	'goo/renderer/MeshData',
	'goo/math/Vector3',
	'goo/math/MathUtils'
],
/** @lends */
function (
	MeshData,
	Vector3,
	MathUtils
) {
	'use strict';

	/**
	 * @class A donut-shaped model.
	 * @param {number} [circleSamples=8] Number of segments.
	 * @param {number} [radialSamples=8] Number of slices.
	 * @param {number} [tubeRadius=1] Radius of tube.
	 * @param {number} [centerRadius=2] Radius from center.
	 */
	function Torus(circleSamples, radialSamples, tubeRadius, centerRadius) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			circleSamples = props.circleSamples;
			radialSamples = props.radialSamples;
			tubeRadius = props.tubeRadius;
			centerRadius = props.centerRadius;
		}
		this._circleSamples = circleSamples !== undefined ? circleSamples : 8;
		this._radialSamples = radialSamples !== undefined ? radialSamples : 8;
		this._tubeRadius = tubeRadius !== undefined ? tubeRadius : 1;
		this._centerRadius = centerRadius !== undefined ? centerRadius : 2;

		/** Inward-facing normals.
		 * @type {boolean}
		 * @default
		 */
		this.viewInside = false;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var vertices = (this._circleSamples + 1) * (this._radialSamples + 1);
		var indices = 6 * this._circleSamples * this._radialSamples;
		MeshData.call(this, attributeMap, vertices, indices);

		this.rebuild();
	}

	Torus.prototype = Object.create(MeshData.prototype);
	Torus.prototype.constructor = Torus;

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Torus} Self for chaining.
	 */
	Torus.prototype.rebuild = function () {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var norms = this.getAttributeBuffer(MeshData.NORMAL);
		var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = this.getIndexBuffer();

		// generate geometry
		var inverseCircleSamples = 1.0 / this._circleSamples;
		var inverseRadialSamples = 1.0 / this._radialSamples;
		var i = 0;
		// generate the cylinder itself
		var radialAxis = new Vector3(), torusMiddle = new Vector3(), tempNormal = new Vector3();
		for (var circleCount = 0; circleCount < this._circleSamples; circleCount++) {
			// compute center point on torus circle at specified angle
			var circleFraction = circleCount * inverseCircleSamples;
			var theta = MathUtils.TWO_PI * circleFraction;
			var cosTheta = Math.cos(theta);
			var sinTheta = Math.sin(theta);
			radialAxis.set(cosTheta, sinTheta, 0);
			Vector3.mul(radialAxis, this._centerRadius, torusMiddle);

			// compute slice vertices with duplication at end point
			var iSave = i;
			for (var radialCount = 0; radialCount < this._radialSamples; radialCount++) {
				var radialFraction = radialCount * inverseRadialSamples;
				// in [0,1)
				var phi = MathUtils.TWO_PI * radialFraction;
				var cosPhi = Math.cos(phi);
				var sinPhi = Math.sin(phi);

				tempNormal.copy(radialAxis).mul(cosPhi);
				tempNormal.z = tempNormal.z + sinPhi;
				tempNormal.normalize();

				if (!this.viewInside) {
					norms[i * 3 + 0] = tempNormal.x;
					norms[i * 3 + 1] = tempNormal.y;
					norms[i * 3 + 2] = tempNormal.z;
				} else {
					norms[i * 3 + 0] = -tempNormal.x;
					norms[i * 3 + 1] = -tempNormal.y;
					norms[i * 3 + 2] = -tempNormal.z;
				}

				tempNormal.mul(this._tubeRadius).add(torusMiddle);

				vbuf[i * 3 + 0] = tempNormal.x;
				vbuf[i * 3 + 1] = tempNormal.y;
				vbuf[i * 3 + 2] = tempNormal.z;

				texs[i * 2 + 0] = radialFraction;
				texs[i * 2 + 1] = circleFraction;

				i++;
			}

			copyInternal(vbuf, iSave, i);
			copyInternal(norms, iSave, i);

			texs[i * 2 + 0] = 1.0;
			texs[i * 2 + 1] = circleFraction;

			i++;
		}

		// duplicate the cylinder ends to form a torus
		for (var iR = 0; iR <= this._radialSamples; iR++, i++) {
			copyInternal(vbuf, iR, i);
			copyInternal(norms, iR, i);
			copyInternal2(texs, iR, i);
			texs[i * 2 + 1] = 1.0;
		}

		// generate connectivity
		var index = 0;
		var connectionStart = 0;
		for (var circleCount = 0; circleCount < this._circleSamples; circleCount++) {
			var i0 = connectionStart;
			var i1 = i0 + 1;
			connectionStart += this._radialSamples + 1;
			var i2 = connectionStart;
			var i3 = i2 + 1;
			for (i = 0; i < this._radialSamples; i++) {
				if (!this.viewInside) {
					indices[index++] = i0++;
					indices[index++] = i2;
					indices[index++] = i1;
					indices[index++] = i1++;
					indices[index++] = i2++;
					indices[index++] = i3++;
				} else {
					indices[index++] = i0++;
					indices[index++] = i1;
					indices[index++] = i2;
					indices[index++] = i1++;
					indices[index++] = i3++;
					indices[index++] = i2++;
				}
			}
		}

		return this;
	};

	function copyInternal(buf, from, to) {
		buf[to * 3 + 0] = buf[from * 3 + 0];
		buf[to * 3 + 1] = buf[from * 3 + 1];
		buf[to * 3 + 2] = buf[from * 3 + 2];
	}

	function copyInternal2(buf, from, to) {
		buf[to * 2 + 0] = buf[from * 2 + 0];
		buf[to * 2 + 1] = buf[from * 2 + 1];
	}

	return Torus;
});