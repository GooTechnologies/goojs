goo.Surface = (function (
	MeshData,
	MathUtils
) {
	'use strict';

	/**
	 * A grid-like surface shape
	 * @param {Array<number>} verts The vertices data array
	 * @param {number} [verticesPerLine=2] The number of vertices
	 */
	function Surface(verts, vertsPerLine, verticallyClosed) {
		this.verts = verts;
		this.vertsPerLine = vertsPerLine || 2;
		this.verticallyClosed = !!verticallyClosed;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;
		MeshData.call(this, attributeMap, nVerts, (nLines - 1) * (this.vertsPerLine - 1) * 6);

		this.rebuild();
	}

	Surface.prototype = Object.create(MeshData.prototype);
	Surface.prototype.constructor = Surface;

	/**
	 * Builds or rebuilds the mesh data
	 * @returns {Surface} Self for chaining
	 */
	Surface.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var indices = [];

		var norms = [];
		var normals = [];

		var nVerts = this.verts.length / 3;
		var nLines = nVerts / this.vertsPerLine;

		for (var i = 0; i < nLines - 1; i++) {
			for (var j = 0; j < this.vertsPerLine - 1; j++) {
				var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
				var downRight = (i + 1) * this.vertsPerLine + (j + 1);
				var upRight = (i + 0) * this.vertsPerLine + (j + 1);

				indices.push(upLeft, downLeft, upRight, upRight, downLeft, downRight);

				normals = MathUtils.getTriangleNormal(
					this.verts[upLeft * 3 + 0],
					this.verts[upLeft * 3 + 1],
					this.verts[upLeft * 3 + 2],

					this.verts[downLeft * 3 + 0],
					this.verts[downLeft * 3 + 1],
					this.verts[downLeft * 3 + 2],

					this.verts[upRight * 3 + 0],
					this.verts[upRight * 3 + 1],
					this.verts[upRight * 3 + 2]);

				norms.push(normals[0], normals[1], normals[2]);
			}

			if (this.verticallyClosed) {
				var upLeft = (i + 0) * this.vertsPerLine + (0 + 0);
				var downLeft = (i + 1) * this.vertsPerLine + (0 + 0);
				var upRight = (i + 0) * this.vertsPerLine + (0 + 1);

				normals = MathUtils.getTriangleNormal(
					this.verts[upLeft * 3 + 0],
					this.verts[upLeft * 3 + 1],
					this.verts[upLeft * 3 + 2],

					this.verts[downLeft * 3 + 0],
					this.verts[downLeft * 3 + 1],
					this.verts[downLeft * 3 + 2],

					this.verts[upRight * 3 + 0],
					this.verts[upRight * 3 + 1],
					this.verts[upRight * 3 + 2]);

				norms.push(normals[0], normals[1], normals[2]);
			}
			else {
				norms.push(normals[0], normals[1], normals[2]);
			}
		}

		i--;
		for (var j = 0; j < this.vertsPerLine - 1; j++) {
			var upLeft = (i + 0) * this.vertsPerLine + (j + 0);
			var downLeft = (i + 1) * this.vertsPerLine + (j + 0);
			var upRight = (i + 0) * this.vertsPerLine + (j + 1);

			normals = MathUtils.getTriangleNormal(
				this.verts[upLeft * 3 + 0],
				this.verts[upLeft * 3 + 1],
				this.verts[upLeft * 3 + 2],

				this.verts[downLeft * 3 + 0],
				this.verts[downLeft * 3 + 1],
				this.verts[downLeft * 3 + 2],

				this.verts[upRight * 3 + 0],
				this.verts[upRight * 3 + 1],
				this.verts[upRight * 3 + 2]);

			norms.push(normals[0], normals[1], normals[2]);
		}

		norms.push(normals[0], normals[1], normals[2]);

		this.getAttributeBuffer(MeshData.NORMAL).set(norms);
		this.getIndexBuffer().set(indices);

		// compute texture coordinates
		var tex = [];
		var bounds = getBounds(this.verts);
		var extentX = bounds.maxX - bounds.minX;
		var extentY = bounds.maxY - bounds.minY;

		for (var i = 0; i < this.verts.length; i += 3) {
			var x = (this.verts[i + 0] - bounds.minX) / extentX;
			var y = (this.verts[i + 2] - bounds.minY) / extentY;
			tex.push(x, y);
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		return this;
	};

	function getBounds(verts) {
		var minX = verts[0];
		var maxX = verts[0];
		var minY = verts[2];
		var maxY = verts[2];

		for (var i = 3; i < verts.length; i += 3) {
			minX = minX < verts[i + 0] ? minX : verts[i + 0];
			maxX = maxX > verts[i + 0] ? maxX : verts[i + 0];
			minY = minY < verts[i + 2] ? minY : verts[i + 2];
			maxY = maxY > verts[i + 2] ? maxY : verts[i + 2];
		}

		return {
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY
		};
	}

	/**
	 * Create a Surface from a supplied height map in the form of a matrix
	 * @param {Array<number>} [heightMap] The height map
	 * @param {number} [xScale=1]
	 * @param {number} [yScale=1]
	 * @param {number} [zScale=1]
	 * @returns {Surface} The created surface
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/HeightMap-vtest.html Working example
	 */
	Surface.createFromHeightMap = function (heightMap, xScale, yScale, zScale) {
		xScale = xScale || 1;
		yScale = yScale || 1;
		zScale = zScale || 1;

		var verts = [];

		for (var z = 0; z < heightMap.length; z++) {
			for (var x = 0; x < heightMap[z].length; x++) {
				verts.push(
					x * xScale,
					heightMap[z][x] * yScale,
					z * zScale
				);
			}
		}

		return new Surface(verts, heightMap[0].length);
	};

	/**
	 * Create a tessellated Surface typically useful for a waterplane to reduce z-fighting
	 * @param {number} xSize x axis size in units
	 * @param {number} zSize z axis size in numbers
	 * @param {number} xCount x axis vertex count
	 * @param {number} zCount z axis vertex count
	 * @returns {Surface} The surface mesh
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/HeightMap-vtest.html Working example
	 */
	Surface.createTessellatedFlat = function (xSize, zSize, xCount, zCount) {
		var verts = [];

		for (var z = 0; z < zCount; z++) {
			for (var x = 0; x < xCount; x++) {
				verts.push(
					(x * xSize / xCount) - xSize * 0.5,
					0,
					(z * zSize / zCount) - zSize * 0.5
				);
			}
		}

		return new Surface(verts, xCount);
	};

	return Surface;
})(goo.MeshData,goo.MathUtils);
goo.PolyLine = (function (
	MeshData,
	Surface,
	Matrix3,
	Vector3
) {
	'use strict';

	/**
	 * A polygonal line
	 * @param {Array<number>} [verts] The vertices data array
	 * @param {boolean} [closed=false] True if its ends should be connected
	 */
	function PolyLine(verts, closed) {
		this.verts = verts;
		this.closed = !!closed;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		MeshData.call(this, attributeMap, this.verts.length / 3, this.verts.length / 3);

		if (this.closed) {
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
	 * @param {PolyLine} rhs The second operand
	 * @returns {Surface} The resulting surface
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/Surface/PolyLine-vtest.html Working example
	 */
	PolyLine.prototype.mul = function (rhs) {
		if (!(rhs instanceof PolyLine)) {
			return;
		}

		var rhsNVerts = rhs.verts.length / 3;
		var verts = [];

		for (var i = 0; i < this.verts.length; i += 3) {
			for (var j = 0; j < rhs.verts.length; j += 3) {
				verts.push(
					this.verts[i + 0] + rhs.verts[j + 0],
					this.verts[i + 1] + rhs.verts[j + 1],
					this.verts[i + 2] + rhs.verts[j + 2]);
			}
		}

		return new Surface(verts, rhsNVerts);
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

		var FORWARD = Vector3.UNIT_Z;

		/**
		 * Extrudes and rotates a PolyLine along another PolyLine.
		 * @param {PolyLine} that The PolyLine to extrude; should be bidimensional and defined on the XY plane.
		 * @param {Object} [options]
		 * @param {function (number) : number} [options.scale] Takes values between 0 and 1; the returned value is used to scale the extruded PolyLine
		 * @param {function (number) : number} [options.twist] Takes values between 0 and 1; the returned value is used to twist the extruded PolyLine along the tangent of the extruding PolyLine. The twist value is expressed in radians.
		 * @returns {Surface} The resulting surface
		 */
		PolyLine.prototype.pipe = function (that, options) {
			options = options || {};
			var thatNVerts = that.verts.length / 3;
			var verts = [];

			var forward = new Vector3();
			var up = Vector3.UNIT_Y.clone();
			var right = new Vector3();

			var rotation = new Matrix3();
			var twist = new Matrix3();
			var scale;

			for (var i = 0; i < this.verts.length; i += 3) {
				getRotationMatrix(this.verts, i / 3, up, rotation);

				var progress = i / (this.verts.length - 1);
				if (options.twist) {
					twist.fromAngles(0, 0, options.twist(progress));
					rotation.mul(twist);
				}

				scale = options.scale ? options.scale(progress) : 1;

				forward.copy(FORWARD);
				forward.applyPost(rotation);

				right.copy(forward).cross(up).normalize();
				up.copy(right).cross(forward);

				for (var j = 0; j < that.verts.length; j += 3) {
					var vertex = new Vector3(that.verts[j + 0], that.verts[j + 1], that.verts[j + 2]);
					vertex.applyPost(rotation);
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
	 * @param {PolyLine} that The other operand
	 * @param {boolean} [closed] True if the resulting polyLine should be closed
	 * @returns {PolyLine} The new polyLine
	 */
	PolyLine.prototype.concat = function (that, closed) {
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
	 * @param {Array<number>} [verts] The Bezier curve control vertices. This array must contain exactly 12 elements (4 control points with 3 coordinates each)
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

		plVerts = verts.slice(0, 3).concat(plVerts);
		return new PolyLine(plVerts);
	};

	PolyLine.fromQuadraticSpline = function (verts, nSegments, closed) {
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
	 * @param {Array<number>} [verts] The spline control vertices. This array must contain exactly 3 * number_of_control_points (+ 1 if the spline is open) elements
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

			var ret = PolyLine.fromCubicBezier(verts.slice(0 * 3, 0 * 3 + 4 * 3), nSegments, 1);

			for (var i = 1; i < nCurves - 1; i++) {
				var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 4 * 3), nSegments, 1);
				ret = ret.concat(plToAdd);
			}

			var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 3 * 3).concat(verts.slice(0, 3)), nSegments, 1);
			ret = ret.concat(plToAdd);

			return ret;
		}
		else {
			if (verts.length % 3 !== 0 && (verts.length / 3) % 3 !== 1) {
				console.error('Wrong number of coordinates supplied in first argument to PolyLine.fromCubicSpline');
				return;
			}

			var nVerts = verts.length / 3;
			var nCurves = (nVerts - 1) / 3;

			var ret = PolyLine.fromCubicBezier(verts.slice(0 * 3, 0 * 3 + 4 * 3), nSegments, 1);

			for (var i = 1; i < nCurves; i++) {
				var plToAdd = PolyLine.fromCubicBezier(verts.slice(i * 3 * 3, i * 3 * 3 + 4 * 3), nSegments, 1);
				ret = ret.concat(plToAdd);
			}

			return ret;
		}
	};

	return PolyLine;
})(goo.MeshData,goo.Surface,goo.Matrix3,goo.Vector3);
goo.RegularPolygon = (function (
	MeshData,
	PolyLine
) {
	'use strict';

	/**
	 * Regular polygon mesh
	 */
	function RegularPolygon(nSegments, radius) {
		this.nSegments = nSegments || 5;
		this.radius = radius || 1;

		var verts = [];
		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < this.nSegments; i++, k += ak) {
			verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
		}

		PolyLine.call(this, verts, true);

		this.rebuild();
	}

	RegularPolygon.prototype = Object.create(PolyLine.prototype);

	return RegularPolygon;
})(goo.MeshData,goo.PolyLine);
goo.FilledPolygon = (function (
	MeshData,
	MathUtils
) {
	'use strict';

	/**
	 * A polygon shape
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/geometrypack/FilledPolygon/FilledPolygon-vtest.html Working example
	 * @param {Array} verts Array of vertices
	 * @param {Array} indices Array of indices
	 */
	function FilledPolygon(verts, indices) {
		this.verts = verts;
		this.indices = indices ? indices : getTriangulation(verts);

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, this.verts.length / 3, this.indices.length);

		this.rebuild();
	}

	FilledPolygon.prototype = Object.create(MeshData.prototype);

	function getTriangulation(p) {
		var n = p.length / 3;
		if (n < 3) { return []; }
		var tgs = [];
		var avl = [];
		for (var i = 0; i < n; i++) { avl.push(i); }

		var i = 0;
		var al = n;
		while (al > 3) {
			var i0 = avl[(i + 0) % al];
			var i1 = avl[(i + 1) % al];
			var i2 = avl[(i + 2) % al];

			var ax = p[3 * i0], ay = p[3 * i0 + 1];
			var bx = p[3 * i1], by = p[3 * i1 + 1];
			var cx = p[3 * i2], cy = p[3 * i2 + 1];

			var earFound = false;
			if (convex(ax, ay, bx, by, cx, cy)) {
				earFound = true;
				for (var j = 0; j < al; j++) {
					var vi = avl[j];
					if (vi === i0 || vi === i1 || vi === i2) { continue; }
					if (pointInTriangle(p[3 * vi], p[3 * vi + 1], ax, ay, bx, by, cx, cy)) { earFound = false; break; }
				}
			}
			if (earFound) {
				tgs.push(i0, i1, i2);
				avl.splice((i + 1) % al, 1);
				al--;
				i = 0;
			} else if (i++ > 3 * al) {
				break;
			}
		}
		tgs.push(avl[0], avl[1], avl[2]);
		return tgs;
	}

	function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
		var v0x = cx - ax;
		var v0y = cy - ay;
		var v1x = bx - ax;
		var v1y = by - ay;
		var v2x = px - ax;
		var v2y = py - ay;

		var dot00 = v0x * v0x + v0y * v0y;
		var dot01 = v0x * v1x + v0y * v1y;
		var dot02 = v0x * v2x + v0y * v2y;
		var dot11 = v1x * v1x + v1y * v1y;
		var dot12 = v1x * v2x + v1y * v2y;

		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		// Check if point is in triangle
		return (u >= 0) && (v >= 0) && (u + v < 1);
	}

	function convex(ax, ay, bx, by, cx, cy) {
		return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0;
	}

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {FilledPolygon} Self for chaining.
	 */
	FilledPolygon.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var norms = [];
		for (var i = 0; i < this.indices.length; i += 3) {
			var normal = MathUtils.getTriangleNormal(
				this.verts[this.indices[i + 0] * 3 + 0],
				this.verts[this.indices[i + 0] * 3 + 1],
				this.verts[this.indices[i + 0] * 3 + 2],
				this.verts[this.indices[i + 1] * 3 + 0],
				this.verts[this.indices[i + 1] * 3 + 1],
				this.verts[this.indices[i + 1] * 3 + 2],
				this.verts[this.indices[i + 2] * 3 + 0],
				this.verts[this.indices[i + 2] * 3 + 1],
				this.verts[this.indices[i + 2] * 3 + 2]
			);

			norms[this.indices[i + 0] * 3 + 0] = normal[0];
			norms[this.indices[i + 0] * 3 + 1] = normal[1];
			norms[this.indices[i + 0] * 3 + 2] = normal[2];
			norms[this.indices[i + 1] * 3 + 0] = normal[0];
			norms[this.indices[i + 1] * 3 + 1] = normal[1];
			norms[this.indices[i + 1] * 3 + 2] = normal[2];
			norms[this.indices[i + 2] * 3 + 0] = normal[0];
			norms[this.indices[i + 2] * 3 + 1] = normal[1];
			norms[this.indices[i + 2] * 3 + 2] = normal[2];
		}

		this.getAttributeBuffer(MeshData.NORMAL).set(norms);

		this.getIndexBuffer().set(this.indices);

		// compute texture coordinates
		var tex = [];
		var bounds = getBounds(this.verts);
		var extentX = bounds.maxX - bounds.minX;
		var extentY = bounds.maxY - bounds.minY;

		for (var i = 0; i < this.verts.length; i += 3) {
			var x = (this.verts[i + 0] - bounds.minX) / extentX;
			var y = (this.verts[i + 1] - bounds.minY) / extentY;
			tex.push(x, y);
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		return this;
	};

	function getBounds(verts) {
		var minX = verts[0];
		var maxX = verts[0];
		var minY = verts[1];
		var maxY = verts[1];

		for (var i = 3; i < verts.length; i += 3) {
			minX = minX < verts[i + 0] ? minX : verts[i + 0];
			maxX = maxX > verts[i + 0] ? maxX : verts[i + 0];
			minY = minY < verts[i + 1] ? minY : verts[i + 1];
			maxY = maxY > verts[i + 1] ? maxY : verts[i + 1];
		}

		return {
			minX: minX,
			maxX: maxX,
			minY: minY,
			maxY: maxY
		};
	}

	return FilledPolygon;
})(goo.MeshData,goo.MathUtils);
goo.Triangle = (function (
	MeshData,
	MathUtils
) {
	'use strict';

	/**
	 * Only creates an attributeMap with MeshData.POSITION and MeshData.NORMAL.
	 * @param {Array<number>} verts array with 9 elements. These 9 elements must be 3 x, y, z positions.
	 */
	function Triangle(verts) {
		this.verts = verts;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		MeshData.call(this, attributeMap, 3, 3);

		this.rebuild();
	}

	Triangle.prototype = Object.create(MeshData.prototype);
	Triangle.prototype.constructor = Triangle;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Triangle} Self for chaining.
	 */
	Triangle.prototype.rebuild = function () {
		this.getAttributeBuffer(MeshData.POSITION).set(this.verts);

		var normals = MathUtils.getTriangleNormal(
			this.verts[0], this.verts[1], this.verts[2],
			this.verts[3], this.verts[4], this.verts[5],
			this.verts[6], this.verts[7], this.verts[8]);

		this.getAttributeBuffer(MeshData.NORMAL).set([
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2],
			normals[0], normals[1], normals[2]]);

		this.getIndexBuffer().set([0, 1, 2]);

		return this;
	};

	return Triangle;
})(goo.MeshData,goo.MathUtils);
goo.TextMeshGenerator = (function (
	Vector2,
	Transform,
	MeshBuilder,
	FilledPolygon,
	PolyLine
) {
	'use strict';

	/**
	 * Serializes an svg path command
	 * @param {Object} command
	 * @returns {string}
	 */
	function serializeCommand(command) {
		var str = command.type;

		// a check for xs should be enough?
		if (command.x2 !== undefined) { str += ' ' + command.x2; }
		if (command.y2 !== undefined) { str += ' ' + command.y2; }

		if (command.x1 !== undefined) { str += ' ' + command.x1; }
		if (command.y1 !== undefined) { str += ' ' + command.y1; }

		if (command.x !== undefined) { str += ' ' + command.x; }
		if (command.y !== undefined) { str += ' ' + command.y; }

		return str;
	}

	/**
	 * Computes a cloud of points from an svg path
	 * @param {string} serializedPath
	 * @param {number} stepLength Lower values result in more detail
	 * @returns {Array<{ x: number, y: number }>} Aa array of point-like objects
	 */
	function getPathPoints(serializedPath, stepLength) {
		var svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svgPath.setAttribute('d', serializedPath);

		var pathLength = svgPath.getTotalLength();

		var points = [];
		for (var i = 0; i < pathLength; i += stepLength) {
			var point = svgPath.getPointAtLength(i);
			points.push({ x: point.x, y: point.y });
		}

		return points;
	}

	/**
	 * Computes the distance between 2 points
	 * @param {{ x: number, y: number }} point1
	 * @param {{ x: number, y: number }} point2
	 * @returns {number}
	 */
	function distance(point1, point2) {
		return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
	}

	/**
	 * Isolates separate polygons by the distance between points
	 * @param {Array<{ x: number, y: number }>} points
	 * @param {number} stepLength
	 * @returns {Array<Array<{ x: number, y: number }>>}
	 */
	function groupPoints(points, stepLength) {
		var groups = [];

		var group = [];
		group.push(points[0]);
		for (var i = 1; i < points.length; i++) {
			var p1 = points[i - 1];
			var p2 = points[i];

			var latestDistance = distance(p1, p2);

			if (latestDistance > (stepLength + 0.1)) {
				groups.push(group);
				group = [];
			}

			group.push(p2);
		}

		groups.push(group);
		return groups;
	}

	var ANGLE_THRESHOLD = 0.001;

	/**
	 * Simplifies a polygon by collapsing collinear adjacent points
	 * @param {Array<{ x: number, y: number }>} polygon
	 * @returns {Array<{ x: number, y: number }>}
	 */
	function simplifyPath(polygon) {
		var simplePolygon = [];

		simplePolygon.push(polygon[0]);
		for (var i = 1; i < polygon.length - 1; i++) {
			var deltaX1 = polygon[i - 1].x - polygon[i].x;
			var deltaY1 = polygon[i - 1].y - polygon[i].y;

			var deltaX2 = polygon[i].x - polygon[i + 1].x;
			var deltaY2 = polygon[i].y - polygon[i + 1].y;

			// can do only one arctan per point
			var angle1 = Math.atan2(deltaY1, deltaX1);
			var angle2 = Math.atan2(deltaY2, deltaX2);

			if (Math.abs(angle1 - angle2) > ANGLE_THRESHOLD) {
				simplePolygon.push(polygon[i]);
			}
		}
		simplePolygon.push(polygon[i]);

		return simplePolygon;
	}

	/**
	 * Computes the 2D bounding box of a poygon
	 * @param {Array<{ x: number, y: number }>} polygon
	 * @returns {{ min: Vector2, max: Vector2 }}
	 */
	function getBoundingVolume(polygon) {
		var min = new Vector2(polygon[0].x, polygon[0].y);
		var max = min.clone();

		for (var i = 1; i < polygon.length; i++) {
			var point = polygon[i];

			if (point.x < min.x) {
				min.x = point.x;
			} else if (point.x > max.x) {
				max.x = point.x;
			}

			if (point.y < min.y) {
				min.y = point.y;
			} else if (point.y > max.y) {
				max.y = point.y;
			}
		}

		return {
			min: min,
			max: max
		};
	}

	/**
	 * Checks whether a bounding box is contained within another bounding box
	 * @param a
	 * @param b
	 * @returns {boolean}
	 */
	function containsBox(a, b) {
		return a.min.x < b.min.x && a.max.x > b.max.x &&
			a.min.y < b.min.y && a.max.y > b.max.y;
	}

	function mergeBoxes(a, b) {
		return {
			min: new Vector2(Math.min(a.min.x, b.min.x), Math.min(a.min.y, b.min.y)),
			max: new Vector2(Math.max(a.max.x, b.max.x), Math.max(a.max.y, b.max.y))
		};
	}

	/**
	 * Groups polygons in contours with holes
	 * @param {Array<{ x: number, y: number }>} polygons
	 * @returns {{ polygon, holes }}
	 */
	function getHierarchy(polygons) {
		// most characters have 1 polygon
		// a, b, d, e, i... have 2 polygons
		// 8, B have 3 polygons
		// % has 5 polygons
		// capital `theta` in the greek alphabet has 3 polygons, all nested
		var candidates = polygons.map(function (polygon) {
			return {
				polygon: polygon,
				boundingVolume: getBoundingVolume(polygon),
				parent: null,
				children: []
			};
		});

		var totalBounds = candidates[0].boundingVolume;
		for (var i = 1; i < candidates.length; i++) {
			var contour = candidates[i];
			totalBounds = mergeBoxes(totalBounds, contour.boundingVolume);
		}

		for (var i = 0; i < candidates.length; i++) {
			var candidateParent = candidates[i];
			for (var j = 0; j < candidates.length; j++) {
				var candidateChild = candidates[j];

				if (containsBox(candidateParent.boundingVolume, candidateChild.boundingVolume)) {
					candidateParent.children.push(candidateChild);
					candidateChild.parent = candidateParent;
				}
			}
		}

		var contours = candidates.filter(function (candidate) {
			return !candidate.parent;
		});

		contours.forEach(function (contour) {
			contour.children.forEach(function (child) {
				Array.prototype.push.apply(contours, child.children);
			});
		});

		return {
			topLevel: contours.map(function (candidate) {
				return {
					polygon: candidate.polygon,
					holes: candidate.children
				};
			}),
			boundingVolume: totalBounds
		};
	}

	function invertWinding(array) {
		var inverted = new Array(array.length);
		for (var i = 0; i < array.length; i += 3) {
			inverted[i + 0] = array[i + 0];
			inverted[i + 1] = array[i + 2];
			inverted[i + 2] = array[i + 1];
		}
		return inverted;
	}

	/**
	 * Adds indices to the vertices of a polygon
	 * @param polygons
	 */
	function addIndices(polygons) {
		var counter = 0;
		polygons.forEach(function (points) {
			points.forEach(function (point) {
				point._index = counter;
				counter++;
			});
		});
	}

	/**
	 * Extracts the indices of a triangulation computed by the triangulation library
	 * @param triangles
	 * @returns {Array}
	 */
	function getIndices(triangles) {
		var indices = [];
		triangles.forEach(function (triangle) {
			indices.push(
				triangle.getPoint(0)._index,
				triangle.getPoint(1)._index,
				triangle.getPoint(2)._index
			);
		});
		return indices;
	}

	/**
	 * Flattens an array of points defined as objects { x, y } into an array
	 * @param {Array<{ x: number, y: number }>} points
	 * @returns {Array<number>}
	 */
	function getVerts(points) {
		// use an inverse map from indices to _indices
		points.sort(function (a, b) { return a._index - b._index; });

		var verts = [];
		points.forEach(function (point) {
			verts.push(point.x, point.y, 0);
		});
		return verts;
	}

	/**
	 * Forwards a contour polygon with optional holes to the triangulation library and processes the results
	 * @param contour
	 * @param holes
	 * @returns {*}
	 */
	function triangulate(contour, holes) {
		var swctx = new poly2tri.SweepContext(contour.slice(0));
		holes.forEach(function (hole) { swctx.addHole(hole.polygon.slice(0)); });

		swctx.triangulate();
		var triangles = swctx.getTriangles();

		return getIndices(triangles);
	}

	/**
	 * Constructs the vertex data, index data and extrusions for a glyph
	 * @param glyph
	 * @param {Object} options
	 * @param {boolean} [options.simplifyPaths=true] Disable to get evenly spaced tessellations on the edges
	 * @param {number} [options.fontSize=48]
	 * @param {number} [options.stepLength=1] Lower values result in a more detailed mesh
	 * @returns {{surfaceIndices: Array, surfaceVerts: Array, extrusions: Array}}
	 */
	function dataForGlyph(glyph, options) {
		options = options || {};
		options.simplifyPaths = options.simplifyPaths !== false;

		var path = glyph.getPath(0, 0, options.fontSize);
		var serializedPath = path.commands.map(serializeCommand).reduce(function (prev, cur) {
			return prev + cur;
		}, '');

		var points = getPathPoints(serializedPath, options.stepLength);

		var polygons = groupPoints(points, options.stepLength);

		if (options.simplifyPaths) {
			polygons = polygons.map(simplifyPath);
		}

		addIndices(polygons);

		var hierarchy = getHierarchy(polygons);

		// gather the vertices of all polygons
		var surfaceVerts = [];
		polygons.forEach(function (polygon) {
			var verts = getVerts(polygon);
			Array.prototype.push.apply(surfaceVerts, verts);
		});

		// separate contours need separate triangulations
		var surfaceIndices = [];
		hierarchy.topLevel.forEach(function (contour) {
			var indices = triangulate(contour.polygon, contour.holes);
			Array.prototype.push.apply(surfaceIndices, indices);
		});

		return {
			surfaceIndices: surfaceIndices,
			surfaceVerts: surfaceVerts,
			extrusions: polygons,
			boundingVolume: hierarchy.boundingVolume
		};
	}

	/**
	 * Builds meshes from a font
	 * @param {string} text
	 * @param font
	 * @param {Object} [options]
	 * @param {number} [options.extrusion=4] Extrusion amount
	 * @param {number} [options.fontSize=48]
	 * @param {number} [options.stepLength=1] Lower values result in a more detailed mesh
	 * @returns {Array<MeshData>}
	 */
	function meshesForText(text, font, options) {
		options = options || {};
		options.extrusion = options.extrusion !== undefined ? options.extrusion : 4;
		options.stepLength = options.stepLength || 1;
		options.fontSize = options.fontSize || 48;


		var dataSets = [];
		font.forEachGlyph(text, 0, 0, options.fontSize, {}, function (glyph, x, y) {
			if (glyph.path.commands.length > 0) {
				dataSets.push({
					data: dataForGlyph(glyph, options),
					x: x,
					y: y
				});
			}
		});


		var meshBuilder = new MeshBuilder();

		function meshForGlyph(data, x, y, options) {
			function frontFace() {
				var meshData = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
				var transform = new Transform();
				transform.translation.setDirect(x, y, -options.extrusion / 2);
				transform.scale.setDirect(1, -1, 1);
				transform.update();
				meshBuilder.addMeshData(meshData, transform);
			}

			function backFace() {
				var meshData = new FilledPolygon(data.surfaceVerts, invertWinding(data.surfaceIndices));
				var transform = new Transform();
				transform.translation.setDirect(x, y, options.extrusion / 2);
				transform.scale.setDirect(1, -1, 1);
				transform.update();
				meshBuilder.addMeshData(meshData, transform);
			}

			frontFace();
			backFace();

			if (options.extrusion) {
				data.extrusions.forEach(function (polygon) {
					var contourVerts = getVerts(polygon);
					contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);

					var contourPolyLine = new PolyLine(contourVerts, true);
					var extrusionPolyLine = new PolyLine([0, 0, -options.extrusion / 2, 0, 0, options.extrusion / 2]);
					var meshData = contourPolyLine.mul(extrusionPolyLine);

					var transform = new Transform();
					transform.translation.setDirect(x, y, 0);
					transform.scale.setDirect(1, -1, -1);
					transform.update();

					meshBuilder.addMeshData(meshData, transform);
				});
			}
		}


		// get the total bounds; it's enough to merge the first and last chars
		var firstDataSet = dataSets[0];
		var minX = firstDataSet.data.boundingVolume.min.x;

		var lastDataSet = dataSets[dataSets.length - 1];
		var maxX = lastDataSet.data.boundingVolume.max.x + lastDataSet.x;

		// compute the offset needed for centering
		var offsetX = (minX + maxX) / 2;

		// add the mesh
		dataSets.forEach(function (dataSet) {
			meshForGlyph(dataSet.data, dataSet.x - offsetX, 0, options);
		});

		return meshBuilder.build();
	}

	return {
		meshesForText: meshesForText
	};
})(goo.Vector2,goo.Transform,goo.MeshBuilder,goo.FilledPolygon,goo.PolyLine);
goo.TextComponent = (function (
	Component,
	MeshDataComponent,
	TextMeshGenerator
) {
	'use strict';

	/**
	 * Stores a font and handles the text mesh on an entity
	 * Depends on opentype.js
	 */
	function TextComponent() {
		Component.apply(this, arguments);

		this.type = 'TextComponent';

		this._font = null;

		this._entity = null;
	}

	TextComponent.prototype = Object.create(Component.prototype);
	TextComponent.prototype.constructor = TextComponent;

	TextComponent.type = 'TextComponent';

	TextComponent.prototype.attached = function (entity) {
		this._entity = entity;
	};

	TextComponent.prototype.detached = function (/*entity*/) {
		this._entity.clearComponent('MeshDataComponent');
		this._entity = null;
	};

	/**
	 * Set the font of this component
	 * @param font The font loaded through opentype.js
	 * @returns {TextComponent} Returns self
	 */
	TextComponent.prototype.setFont = function (font) {
		this._font = font;
		return this;
	};

	/**
	 * Set the text to generate the mesh for; recomputes the mesh
	 * @param {string} text
	 * @param {Object} [options]
	 * @param {number} [options.extrusion=4] Extrusion amount
	 * @param {number} [options.fontSize=48]
	 * @param {number} [options.stepLength=1] Lower values result in a more detailed mesh
	 * @returns {TextComponent} Returns self
	 */
	TextComponent.prototype.setText = function (text, options) {
		this._entity.clearComponent('MeshDataComponent');

		// only short texts that can fit in one mesh for now
		var meshData = TextMeshGenerator.meshesForText(text, this._font, options)[0];

		var meshDataComponent = new MeshDataComponent(meshData);
		this._entity.setComponent(meshDataComponent);

		return this;
	};

	return TextComponent;
})(goo.Component,goo.MeshDataComponent,goo.TextMeshGenerator);
goo.TextComponentHandler = (function (
	ComponentHandler,
	TextComponent,
	PromiseUtils
) {
	'use strict';

	/**
	 * For handling loading of text components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function.
	 * @param {Function} updateObject The handler function.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function TextComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'TextComponent';
	}

	TextComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TextComponentHandler.prototype.constructor = TextComponentHandler;

	ComponentHandler._registerClass('text', TextComponentHandler);

	/**
	 * Create a TextComponent object.
	 * @returns {TextComponent} the created component object
	 * @private
	 */
	TextComponentHandler.prototype._create = function () {
		return new TextComponent();
	};

	/**
	 * Removes the quadcomponent from the entity.
	 * @param {Entity} entity
	 * @private
	 */
	TextComponentHandler.prototype._remove = function (entity) {
		//if (this.world && this.world.gooRunner) {
		//	entity.textComponent.destroy(this.world.gooRunner.renderer.context);
		//}
		entity.clearComponent('TextComponent');
	};

	/**
	 * Update engine textComponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	TextComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// load font

			return PromiseUtils.createPromise(function (resolve, reject) {
				opentype.load(config.font.fontRef, function (err, font) {
					if (err) {
						console.error(err);
						resolve(component);
						return;
					}

					var FONT_SIZE = 1;

					// smoothness is between 0 and 1
					// with 0 looking rough and choppy and 1 looking as smooth as possible
					var computeStepLength = function (fontSize, smoothness) {
						return ((1 - smoothness) * 0.08 + 0.01) * fontSize;
					};

					component.setFont(font);
					component.setText(config.text, {
						extrusion: config.extrusion,
						fontSize: FONT_SIZE,
						stepLength: computeStepLength(FONT_SIZE, config.smoothness),
						simplifyPaths: true
					});

					resolve(component);
				});
			});
		});
	};

	return TextComponentHandler;
})(goo.ComponentHandler,goo.TextComponent,goo.PromiseUtils);
if (typeof require === "function") {
define("goo/geometrypack/Surface", [], function () { return goo.Surface; });
define("goo/geometrypack/PolyLine", [], function () { return goo.PolyLine; });
define("goo/geometrypack/RegularPolygon", [], function () { return goo.RegularPolygon; });
define("goo/geometrypack/FilledPolygon", [], function () { return goo.FilledPolygon; });
define("goo/geometrypack/Triangle", [], function () { return goo.Triangle; });
define("goo/geometrypack/text/TextMeshGenerator", [], function () { return goo.TextMeshGenerator; });
define("goo/geometrypack/text/TextComponent", [], function () { return goo.TextComponent; });
define("goo/geometrypack/text/TextComponentHandler", [], function () { return goo.TextComponentHandler; });
}
