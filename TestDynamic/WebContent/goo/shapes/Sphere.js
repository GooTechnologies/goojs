define(['goo/renderer/MeshData', 'goo/util/Enum', 'goo/math/Vector3', 'goo/math/MathUtils'], function(MeshData, Enum, Vector3, MathUtils) {
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

		this.viewInside = false;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var verts = (this.zSamples - 2) * (this.radialSamples + 1) + 2;
		var tris = 6 * (this.zSamples - 2) * this.radialSamples;

		MeshData.call(this, attributeMap, verts, tris);

		this.rebuild();
	}

	Sphere.prototype.rebuild = function() {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var norms = this.getAttributeBuffer(MeshData.NORMAL);
		var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = this.getIndexBuffer();

		// generate geometry
		var fInvRS = 1.0 / this.radialSamples;
		var fZFactor = 2.0 / (this.zSamples - 1);

		// Generate points on the unit circle to be used in computing the mesh
		// points on a sphere slice.
		var afSin = [];
		var afCos = [];
		for ( var iR = 0; iR < this.radialSamples; iR++) {
			var fAngle = MathUtils.TWO_PI * fInvRS * iR;
			afCos[iR] = Math.cos(fAngle);
			afSin[iR] = Math.sin(fAngle);
		}
		afSin[this.radialSamples] = afSin[0];
		afCos[this.radialSamples] = afCos[0];

		// generate the sphere itself
		var i = 0;
		var tempVa = new Vector3();
		var tempVb = new Vector3();
		var tempVc = new Vector3();
		for ( var iZ = 1; iZ < this.zSamples - 1; iZ++) {
			var fAFraction = MathUtils.HALF_PI * (-1.0 + fZFactor * iZ); // in (-pi/2, pi/2)
			var fZFraction = Math.sin(fAFraction); // in (-1,1)
			var fZ = this.radius * fZFraction;

			// compute center of slice
			var kSliceCenter = tempVb.set(0, 0, 0);
			kSliceCenter.z += fZ;

			// compute radius of slice
			var fSliceRadius = Math.sqrt(Math.abs(this.radius * this.radius - fZ * fZ));

			// compute slice vertices with duplication at end point
			var kNormal;
			var iSave = i;
			for ( var iR = 0; iR < this.radialSamples; iR++) {
				var fRadialFraction = iR * fInvRS; // in [0,1)
				var kRadial = tempVc.set(afCos[iR], afSin[iR], 0);
				Vector3.scalarMul(kRadial, fSliceRadius, tempVa);

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

				if (this.textureMode == Sphere.TextureModes.Linear) {
					texs[i * 2 + 0] = fRadialFraction;
					texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
				} else if (this.textureMode == Sphere.TextureModes.Projected) {
					texs[i * 2 + 0] = fRadialFraction;
					texs[i * 2 + 1] = MathUtils.HALF_PI + Math.asin(fZFraction) / Math.PI;
				} else if (this.textureMode == Sphere.TextureModes.Polar) {
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

			if (this.textureMode == Sphere.TextureModes.Linear) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
			} else if (this.textureMode == Sphere.TextureModes.Projected) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = MathUtils.INV_PI * (MathUtils.HALF_PI + Math.asin(fZFraction));
			} else if (this.textureMode == Sphere.TextureModes.Polar) {
				var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
				texs[i * 2 + 0] = r + 0.5;
				texs[i * 2 + 1] = 0.5;
			}

			i++;
		}

		// south pole
		vbuf[i * 3 + 0] = 0;
		vbuf[i * 3 + 1] = 0;
		vbuf[i * 3 + 2] = -this.radius;

		if (!this.viewInside) {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = -1;
		} else {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = 1;
		}

		if (this.textureMode == Sphere.TextureModes.Polar) {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.5;
		} else {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.0;
		}

		i++;

		// north pole
		vbuf[(i + 1) * 3 + 0] = 0;
		vbuf[(i + 1) * 3 + 1] = 0;
		vbuf[(i + 1) * 3 + 2] = this.radius;

		if (!this.viewInside) {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = 1;
		} else {
			norms[i * 3 + 0] = 0;
			norms[i * 3 + 1] = 0;
			norms[i * 3 + 2] = -1;
		}

		if (this.textureMode == Sphere.TextureModes.Polar) {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 0.5;
		} else {
			texs[i * 2 + 0] = 0.5;
			texs[i * 2 + 1] = 1.0;
		}

		// generate connectivity
		for ( var iZ = 0, iZStart = 0; iZ < _zSamples - 3; iZ++) {
			var i0 = iZStart;
			var i1 = i0 + 1;
			iZStart += _radialSamples + 1;
			var i2 = iZStart;
			var i3 = i2 + 1;
			for ( var i = 0; i < _radialSamples; i++) {
				if (!_viewInside) {
					_meshData.getIndices().put(i0++);
					_meshData.getIndices().put(i1);
					_meshData.getIndices().put(i2);
					_meshData.getIndices().put(i1++);
					_meshData.getIndices().put(i3++);
					_meshData.getIndices().put(i2++);
				} else // inside view
				{
					_meshData.getIndices().put(i0++);
					_meshData.getIndices().put(i2);
					_meshData.getIndices().put(i1);
					_meshData.getIndices().put(i1++);
					_meshData.getIndices().put(i2++);
					_meshData.getIndices().put(i3++);
				}
			}
		}

		// south pole triangles
		for ( var i = 0; i < _radialSamples; i++) {
			if (!_viewInside) {
				_meshData.getIndices().put(i);
				_meshData.getIndices().put(_meshData.getVertexCount() - 2);
				_meshData.getIndices().put(i + 1);
			} else // inside view
			{
				_meshData.getIndices().put(i);
				_meshData.getIndices().put(i + 1);
				_meshData.getIndices().put(_meshData.getVertexCount() - 2);
			}
		}

		// north pole triangles
		final
		var iOffset = (_zSamples - 3) * (_radialSamples + 1);
		for ( var i = 0; i < _radialSamples; i++) {
			if (!_viewInside) {
				_meshData.getIndices().put(i + iOffset);
				_meshData.getIndices().put(i + 1 + iOffset);
				_meshData.getIndices().put(_meshData.getVertexCount() - 1);
			} else // inside view
			{
				_meshData.getIndices().put(i + iOffset);
				_meshData.getIndices().put(_meshData.getVertexCount() - 1);
				_meshData.getIndices().put(i + 1 + iOffset);
			}
		}

		return this;
	};

	function copyInternal(buf, from, to) {
		buf[to * 3 + 0] = buf[from * 3 + 0];
		buf[to * 3 + 1] = buf[from * 3 + 1];
		buf[to * 3 + 2] = buf[from * 3 + 2];
	}

	Sphere.TextureModes = new Enum('Linear', 'Projected', 'Polar');

	return Sphere;
});