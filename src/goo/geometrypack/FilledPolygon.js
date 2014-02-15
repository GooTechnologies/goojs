define([
	'goo/renderer/MeshData',
	'goo/math/MathUtils'],
	/** @lends */
	function (
		MeshData,
		MathUtils
	) {
	'use strict';

	/**
	 * @class A polygon shape.
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
		if(n < 3) { return []; }
		var tgs = [];
		var avl = [];
		for(var i=0; i<n; i++) { avl.push(i); }

		var i = 0;
		var al = n;
		while(al > 3) {
			var i0 = avl[(i+0)%al];
			var i1 = avl[(i+1)%al];
			var i2 = avl[(i+2)%al];

			var ax = p[3*i0],  ay = p[3*i0+1];
			var bx = p[3*i1],  by = p[3*i1+1];
			var cx = p[3*i2],  cy = p[3*i2+1];

			var earFound = false;
			if(convex(ax, ay, bx, by, cx, cy)) {
				earFound = true;
				for (var j=0; j<al; j++) {
					var vi = avl[j];
					if(vi===i0 || vi===i1 || vi===i2) { continue; }
					if(pointInTriangle(p[3*vi], p[3*vi+1], ax, ay, bx, by, cx, cy)) {
						console.log("Ear not found for " + i0 + ',' + i1 + ',' + i2);
						earFound = false; break;
					}
				}
				console.log("Ear found for " + i0 + ',' + i1 + ',' + i2);
			}
			if(earFound) {
				tgs.push(i0, i1, i2);
				avl.splice((i+1)%al, 1);
				al--;
				i= 0;
			}
			else { if(i++ > 3*al) { break; } }
		}
		tgs.push(avl[0], avl[1], avl[2]);
		console.log(tgs);
		return tgs;
	}

	function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
		if ((px==ax && py==ay) || (px==bx && py==by) || (px==cx && py==cy)) return false;


		var v0x = cx-ax;
		var v0y = cy-ay;
		var v1x = bx-ax;
		var v1y = by-ay;
		var v2x = px-ax;
		var v2y = py-ay;

		var dot00 = v0x*v0x+v0y*v0y;
		var dot01 = v0x*v1x+v0y*v1y;
		var dot02 = v0x*v2x+v0y*v2y;
		var dot11 = v1x*v1x+v1y*v1y;
		var dot12 = v1x*v2x+v1y*v2y;

		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		// Check if point is in triangle
		return (u >= 0) && (v >= 0) && (u + v < 1);
	}

	function convex(ax, ay, bx, by, cx, cy) {
		return (ay-by)*(cx-bx) + (bx-ax)*(cy-by) >= 0;
	}

	/**
	 * @description Builds or rebuilds the mesh data.
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
			maxY: maxY};
	}

	function linesCross(l1, l2) {
		var p = l1.slice(0,2)
		var r = [l1[2]-l1[0], l1[3]-l1[1]];
		var q = l2.slice(0,2)
		var s = [l2[2]-l2[0], l2[3]-l2[1]];
		var rxs = (r[0]*s[1]-r[1]*s[0])
		var q_pxr = (q[0]-p[0])*r[1] - (q[1]-p[1])*r[0];
		if (rxs === 0) return false;
		var u = q_pxr/rxs
		var q_pxs = (q[0]-p[0])*s[1] - (q[1]-p[1])*s[0];
		var t = q_pxs/rxs
		return t > 0 && t < 1 && u>0 && u<1;
	}


	var rotateArray = (function() {
		// save references to array functions to make lookup faster
		var push = Array.prototype.push,
				splice = Array.prototype.splice;

		return function(array, count) {
			var len = array.length >>> 0, // convert to uint
				count = count >> 0; // convert to int

			// convert count to value in range [0, len[
			count = ((count % len) + len) % len;

			// use splice.call() instead of this.splice() to make function generic
			push.apply(array, splice.call(array, 0, count));
			return array;
		};
	})();

	function findConnectionPoints(c1,c2) {
		for (var i=0; i<c1.length; i+=3) {
			for (var j=0; j<c2.length; j+=3) {
				var line = [c1[i], c1[i+1], c2[j], c2[j+1]];
				var crossed = false;
				for (var k=0; k<c1.length-3; k+=3) {
					var crossLine = [c1[k], c1[k+1], c1[k+3], c1[k+4]];
					if (linesCross(line, crossLine)) {
						crossed = true;
						break;
					}
				}
				if (!crossed) {
					for (var k=0; k<c1.length-3; k+=3) {
						var crossLine = [c2[k], c2[k+1], c2[k+3], c2[k+4]];
						if (linesCross(line, crossLine)) {
							crossed = true;
							break;
						}
					}
					if (!crossed) {
						return [i,j];						
					}
				}
			}
		}
	}

	FilledPolygon.connectContours = function(c1, c2) {
		var cp = findConnectionPoints(c1,c2);
		rotateArray(c2, cp[1]);
		return c1.slice(0,cp[0]+3).concat(c2,c2.slice(0,3),c1.slice(cp[0]));
	}

	function angleBetween(v1, v2) {
		var adotb = (v1[0]*v2[0] + v1[1]*v2[1])/Math.sqrt((v1[0]*v1[0] + v1[1]*v1[1])*(v2[0]*v2[0] + v2[1]*v2[1]));
		var cross = v1[0]*v2[1]-v1[1]*v2[0];
		return (cross!=0?cross/Math.abs(cross):1)*Math.acos(adotb);
	}

	function pointInside(p, c) {
		var v1,v2,v1v2;
		var angle = 0, dangle=0;
		for (var i=0; i<c.length-3; i+=3) {
			v1 = [c[i]-p[0],c[i+1]-p[1]];
			v2 = [c[i+3]-p[0],c[i+4]-p[1]];
			dangle = angleBetween(v1, v2);
			angle+=dangle;
		}
		return Math.abs(Math.abs(angle)-Math.PI*2)<0.0001;
	}

	FilledPolygon.contourIsInside = function(c1,c2) {
		return pointInside(c1, c2);
	}

	return FilledPolygon;
});