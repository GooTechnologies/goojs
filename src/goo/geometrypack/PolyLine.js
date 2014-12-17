define([
	'goo/renderer/MeshData',
	'goo/geometrypack/Surface'
],

	function (
		MeshData,
		Surface
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
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/Surface-vtest.html Working example}</caption>
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

	function getBisectorAngleOfVectors(vx1, vy1, vx2, vy2) {
		var d1 = Math.sqrt(vx1*vx1 + vy1*vy1);
		var nx1 = vx1 / d1;
		var ny1 = vy1 / d1;

		var d2 = Math.sqrt(vx2*vx2 + vy2*vy2);
		var nx2 = vx2 / d2;
		var ny2 = vy2 / d2;

		return Math.atan2(ny1 + ny2, nx1 + nx2) - Math.PI/2;
	}

	function getBisectorAngle(verts, index) {
		var nVerts = verts.length / 3;
		var p0x, p0z, p1x, p1z, p2x, p2z;
		if(index === 0) {
			p1x = verts[0 * 3 + 0];
			p1z = verts[0 * 3 + 2];
			p2x = verts[1 * 3 + 0];
			p2z = verts[1 * 3 + 2];
			return Math.atan2(p2z - p1z, p2x - p1x) - Math.PI/2;
		} else if(index === nVerts-1) {
			p0x = verts[(nVerts-2) * 3 + 0];
			p0z = verts[(nVerts-2) * 3 + 2];
			p1x = verts[(nVerts-1) * 3 + 0];
			p1z = verts[(nVerts-1) * 3 + 2];
			return Math.atan2(p1z - p0z, p1x - p0x) - Math.PI/2;
		} else {
			p0x = verts[(index-1) * 3 + 0];
			p0z = verts[(index-1) * 3 + 2];
			p1x = verts[(index) * 3 + 0];
			p1z = verts[(index) * 3 + 2];
			p2x = verts[(index+1) * 3 + 0];
			p2z = verts[(index+1) * 3 + 2];
			return getBisectorAngleOfVectors(p1x - p0x, p1z - p0z, p2x - p1x, p2z - p1z);
		}
	}

	/**
	 * Extrudes and rotates a PolyLine along another PolyLine
	 * @param {PolyLine} [that] The second operand
	 * @returns {Surface} The resulting surface
	 */
	PolyLine.prototype.pipe = function (that) {
		if(!(that instanceof PolyLine)) {
			console.error('pipe operation can only be applied to PolyLines');
			return ;
		}

		var thatNVerts = that.verts.length / 3;
		var verts = [];

		for (var i = 0; i < this.verts.length; i += 3) {
			var k = getBisectorAngle(this.verts, i / 3);
			for (var j = 0; j < that.verts.length; j += 3) {
				verts.push(
					this.verts[i + 0] + that.verts[j + 2] * Math.cos(k),
					this.verts[i + 1] + that.verts[j + 1],
					this.verts[i + 2] + that.verts[j + 2] * Math.sin(k));
			}
		}

		return new Surface(verts, thatNVerts);
	};

	/**
	 * Builds a surface as a result of rotating this polyLine around the Y axis
	 * @param {number} [nSegments=8] The number of segments for the resulting surface
	 * @returns {Surface} The resulting surface
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/Lathe-vtest.html Working example}</caption>
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
		if(!(that instanceof PolyLine)) {
			console.error('concat operation can only be applied to PolyLines');
			return ;
		}

		return new PolyLine(this.verts.concat(that.verts), closed);
	};

	/**
	 * Creates a polyLine that approximates a given cubic Bezier curve
	 * @param {number[]} [verts] The Bezier curve control vertices. This array must contain exactly 12 elements (4 control points with 3 coordinates each)
	 * @param {number} [nSegments=16] The number of segments (higher values result in smoother curves)
	 * @returns {PolyLine} The resulting polyLine
	 */
	PolyLine.fromCubicBezier = function (verts, nSegments, startFraction) {
		if(verts.length !== 3 * 4) {
			console.error('PolyLine.fromCubicBezier takes an array of exactly 12 coordinates');
			return ;
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
					p3[2] + 2 / 3 * (p2[2] - p3[2]),
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
		if(closed) {
			if(verts.length % 3 !== 0 && (verts.length / 3) % 3 !== 0) {
				console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
				return ;
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