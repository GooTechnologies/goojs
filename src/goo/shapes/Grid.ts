import MeshData = require('../renderer/MeshData');
import ObjectUtils = require('../util/ObjectUtils');

/**
 * MeshData for a Grid.
 * @extends MeshData
 * @param {number} [xSegments=10] Number of columns.
 * @param {number} [ySegments=10] Number of rows.
 * @param {number} [width=1] Total width of the Grid.
 * @param {number} [height=1] Total height of the Grid.
 * @example var meshData = new Grid( 10, 10, 10, 10);
 */
class Grid extends MeshData {
	xSegments: number;
	ySegments: number;
	width: number;
	height: number;
	constructor(xSegments, ySegments, width, height) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		var vertsCount = 4 + (xSegments - 1) * 2 + (ySegments - 1) * 2;
		var idcsCount = 8 + (xSegments - 1) * 2 + (ySegments - 1) * 2;
		super(attributeMap, vertsCount, idcsCount);

		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			xSegments = props.xSegments;
			ySegments = props.ySegments;
			width = props.width;
			height = props.height;
		}

		this.xSegments = xSegments || 10;
		this.ySegments = ySegments || 10;
		this.width = width || 1;
		this.height = height || 1;

		this.indexModes[0] = 'Lines';
		this.rebuild();
	}

	rebuild() {
		var xExtent = this.width / 2;
		var yExtent = this.height / 2;
		var verts = [];
		var indices = [];

		// Outer lines
		verts.push(
			-xExtent, -yExtent, 0,
			-xExtent, yExtent, 0,
			xExtent, yExtent, 0,
			xExtent, -yExtent, 0
		);
		// Connecting the corners
		indices.push(
			0, 1,
			1, 2,
			2, 3,
			3, 0
		);

		// X grid lines
		var xPos;
		var step = this.width / this.xSegments;
		for (var i = 1; i < this.xSegments; i++) {
			xPos = i * step - xExtent;
			verts.push(
				xPos, -yExtent, 0,
				xPos, yExtent, 0
			);
		}

		// Y grid lines
		var yPos;
		step = this.height / this.ySegments;
		for (var i = 1; i < this.ySegments; i++) {
			yPos = i * step - yExtent;
			verts.push(
				-xExtent, yPos, 0,
				xExtent, yPos, 0
			);
		}
		for (var i = indices.length / 2; i < verts.length / 3; i += 2) {
			indices.push(i, i + 1);
		}
		this.getAttributeBuffer(MeshData.POSITION).set(verts);
		this.getIndexBuffer().set(indices);
	};

	/**
	 * Returns a clone of this grid
	 * @returns {Grid}
	 */
	clone() {
		return new Grid(this.xSegments, this.ySegments, this.width, this.height);
	};
}

export = Grid;