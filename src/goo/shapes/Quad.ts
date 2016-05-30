import MeshData = require('../renderer/MeshData');
import ObjectUtils = require('../util/ObjectUtils');

/**
 * A rectangular, two dimensional shape. The local height of the Quad defines it's size about the y-axis,
 * while the width defines the x-axis. The z-axis will always be 0.
 * @extends MeshData
 * @param {number} [width=1] Total width of quad.
 * @param {number} [height=1] Total height of quad.
 * @param {number} [tileX=1] Number of texture repetitions in the texture's x direction.
 * @param {number} [tileY=1] Number of texture repetitions in the texture's y direction.
 */
class Quad extends MeshData {
	/** Half-extent along the local x axis.
	 * @type {number}
	 * @default 0.5
	 */
	xExtent: number;

	/** Half-extent along the local y axis.
	 * @type {number}
	 * @default 0.5
	 */
	yExtent: number;

	/** Number of texture repetitions in the texture's x direction.
	 * @type {number}
	 * @default 1
	 */
	tileX: number;

	/** Number of texture repetitions in the texture's y direction.
	 * @type {number}
	 * @default 1
	 */
	tileY: number;

	constructor(width, height, tileX, tileY) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0]);
		super(attributeMap, 4, 6);

		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			width = props.width;
			height = props.height;
			tileX = props.tileX;
			tileY = props.tileY;
		}

		this.xExtent = width !== undefined ? width * 0.5 : 0.5;
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;
		this.tileX = tileX || 1;
		this.tileY = tileY || 1;

		this.rebuild();
	}

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {Quad} Self for chaining.
	 */
	rebuild() {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		this.getAttributeBuffer(MeshData.POSITION).set([-xExtent, -yExtent, 0, -xExtent, yExtent, 0, xExtent, yExtent, 0, xExtent, -yExtent, 0]);
		this.getAttributeBuffer(MeshData.NORMAL).set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set([0, 0, 0, tileY, tileX, tileY, tileX, 0]);

		this.getIndexBuffer().set([0, 3, 1, 1, 3, 2]);

		return this;
	};

	/**
	 * Returns a clone of this quad
	 * @returns {Quad}
	 */
	clone() {
		return new Quad(this.xExtent * 2, this.yExtent * 2, this.tileX, this.tileY);
	};
}

export = Quad;