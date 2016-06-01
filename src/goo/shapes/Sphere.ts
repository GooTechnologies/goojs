import MeshData = require('../renderer/MeshData');
import Vector3 = require('../math/Vector3');
import MathUtils = require('../math/MathUtils');
import ObjectUtils = require('../util/ObjectUtils');

/**
 * A 3D object with all points equi-distance from a center point.
 * @extends MeshData
 * @param {number} [zSamples=8] Number of segments.
 * @param {number} [radialSamples=8] Number of slices.
 * @param {number} [radius=0.5] Radius.
 * @param {Enum} [textureMode=Sphere.TextureModes.Polar] Texture wrapping mode.
 */
class Sphere extends MeshData {
	/** Number of segments.
	 * @type {number}
	 * @default 8
	 */
	zSamples: number;
	/** Number of slices.
	 * @type {number}
	 * @default 8
	 */
	radialSamples: number;
	/** @type {number}
	 * @default 0.5
	 */
	radius: number;

	/** Texture wrapping mode.
	 * @type {Enum}
	 * @default Sphere.TextureModes.Polar
	 */
	textureMode: string;

	/** Inward-facing normals, for skydomes.
	 * @type {boolean}
	 * @default false
	 */
	viewInside: boolean;

	_useSharedPoleVertices: boolean;

	constructor(zSamples: number = 8, radialSamples: number = 8, radius: number = 0.5, textureMode: string = Sphere.TextureModes.Polar) {
		// sharedVert = pole vertex that represents a whole layer. When not using shared vertices,
		// full layers are used for both poles.
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			zSamples = props.zSamples;
			radialSamples = props.radialSamples;
			radius = props.radius;
			textureMode = props.textureMode;
		}
		if (typeof textureMode === 'string') {
			textureMode = Sphere.TextureModes[textureMode];
		}
		var _useSharedPoleVertices = (textureMode !== Sphere.TextureModes.Projected) && (textureMode !== Sphere.TextureModes.Linear);
		var sharedVerts = _useSharedPoleVertices ? 2 : 0;
		zSamples++;
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		var samples = (textureMode === Sphere.TextureModes.Chromeball) ? zSamples + 1 : zSamples;

		var verts = (samples - sharedVerts) * (radialSamples + 1) + sharedVerts;
		// If Projected & Linear use shared pole vertices the uv-mapping will get too distorted, so let them
		// have full 'rings' of vertices for a straighter texture mapping.
		var tris = 6 * ((samples) - 2) * radialSamples;
		super(attributeMap, verts, tris);

		this._useSharedPoleVertices = _useSharedPoleVertices;

		this.zSamples = zSamples;
		this.radialSamples = radialSamples;
		this.radius = radius !== undefined ? radius : 0.5;

		this.textureMode = textureMode !== undefined ? textureMode : Sphere.TextureModes.Polar;
		this.viewInside = false;

		this.rebuild();
	}

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Sphere} Self for chaining.
	 */
	rebuild() {
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
		for (var iR = 0; iR < this.radialSamples; iR++) {
			var fAngle = MathUtils.TWO_PI * fInvRS * iR;
			afCos[iR] = Math.cos(fAngle);
			afSin[iR] = Math.sin(fAngle);
		}
		afSin[this.radialSamples] = afSin[0];
		afCos[this.radialSamples] = afCos[0];

		// z range to generate vertices for. If sharing pole vertices, skip those layers.
		var zBegin = 0;
		var zEnd = this.zSamples;

		if (this._useSharedPoleVertices) {
			zBegin = 1;
			zEnd = this.zSamples - 1;
		}

		// generate the sphere itself
		var i = 0;
		var tempVa = new Vector3();
		var tempVb = new Vector3();
		var tempVc = new Vector3();
		for (var iZ = zBegin; iZ < zEnd; iZ++) {
			var fAFraction = MathUtils.HALF_PI * (-1.0 + fZFactor * iZ); // in (-pi / 2, pi / 2)
			var fZFraction = Math.sin(fAFraction); // in (-1, 1)
			var fZ = this.radius * fZFraction;

			// compute center of slice
			var kSliceCenter = tempVb.setDirect(0, 0, 0);
			kSliceCenter.z += fZ;

			// compute radius of slice
			var fSliceRadius = Math.sqrt(Math.abs(this.radius * this.radius - fZ * fZ));

			// compute slice vertices with duplication at end point
			var kNormal;
			var iSave = i;
			for (var iR = 0; iR < this.radialSamples; iR++) {
				var fRadialFraction = iR * fInvRS; // in [0, 1)
				var kRadial = tempVc.setDirect(afCos[iR], afSin[iR], 0);
				tempVa.copy(kRadial).scale(fSliceRadius);

				vbuf[i * 3 + 0] = kSliceCenter.x + tempVa.x;
				vbuf[i * 3 + 1] = kSliceCenter.y + tempVa.y;
				vbuf[i * 3 + 2] = kSliceCenter.z + tempVa.z;

				kNormal = tempVa.setDirect(vbuf[i * 3 + 0], vbuf[i * 3 + 1], vbuf[i * 3 + 2]);
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

				// When not having shared pole vertices: ajustment of u at the poles for linear & projected modes.
				// This is because at the pole we squeeze a quad into a triangle, so this centers the pointy end of it.
				var uOffset = 0;
				if (!this._useSharedPoleVertices && (iZ === zBegin || iZ === (zEnd - 1))) {
					uOffset = 0.5 * fInvRS;
				}

				if (this.textureMode === Sphere.TextureModes.Linear) {
					texs[i * 2 + 0] = fRadialFraction + uOffset;
					texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
				} else if (this.textureMode === Sphere.TextureModes.Projected) {
					texs[i * 2 + 0] = fRadialFraction + uOffset;
					texs[i * 2 + 1] = (MathUtils.HALF_PI + Math.asin(fZFraction)) / Math.PI;
				} else if (this.textureMode === Sphere.TextureModes.Polar) {
					var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
					var u = r * afCos[iR] + 0.5;
					var v = r * afSin[iR] + 0.5;
					texs[i * 2 + 0] = u;
					texs[i * 2 + 1] = v;
				} else if (this.textureMode === Sphere.TextureModes.Chromeball) {
					var r = Math.sin((MathUtils.HALF_PI + fAFraction) / 2);
					r /= 2;
					var u = r * afCos[iR] + 0.5;
					var v = r * afSin[iR] + 0.5;
					texs[i * 2 + 0] = u;
					texs[i * 2 + 1] = v;
				}

				i++;
			}

			copyInternal(vbuf, iSave, i);
			copyInternal(norms, iSave, i);

			if (this.textureMode === Sphere.TextureModes.Linear) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = 0.5 * (fZFraction + 1.0);
			} else if (this.textureMode === Sphere.TextureModes.Projected) {
				texs[i * 2 + 0] = 1.0;
				texs[i * 2 + 1] = (MathUtils.HALF_PI + Math.asin(fZFraction)) / Math.PI;
			} else if (this.textureMode === Sphere.TextureModes.Polar) {
				var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
				texs[i * 2 + 0] = r + 0.5;
				texs[i * 2 + 1] = 0.5;
			} else if (this.textureMode === Sphere.TextureModes.Chromeball) {
				var r = Math.sin((MathUtils.HALF_PI + fAFraction) / 2);
				r /= 2;
				texs[i * 2 + 0] = r + 0.5;
				texs[i * 2 + 1] = 0.5;
			}

			i++;
		}
		// We need to add an extra slice so the north pole doesn't look freake
		if (this.textureMode === Sphere.TextureModes.Chromeball) {
			var epsilonAngle = MathUtils.HALF_PI - 1e-3;
			var z = this.radius * Math.sin(epsilonAngle);
			var sliceR = Math.sqrt(Math.abs(this.radius * this.radius - z * z));
			var iSave = i;
			for (var iR = 0; iR < this.radialSamples; iR++) {
				vbuf[i * 3 + 0] = sliceR * afCos[iR];
				vbuf[i * 3 + 1] = sliceR * afSin[iR];
				vbuf[i * 3 + 2] = z;

				kNormal = tempVa.setDirect(vbuf[i * 3 + 0], vbuf[i * 3 + 1], vbuf[i * 3 + 2]);
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
				var r = Math.sin((MathUtils.HALF_PI + epsilonAngle) / 2);
				r /= 2;
				var u = r * afCos[iR] + 0.5;
				var v = r * afSin[iR] + 0.5;
				texs[i * 2 + 0] = u;
				texs[i * 2 + 1] = v;
				i++;
			}
			copyInternal(vbuf, iSave, i);
			copyInternal(norms, iSave, i);
			var r = Math.sin((MathUtils.HALF_PI + epsilonAngle) / 2);
			r /= 2;
			texs[i * 2 + 0] = r + 0.5;
			texs[i * 2 + 1] = 0.5;
			i++;
		}

		if (this._useSharedPoleVertices) {
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

			if (this.textureMode === Sphere.TextureModes.Polar || this.textureMode === Sphere.TextureModes.Chromeball) {
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
			vbuf[i * 3 + 2] = this.radius;

			if (!this.viewInside) {
				norms[i * 3 + 0] = 0;
				norms[i * 3 + 1] = 0;
				norms[i * 3 + 2] = 1;
			} else {
				norms[i * 3 + 0] = 0;
				norms[i * 3 + 1] = 0;
				norms[i * 3 + 2] = -1;
			}

			if (this.textureMode === Sphere.TextureModes.Polar) {
				texs[i * 2 + 0] = 0.5;
				texs[i * 2 + 1] = 0.5;
			} else if (this.textureMode === Sphere.TextureModes.Chromeball) {
				texs[i * 2 + 0] = 1;
				texs[i * 2 + 1] = -0.5;
			} else {
				texs[i * 2 + 0] = 0.5;
				texs[i * 2 + 1] = 1.0;
			}
		}

		// generate connectivity
		var index = 0;

		var samples = (this.textureMode === Sphere.TextureModes.Chromeball) ? this.zSamples + 1 : this.zSamples;

		var iZStart = 0;
		if (!this._useSharedPoleVertices) {
			// When triangles at the pole dont use a shared vertices, there's an extra pole layer here that will be
			// used only for the pole.
			iZStart = this.radialSamples + 1;
		}

		for (var iZ = 0; iZ < samples - 3; iZ++) {
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
		}

		// south pole triangles
		var i0: number, i1: number, i2: number;
		for (var i = 0; i < this.radialSamples; i++) {

			if (!this._useSharedPoleVertices) {
				i0 = i;
				i1 = i + this.radialSamples + 2;
				i2 = i + this.radialSamples + 1;
			} else {
				i0 = i;
				i1 = this.vertexCount - 2;
				i2 = i + 1;
			}

			if (!this.viewInside) {
				indices[index++] = i0;
				indices[index++] = i1;
				indices[index++] = i2;
			} else {
				indices[index++] = i0;
				indices[index++] = i2;
				indices[index++] = i1;
			}
		}

		// north pole triangles
		// - point iOffset point to the start of the last generated ring of vertices
		var iOffset = (zEnd - zBegin - 1) * (this.radialSamples + 1);
		for (var i = 0; i < this.radialSamples; i++) {
			if (!this._useSharedPoleVertices) {
				// as we are in the last pole ring (with iOffset added), step back to the
				// next-to-last as there is no pole vertex in this mode.
				i0 = i + iOffset - this.radialSamples - 1;
				i1 = i + iOffset - this.radialSamples;
				i2 = i + iOffset;
			} else {
				i0 = i + iOffset;
				i1 = i + 1 + iOffset;
				i2 = this.vertexCount - 1;
			}

			if (!this.viewInside) {
				indices[index++] = i0;
				indices[index++] = i1;
				indices[index++] = i2;
			} else {
				indices[index++] = i0;
				indices[index++] = i2;
				indices[index++] = i1;
			}
		}
		return this;
	};

	/**
	 * Returns a clone of this sphere
	 * @returns {Sphere}
	 */
	clone() {
		return new Sphere(this.zSamples, this.radialSamples, this.radius, this.textureMode);
	};

	/** Possible texture wrapping modes: Linear, Projected, Polar, Chromeball
	 * @type {Object}
	 */
	static TextureModes = {
		Linear: 'Linear',
		Projected: 'Projected',
		Polar: 'Polar',
		Chromeball: 'Chromeball'
	};
}

//! AT: there's a method for doing this exact thing on typed arrays, copyWithin()
function copyInternal(buf, from, to) {
	buf[to * 3 + 0] = buf[from * 3 + 0];
	buf[to * 3 + 1] = buf[from * 3 + 1];
	buf[to * 3 + 2] = buf[from * 3 + 2];
}

export = Sphere;