define([
	'goo/renderer/MeshData',
	'goo/util/Enum',
	'goo/math/Vector3',
	'goo/math/MathUtils'
],
/** @lends */
function (
	MeshData,
	Enum,
	Vector3,
	MathUtils
) {
	"use strict";

	/**
	 * @class A 3D object representing a cylinder.
	 * @param {number} [radialSamples=8] Number of slices.
	 * @param {number} [radius=0.5] Radius.
	 * @param {Enum} [textureMode=Cylinder.TextureModes.Polar] Texture wrapping mode.
	 */
	function Cylinder(radialSamples, radius, textureMode) {
		if(arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			radialSamples = props.radialSamples;
			radius = props.radius;
			textureMode = props.textureMode;
		}
		/** Number of slices.
		 * @type {number}
		 * @default 8
		 */
		this.radialSamples = radialSamples !== undefined ? radialSamples : 8;
		/** @type {number}
		 * @default 0.5
		 */
		this.radius = radius !== undefined ? radius : 0.5;
		/** Texture wrapping mode.
		 * @type {Enum}
		 * @default Cylinder.TextureModes.Polar
		 */
		this.textureMode = textureMode !== undefined ? textureMode : Cylinder.TextureModes.Polar;

		/** Inward-facing normals, for skydomes.
		 * @type {boolean}
		 * @default
		 */
		this.viewInside = false;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var verts = 2 * (this.radialSamples + 1) + 2;
		var tris = 6 * 2 * this.radialSamples;

		MeshData.call(this, attributeMap, verts, tris);

		this.rebuild();
	}

	Cylinder.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Cylinder} Self for chaining.
	 */
	Cylinder.prototype.rebuild = function () {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var norms = this.getAttributeBuffer(MeshData.NORMAL);
		var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = this.getIndexBuffer();

		// generate geometry
		var fInvRS = 1.0 / this.radialSamples;
		var fZFactor = 2.0 / 3.0;

		// Generate points on the unit circle to be used in computing the mesh
		// points on a cylinder slice.
		var afSin = [];
		var afCos = [];
		for (var iR = 0; iR < this.radialSamples; iR++) {
			var fAngle = MathUtils.TWO_PI * fInvRS * iR;
			afCos[iR] = Math.cos(fAngle);
			afSin[iR] = Math.sin(fAngle);
		}
		afSin[this.radialSamples] = afSin[0];
		afCos[this.radialSamples] = afCos[0];

		// generate the cylinder itself
		var i = 0;
		var tempVa = new Vector3();
		var tempVb = new Vector3();
		var tempVc = new Vector3();

		for (var iZ = 1; iZ < 3; iZ++) {
			var fAFraction = MathUtils.HALF_PI * (-1.0 + fZFactor * iZ); // in (-pi/2, pi/2)
			var fZFraction = Math.sin(fAFraction); // in (-1,1)
			var fZ = this.radius * fZFraction;

			// compute center of slice
			var kSliceCenter = tempVb.set(0, 0, 0);
			kSliceCenter.z = iZ - 1.5;

			// compute radius of slice
			var fSliceRadius = Math.sqrt(Math.abs(this.radius * this.radius - fZ * fZ));

			// compute slice vertices with duplication at end point
			var kNormal;
			var iSave = i;
			for (var iR = 0; iR < this.radialSamples; iR++) {
				var fRadialFraction = iR * fInvRS; // in [0,1)
				var kRadial = tempVc.set(afCos[iR], afSin[iR], 0);
				Vector3.mul(kRadial, fSliceRadius, tempVa);

				vbuf[i * 3 + 0] = kSliceCenter.x + tempVa.x;
				vbuf[i * 3 + 1] = kSliceCenter.y + tempVa.y;
				vbuf[i * 3 + 2] = kSliceCenter.z + tempVa.z;

				kNormal = tempVa.set(vbuf[i * 3 + 0], vbuf[i * 3 + 1], vbuf[i * 3 + 2]);
				kNormal.normalize();
				if (!this.viewInside) {
					norms[i * 3 + 0] = kNormal.x;
					norms[i * 3 + 1] = kNormal.y;
					norms[i * 3 + 2] = kNormal.z;
				} else {
					norms[i * 3 + 0] = -kNormal.x;
					norms[i * 3 + 1] = -kNormal.y;
					norms[i * 3 + 2] = -kNormal.z;
				}

				if (this.textureMode === Cylinder.TextureModes.Linear) {
					texs[i * 2 + 0] = fRadialFraction;
					texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
				} else if (this.textureMode === Cylinder.TextureModes.Projected) {
					texs[i * 2 + 0] = fRadialFraction;
					texs[i * 2 + 1] = MathUtils.HALF_PI + Math.asin(fZFraction) / Math.PI;
				} else if (this.textureMode === Cylinder.TextureModes.Polar) {
					var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
					var u = r * afCos[iR] + 0.5;
					var v = r * afSin[iR] + 0.5;
					texs[i * 2 + 0] = u;
					texs[i * 2 + 1] = v;
				}

				i++;
			}

			copyInternal(vbuf, iSave, i);
			copyInternal(norms, iSave, i);

			if (this.textureMode === Cylinder.TextureModes.Linear) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
			} else if (this.textureMode === Cylinder.TextureModes.Projected) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = MathUtils.INV_PI * (MathUtils.HALF_PI + Math.asin(fZFraction));
			} else if (this.textureMode === Cylinder.TextureModes.Polar) {
				var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
				texs[i * 2 + 0] = r + 0.5;
				texs[i * 2 + 1] = 0.5;
			}

			i++;
		}

		// south pole
		vbuf[i * 3 + 0] = 0;
		vbuf[i * 3 + 1] = 0;
		vbuf[i * 3 + 2] = -0.5;

		if (!this.viewInside) {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = -1;
		} else {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = 1;
		}

		if (this.textureMode === Cylinder.TextureModes.Polar) {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.5;
		} else {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.0;
		}

		i++;

		// north pole
		vbuf[i * 3 + 0] = 0;
		vbuf[i * 3 + 1] = 0;
		vbuf[i * 3 + 2] = 0.5;

		if (!this.viewInside) {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = 1;
		} else {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = -1;
		}

		if (this.textureMode === Cylinder.TextureModes.Polar) {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.5;
		} else {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 1.0;
		}

		// generate connectivity
		var index = 0;
		var iZStart = 0;
		var i0 = iZStart;
		var i1 = i0 + 1;
		iZStart += this.radialSamples + 1;
		var i2 = iZStart;
		var i3 = i2 + 1;
		for (var i = 0; i < this.radialSamples; i++) {
			if (!this.viewInside) {
				indices[index++] = i0++;
				indices[index++] = i1;
				indices[index++] = i2;
				indices[index++] = i1++;
				indices[index++] = i3++;
				indices[index++] = i2++;
			} else {
				indices[index++] = i0++;
				indices[index++] = i2;
				indices[index++] = i1;
				indices[index++] = i1++;
				indices[index++] = i2++;
				indices[index++] = i3++;
			}
		}

		// south pole triangles
		for (var i = 0; i < this.radialSamples; i++) {
			if (!this.viewInside) {
				indices[index++] = i;
				indices[index++] = this.vertexCount - 2;
				indices[index++] = i + 1;
			} else {
				indices[index++] = i;
				indices[index++] = i + 1;
				indices[index++] = this.vertexCount - 2;
			}
		}

		// north pole triangles
		var iOffset = this.radialSamples + 1;
		for (var i = 0; i < this.radialSamples; i++) {
			if (!this.viewInside) {
				indices[index++] = i + iOffset;
				indices[index++] = i + 1 + iOffset;
				indices[index++] = this.vertexCount - 1;
			} else {
				indices[index++] = i + iOffset;
				indices[index++] = this.vertexCount - 1;
				indices[index++] = i + 1 + iOffset;
			}
		}

		return this;
	};

	function copyInternal(buf, from, to) {
		buf[to * 3 + 0] = buf[from * 3 + 0];
		buf[to * 3 + 1] = buf[from * 3 + 1];
		buf[to * 3 + 2] = buf[from * 3 + 2];
	}

	/** Possible texture wrapping modes: Linear, Projected, Polar
	 * @type {Enum}
	 */
	Cylinder.TextureModes = new Enum('Linear', 'Projected', 'Polar');

	return Cylinder;
});