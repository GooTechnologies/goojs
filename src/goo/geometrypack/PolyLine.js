define([
	'goo/renderer/MeshData',
	'goo/geometrypack/Surface',
	'goo/math/Matrix3x3',
	'goo/math/Vector3'
], function (
	MeshData,
	Surface,
	Matrix3x3,
	Vector3
) {
	'use strict';

	/**
	 * A polygonal line
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
	 * Builds or rebuilds the mesh data
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
	 * Builds a surface as a result of multiplying 2 polyLines
	 * @param {PolyLine} [that] The second operand
	 * @returns {Surface} The resulting surface
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/Surface-vtest.html Working example
	 */
	PolyLine.prototype.mul = function (that) {
		if(!(that instanceof PolyLine)) {
			return;
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

	(function () {
		function getRotationMatrix(verts, index, up, store) {
			var oldIndex, futureIndex;

			if (index >= verts.length / 3 - 1) {
				oldIndex = index - 1;
				futureIndex = index;
			} else {
				oldIndex = index;
				futureIndex = index + 1;
			}

			var lookAtVector = new Vector3(
				verts[futureIndex * 3 + 0] - verts[oldIndex * 3 + 0],
				verts[futureIndex * 3 + 1] - verts[oldIndex * 3 + 1],
				verts[futureIndex * 3 + 2] - verts[oldIndex * 3 + 2]
			);

			lookAtVector.normalize();

			store.lookAt(lookAtVector, up);
		}

		var FORWARD = Vector3.UNIT_Z.clone().scale(-1);

		/**
		 * Extrudes and rotates a PolyLine along another PolyLine.
		 * @param {PolyLine} that The PolyLine to extrude; should be bidimensional and defined on the XY plane.
		 * @param {(number) -> number} [thickness] Takes values between 0 and 1 and its value is used to scale the extruded PolyLine
		 * @returns {Surface} The resulting surface
		 */
		PolyLine.prototype.pipe = function (that, thickness) {
			var thatNVerts = that.verts.length / 3;
			var verts = [];

			var forward = new Vector3();
			var up = Vector3.UNIT_Y.clone();
			var right = new Vector3();

			var rotation = new Matrix3x3();

			for (var i = 0; i < this.verts.length; i += 3) {
				getRotationMatrix(this.verts, i / 3, up, rotation);

				forward.copy(FORWARD); rotation.applyPost(forward);
				right.copy(forward).cross(up).normalize();
				up.copy(right).cross(forward);

				var scale = thickness ? thickness(i / (this.verts.length - 1)) : 1;

				for (var j = 0; j < that.verts.length; j += 3) {
					var vertex = new Vector3(that.verts[j + 0], that.verts[j + 1], that.verts[j + 2]);
					rotation.applyPost(vertex);
					vertex.scale(scale);
					vertex.addDirect(this.verts[i + 0], this.verts[i + 1], this.verts[i + 2]);

					verts.push(vertex.x, vertex.y, vertex.z);
				}
			}

			return new Surface(verts, thatNVerts);
		};
	})();

	/**
	 * Builds a surface as a result of rotating this polyLine around the Y axis
	 * @param {number} [nSegments=8] The number of segments for the resulting surface
	 * @returns {Surface} The resulting surface
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/Lathe-vtest.html Working example
	 */
	PolyLine.prototype.lathe = function (nSegments) {
		nSegments = nSegments || 8;

		var ak = Math.PI * 2 / nSegments;
		var verts = [];

		for (var i = 0; i < this.verts.length; i += 3) {
			for (var j = 0, k = 0; j <= nSegments; j++, k += ak) {
				verts.push(
					Math.cos(k) * this.verts[i + 0],
					this.verts[i + 1],
					Math.sin(k) * this.verts[i + 0]);
			}
		}

		return new Surface(verts, nSegments + 1, true);
	};

	/**
	 * Returns a new polyLine as a result of concatenating the 2 polyLines
	 * @param {PolyLine} [that] The other operand
	 * @param {boolean} [closed] True if the resulting polyLine should be closed
	 * @returns {PolyLine} The new polyLine
	 */
	PolyLine.prototype.concat = function(that, closed) {
		var length = this.verts.length - 1;

		if (
			this.verts[length - 2] === that.verts[0] &&
			this.verts[length - 1] === that.verts[1] &&
			this.verts[length - 0] === that.verts[2]
		) {
			return new PolyLine(this.verts.slice(0, -3).concat(that.verts), closed);
		} else {
			return new PolyLine(this.verts.concat(that.verts), closed);
		}
	};

	/**
	 * Creates a polyLine that approximates a given cubic Bezier curve
	 * @param {number[]} [verts] The Bezier curve control vertices. This array must contain exactly 12 elements (4 control points with 3 coordinates each)
	 * @param {number} [nSegments=16] The number of segments (higher values result in smoother curves)
	 * @returns {PolyLine} The resulting polyLine
	 */
	PolyLine.fromCubicBezier = function (verts, nSegments, startFraction) {
		if (verts.length !== 3 * 4) {
			console.error('PolyLine.fromCubicBezier takes an array of exactly 12 coordinates');
			return;
		}
		nSegments = nSegments || 16;
		startFraction = startFraction || 0;

		var plVerts = [];

		var p01 = [], p12 = [], p23 = [];
		var p012 = [], p123 = [];
		var p0123 = [];

		// better off with a bernstein polynomial?
		for (var pas = startFraction; pas <= nSegments; pas++) {
			var rap = pas / nSegments;

			p01[0] = verts[0 + 0] + (verts[3 + 0] - verts[0 + 0]) * rap;
			p01[1] = verts[0 + 1] + (verts[3 + 1] - verts[0 + 1]) * rap;
			p01[2] = verts[0 + 2] + (verts[3 + 2] - verts[0 + 2]) * rap;

			p12[0] = verts[3 + 0] + (verts[6 + 0] - verts[3 + 0]) * rap;
			p12[1] = verts[3 + 1] + (verts[6 + 1] - verts[3 + 1]) * rap;
			p12[2] = verts[3 + 2] + (verts[6 + 2] - verts[3 + 2]) * rap;

			p23[0] = verts[6 + 0] + (verts[9 + 0] - verts[6 + 0]) * rap;
			p23[1] = verts[6 + 1] + (verts[9 + 1] - verts[6 + 1]) * rap;
			p23[2] = verts[6 + 2] + (verts[9 + 2] - verts[6 + 2]) * rap;
			//---
			p012[0] = p01[0] + (p12[0] - p01[0]) * rap;
			p012[1] = p01[1] + (p12[1] - p01[1]) * rap;
			p012[2] = p01[2] + (p12[2] - p01[2]) * rap;

			p123[0] = p12[0] + (p23[0] - p12[0]) * rap;
			p123[1] = p12[1] + (p23[1] - p12[1]) * rap;
			p123[2] = p12[2] + (p23[2] - p12[2]) * rap;
			//---
			p0123[0] = p012[0] + (p123[0] - p012[0]) * rap;
			p0123[1] = p012[1] + (p123[1] - p012[1]) * rap;
			p0123[2] = p012[2] + (p123[2] - p012[2]) * rap;

			plVerts.push(p0123[0], p0123[1], p0123[2]);
		}

		plVerts = verts.slice(0,3).concat(plVerts);
		return new PolyLine(plVerts);
	};

	PolyLine.fromQuadraticSpline = function(verts, nSegments, closed) {
		if (verts.length % 3 !== 0 && (verts.length / 3) % 2 !== 0) {
			console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromQuadraticSpline');
			return;
		}
		var newVerts = [];
		for (var i = 0; i < verts.length - 6; i += 6) {
			var p1 = verts.slice(i, i + 3);
			var p2 = verts.slice(i + 3, i + 6);
			var p3 = verts.slice(i + 6, i + 9);

			newVerts.push.apply(newVerts, [
				p1[0],
				p1[1],
				p1[2],

				p1[0] + 2 / 3 * (p2[0] - p1[0]),
				p1[1] + 2 / 3 * (p2[1] - p1[1]),
				p1[2] + 2 / 3 * (p2[2] - p1[2]),

				p3[0] + 2 / 3 * (p2[0] - p3[0]),
				p3[1] + 2 / 3 * (p2[1] - p3[1]),
				p3[2] + 2 / 3 * (p2[2] - p3[2])
			]);
		}

		newVerts.push.apply(newVerts, verts.slice(verts.length - 3, verts.length));
		return PolyLine.fromCubicSpline(newVerts, nSegments, closed);
	};

	/**
	 * Creates a polyLine that approximates a given cubic spline
	 * @param {number[]} [verts] The spline control vertices. This array must contain exactly 3 * number_of_control_points (+ 1 if the spline is open) elements
	 * @param {number} [nSegments=16] The number of segments for each Bezier curve that forms the spline (higher values result in smoother curves)
	 * @param {boolean} [closed=false] True if the spline should be closed or not
	 * @returns {PolyLine} The resulting polyLine
	 */
	PolyLine.fromCubicSpline = function (verts, nSegments, closed) {
		if (closed) {
			if (verts.length % 3 !== 0 && (verts.length / 3) % 3 !== 0) {
				console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
				return;
			}

			var nVerts = verts.length / 3;
			var nCurves = nVerts / 3;

			var ret = PolyLine.fromCubicBezier(verts.slice(0*3, 0*3 + 4*3), nSegments, 1);

			for (var i = 1; i < nCurves - 1; i++) {
				var plToAdd = PolyLine.fromCubicBezier(verts.slice(i*3*3, i*3*3 + 4*3), nSegments, 1);
				ret = ret.concat(plToAdd);
			}

			var plToAdd = PolyLine.fromCubicBezier(verts.slice(i*3*3, i*3*3 + 3*3).concat(verts.slice(0, 3)), nSegments, 1);
			ret = ret.concat(plToAdd);

			return ret;
		}
		else {
			if(verts.length % 3 !== 0 && (verts.length / 3) % 3 !== 1) {
				console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
				return ;
			}

			var nVerts = verts.length / 3;
			var nCurves = (nVerts - 1) / 3;

			var ret = PolyLine.fromCubicBezier(verts.slice(0*3, 0*3 + 4*3), nSegments, 1);

			for (var i = 1; i < nCurves; i++) {
				var plToAdd = PolyLine.fromCubicBezier(verts.slice(i*3*3, i*3*3 + 4*3), nSegments, 1);
				ret = ret.concat(plToAdd);
			}

			return ret;
		}
	};

	return PolyLine;
});