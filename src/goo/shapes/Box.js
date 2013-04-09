define(['goo/renderer/MeshData'],
	/** @lends */
	function (MeshData) {
	"use strict";

	/**
	 * @class An axis-aligned rectangular prism defined by a center point and x-, y- and z-extents (radii) from that center.
	 * @property {Float} xExtent Extent along the local x axis.
	 * @property {Float} yExtent Extent along the local y axis.
	 * @property {Float} zExtent Extent along the local z axis.
	 * @property {Integer} tileX Number of texture repetitions in the texture's x direction.
	 * @property {Integer} tileY Number of texture repetitions in the texture's y direction.
	 * @constructor
	 * @description Creates a new box.
	 * @param {Float} width Total width of box.
	 * @param {Float} height Total height of box.
	 * @param {Float} length Total length of box.
	 * @param {Integer} tileX Number of texture repetitions in the texture's x direction.
	 * @param {Integer} tileY Number of texture repetitions in the texture's y direction.
	 */

	function Box(width, height, length, tileX, tileY) {
		this.xExtent = width !== undefined ? width * 0.5 : 0.5;
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;
		this.zExtent = length !== undefined ? length * 0.5 : 0.5;
		this.tileX = tileX || 1;
		this.tileY = tileY || 1;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, 24, 36);

		this.rebuild();
	}

	Box.prototype = Object.create(MeshData.prototype);

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Box} Self for chaining.
	 */

	Box.prototype.rebuild = function () {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var zExtent = this.zExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		var verts = [//
			-xExtent, -yExtent, -zExtent, //
			xExtent, -yExtent, -zExtent, //
			xExtent, yExtent, -zExtent, //
			-xExtent, yExtent, -zExtent, //
			xExtent, -yExtent, zExtent, //
			-xExtent, -yExtent, zExtent, //
			xExtent, yExtent, zExtent, //
			-xExtent, yExtent, zExtent //
		];

		var vertices = [];
		function fillV(fillIndices) {
			for (var i = 0; i < fillIndices.length; i++) {
				var index = fillIndices[i] * 3;
				vertices.push(verts[index]);
				vertices.push(verts[index + 1]);
				vertices.push(verts[index + 2]);
			}
		}

		fillV([//
			0, 1, 2, 3,//
			1, 4, 6, 2,//
			4, 5, 7, 6,//
			5, 0, 3, 7,//
			2, 6, 7, 3,//
			0, 5, 4, 1//
		]);

		this.getAttributeBuffer(MeshData.POSITION).set(vertices);

		var norms = [//
			0, 0, -1,//
			1, 0, 0,//
			0, 0, 1,//
			-1, 0, 0,//
			0, 1, 0,//
			0, -1, 0//
		];

		var normals = [];
		function fillN() {
			for (var i = 0; i < norms.length / 3; i++) {
				for (var j = 0; j < 4; j++) {
					var index = i * 3;
					normals.push(norms[index]);
					normals.push(norms[index + 1]);
					normals.push(norms[index + 2]);
				}
			}
		}
		fillN();

		this.getAttributeBuffer(MeshData.NORMAL).set(normals);

		var tex = [];
		for (var i = 0; i < 6; i++) {
			tex.push(tileX);
			tex.push(0);

			tex.push(0);
			tex.push(0);

			tex.push(0);
			tex.push(tileY);

			tex.push(tileX);
			tex.push(tileY);
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		this.getIndexBuffer().set(
			[2, 1, 0, 3, 2, 0, 6, 5, 4, 7, 6, 4, 10, 9, 8, 11, 10, 8, 14, 13, 12, 15, 14, 12, 18, 17, 16, 19, 18, 16, 22, 21, 20, 23, 22, 20]);

		return this;
	};

	return Box;
});