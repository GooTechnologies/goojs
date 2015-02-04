define([
	'goo/renderer/MeshData'
], function (
	MeshData
) {
	'use strict';

	/**
	 * An axis-aligned rectangular prism defined by a center point and x-, y- and z-extents (radii) from that center.
	 * @extends MeshData
	 * @param {number} [width=1] Total width of box.
	 * @param {number} [height=1] Total height of box.
	 * @param {number} [length=1] Total length of box.
	 */
	function SimpleBox_(width, height, length) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			width = props.width;
			height = props.height;
			length = props.length;
		}

		this.xExtent = width !== undefined ? width * 0.5 : 0.5;
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;
		this.zExtent = length !== undefined ? length * 0.5 : 0.5;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		MeshData.call(this, attributeMap, 8, 36);

		this.rebuild();
	}

	var SimpleBox = SimpleBox_;

	SimpleBox.prototype = Object.create(MeshData.prototype);
	SimpleBox.prototype.constructor = SimpleBox;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {SimpleBox} Self for chaining.
	 */
	SimpleBox.prototype.rebuild = function() {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var zExtent = this.zExtent;

		this.getAttributeBuffer(MeshData.POSITION).set([
			-xExtent, -yExtent, -zExtent,
			 xExtent, -yExtent, -zExtent,
			 xExtent,  yExtent, -zExtent,
			-xExtent,  yExtent, -zExtent,

			-xExtent, -yExtent,  zExtent,
			 xExtent, -yExtent,  zExtent,
			 xExtent,  yExtent,  zExtent,
			-xExtent,  yExtent,  zExtent
		]);

		this.getIndexBuffer().set([
			//front
			2, 1, 0, 0, 3, 2,
			//back
			5, 6, 7, 7, 4, 5,
			//left
			7, 3, 0, 0, 4, 7,
			//right
			1, 2, 6, 6, 5, 1,
			//top
			6, 2, 3, 3, 7, 6,
			//bottom
			0, 1, 5, 5, 4, 0
		]);

		return this;
	};

	/**
	 * Returns a clone of this quad
	 * @returns {SimpleBox}
	 */
	SimpleBox.prototype.clone = function () {
		var options = {
			width: this.xExtent * 2,
			height: this.yExtent * 2,
			length: this.zExtent * 2
		};

		return new SimpleBox(options);
	};

	return SimpleBox;
});