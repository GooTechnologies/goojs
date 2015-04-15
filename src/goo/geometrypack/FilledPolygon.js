define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],

	function (
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
		for (var i=0; i<n; i++) { avl.push(i); }

		var i = 0;
		var al = n;
		while (al > 3) {
			var i0 = avl[(i + 0) % al];
			var i1 = avl[(i + 1) % al];
			var i2 = avl[(i + 2) % al];

			var ax = p[3 * i0],  ay = p[3 * i0 + 1];
			var bx = p[3 * i1],  by = p[3 * i1 + 1];
			var cx = p[3 * i2],  cy = p[3 * i2 + 1];

			var earFound = false;
			if (convex(ax, ay, bx, by, cx, cy)) {
				earFound = true;
				for (var j=0; j<al; j++) {
					var vi = avl[j];
					if (vi===i0 || vi===i1 || vi===i2) { continue; }
					if (pointInTriangle(p[3 * vi], p[3 * vi + 1], ax, ay, bx, by, cx, cy)) { earFound = false; break;}
				}
			}
			if (earFound) {
				tgs.push(i0, i1, i2);
				avl.splice((i + 1) % al, 1);
				al--;
				i= 0;
			}
			else { if (i++ > 3 * al) { break; } }
		}
		tgs.push(avl[0], avl[1], avl[2]);
		return tgs;
	}

	function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
		var v0x = cx-ax;
		var v0y = cy-ay;
		var v1x = bx-ax;
		var v1y = by-ay;
		var v2x = px-ax;
		var v2y = py-ay;

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
		return (ay-by) * (cx-bx) + (bx-ax) * (cy-by) >= 0;
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
			maxY: maxY };
	}

	return FilledPolygon;
});