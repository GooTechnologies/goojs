var MeshData = require('goo/renderer/MeshData');
var ObjectUtils = require('goo/util/ObjectUtils');

	'use strict';

	/**
	 * An axis-aligned rectangular prism defined by a center point and x-, y- and z-extents (radii)
	 * from that center (a box).
	 * @extends MeshData
	 * @param {number} [width=1] Total width of box.
	 * @param {number} [height=1] Total height of box.
	 * @param {number} [length=1] Total length of box.
	 * @param {number} [tileX=1] Number of texture repetitions in the texture's x direction.
	 * @param {number} [tileY=1] Number of texture repetitions in the texture's y direction.
	 * @param {Enum} [textureMode=Box.TextureModes.Uniform] Texture wrapping mode.
	 */
	function Box(width, height, length, tileX, tileY, textureMode) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			width = props.width;
			height = props.height;
			length = props.length;
			tileX = props.tileX;
			tileY = props.tileY;
			textureMode = props.textureMode;
		}

		/**
		 * Extent along the local x axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.xExtent = width !== undefined ? width * 0.5 : 0.5;

		/**
		 * Extent along the local y axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;

		/**
		 * Extent along the local z axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.zExtent = length !== undefined ? length * 0.5 : 0.5;

		/**
		 * Number of texture repetitions in the texture's x direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileX = tileX || 1;

		/**
		 * Number of texture repetitions in the texture's y direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileY = tileY || 1;

		/**
		 * Texture wrapping mode.
		 * @type {Enum}
		 * @default Box.TextureModes.Uniform
		 */
		this.textureMode = textureMode !== undefined ? textureMode : Box.TextureModes.Uniform;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		MeshData.call(this, attributeMap, 24, 36);

		this.rebuild();
	}

	Box.prototype = Object.create(MeshData.prototype);
	Box.prototype.constructor = Box;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Box} Self for chaining.
	 */
	Box.prototype.rebuild = function () {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var zExtent = this.zExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		var verts = [
			-xExtent, -yExtent, -zExtent,
			 xExtent, -yExtent, -zExtent,
			 xExtent,  yExtent, -zExtent,
			-xExtent,  yExtent, -zExtent,
			 xExtent, -yExtent,  zExtent,
			-xExtent, -yExtent,  zExtent,
			 xExtent,  yExtent,  zExtent,
			-xExtent,  yExtent,  zExtent
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

		fillV([
			0, 1, 2, 3,
			1, 4, 6, 2,
			4, 5, 7, 6,
			5, 0, 3, 7,
			2, 6, 7, 3,
			0, 5, 4, 1
		]);

		this.getAttributeBuffer(MeshData.POSITION).set(vertices);

		var norms = [
			 0, 0, -1,
			 1, 0, 0,
			 0, 0, 1,
			-1, 0, 0,
			 0, 1, 0,
			 0, -1, 0
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
		if (this.textureMode === Box.TextureModes.Uniform) {
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
		} else {
			tex.push(4 / 4, 1 / 3,   3 / 4, 1 / 3,   3 / 4, 2 / 3,   4 / 4, 2 / 3); // 5
			tex.push(3 / 4, 1 / 3,   2 / 4, 1 / 3,   2 / 4, 2 / 3,   3 / 4, 2 / 3); // 4
			tex.push(2 / 4, 1 / 3,   1 / 4, 1 / 3,   1 / 4, 2 / 3,   2 / 4, 2 / 3); // 3
			tex.push(1 / 4, 1 / 3,   0 / 4, 1 / 3,   0 / 4, 2 / 3,   1 / 4, 2 / 3); // 2
			tex.push(2 / 4, 3 / 3,   2 / 4, 2 / 3,   1 / 4, 2 / 3,   1 / 4, 3 / 3); // 1
			tex.push(1 / 4, 0 / 3,   1 / 4, 1 / 3,   2 / 4, 1 / 3,   2 / 4, 0 / 3); // 6
		}

		this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);

		this.getIndexBuffer().set([
			 2,  1,  0,  3,  2,  0,
			 6,  5,  4,  7,  6,  4,
			10,  9,  8, 11, 10,  8,
			14, 13, 12, 15, 14, 12,
			18, 17, 16, 19, 18, 16,
			22, 21, 20, 23, 22, 20
		]);

		return this;
	};

	/**
	 * Returns a clone of this box
	 * @returns {Box}
	 */
	Box.prototype.clone = function () {
		var options = ObjectUtils.shallowSelectiveClone(this, ['tileX', 'tileY', 'textureMode']);

		// converting xExtent to width so the constructor will convert it the other way around again
		options.width = this.xExtent * 2;
		options.height = this.yExtent * 2;
		options.length = this.zExtent * 2;

		return new Box(options);
	};

	/** Possible texture wrapping modes: Uniform, Unfolded
	 * @type {Object}
	 */
	Box.TextureModes = {
		Uniform: 'Uniform',
		Unfolded: 'Unfolded'
	};

	module.exports = Box;