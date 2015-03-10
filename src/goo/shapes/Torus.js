define([
	'goo/renderer/MeshData',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/util/ObjectUtil'
], function (
	MeshData,
	Vector3,
	MathUtils,
	_
) {
	'use strict';

	/**
	 * A donut-shaped model.
	 * @extends MeshData
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
		this.circleSamples = circleSamples !== undefined ? circleSamples : 8;
		this.radialSamples = radialSamples !== undefined ? radialSamples : 8;
		this.tubeRadius = tubeRadius !== undefined ? tubeRadius : 1;
		this.centerRadius = centerRadius !== undefined ? centerRadius : 2;

		/** Inward-facing normals.
		 * @type {boolean}
		 * @default
		 */
		this.viewInside = false;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var vertices = (this.circleSamples + 1) * (this.radialSamples + 1);
		var indices = 6 * this.circleSamples * this.radialSamples;
		MeshData.call(this, attributeMap, vertices, indices);

		this.rebuild();
	}

	Torus.prototype = Object.create(MeshData.prototype);
	Torus.prototype.constructor = Torus;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Torus} Self for chaining.
	 */
	Torus.prototype.rebuild = function () {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var norms = this.getAttributeBuffer(MeshData.NORMAL);
		var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = this.getIndexBuffer();

		// generate geometry
		var inverseCircleSamples = 1.0 / this.circleSamples;
		var inverseRadialSamples = 1.0 / this.radialSamples;
		var i = 0;
		// generate the cylinder itself
		var radialAxis = new Vector3(), torusMiddle = new Vector3(), tempNormal = new Vector3();
		for (var circleCount = 0; circleCount < this.circleSamples; circleCount++) {
			// compute center point on torus circle at specified angle
			var circleFraction = circleCount * inverseCircleSamples;
			var theta = MathUtils.TWO_PI * circleFraction;
			var cosTheta = Math.cos(theta);
			var sinTheta = Math.sin(theta);
			radialAxis.set(cosTheta, sinTheta, 0);
			torusMiddle.copy(radialAxis).scale(this.centerRadius);

			// compute slice vertices with duplication at end point
			var iSave = i;
			for (var radialCount = 0; radialCount < this.radialSamples; radialCount++) {
				var radialFraction = radialCount * inverseRadialSamples;
				// in [0,1)
				var phi = MathUtils.TWO_PI * radialFraction;
				var cosPhi = Math.cos(phi);
				var sinPhi = Math.sin(phi);

				tempNormal.copy(radialAxis).scale(cosPhi);
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

				tempNormal.scale(this.tubeRadius).addVector(torusMiddle);

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
		for (var iR = 0; iR <= this.radialSamples; iR++, i++) {
			copyInternal(vbuf, iR, i);
			copyInternal(norms, iR, i);
			copyInternal2(texs, iR, i);
			texs[i * 2 + 1] = 1.0;
		}

		// generate connectivity
		var index = 0;
		var connectionStart = 0;
		for (var circleCount = 0; circleCount < this.circleSamples; circleCount++) {
			var i0 = connectionStart;
			var i1 = i0 + 1;
			connectionStart += this.radialSamples + 1;
			var i2 = connectionStart;
			var i3 = i2 + 1;
			for (i = 0; i < this.radialSamples; i++) {
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

	//! AT: there's a method for doing this exact thing on typed arrays, copyWithin()
	function copyInternal(buf, from, to) {
		buf[to * 3 + 0] = buf[from * 3 + 0];
		buf[to * 3 + 1] = buf[from * 3 + 1];
		buf[to * 3 + 2] = buf[from * 3 + 2];
	}

	function copyInternal2(buf, from, to) {
		buf[to * 2 + 0] = buf[from * 2 + 0];
		buf[to * 2 + 1] = buf[from * 2 + 1];
	}

	/**
	 * Returns a clone of this texture torus
	 * @returns {Torus}
	 */
	Torus.prototype.clone = function () {
		var options = _.shallowSelectiveClone(this,
			['circleSamples', 'radialSamples', 'tubeRadius', 'centerRadius']);

		return new Torus(options);
	};

	return Torus;
});