define([
	'goo/renderer/BufferData',
	'goo/renderer/Util',
	'goo/renderer/BufferUtils',
	'goo/math/Vector3'
],
/** @lends MeshData */
function (
	BufferData,
	Util,
	BufferUtils,
	Vector3
) {
	"use strict";

	var Uint8ClampedArray = window.Uint8ClampedArray;

	/**
	 * @class Stores all buffers for geometric data and similar attributes
	 * @param {AttributeMap} attributeMap Describes which buffers to use and their format/sizes
	 * @param {Number} vertexCount Number of vertices in buffer
	 * @param {Number} indexCount Number of indices in buffer
	 */
	function MeshData(attributeMap, vertexCount, indexCount) {
		this.attributeMap = attributeMap;

		this.vertexCount = vertexCount !== undefined ? vertexCount : 0;
		this.indexCount = indexCount !== undefined ? indexCount : 0;
		this.primitiveCounts = [0];

		this.vertexData = null;
		this.indexData = null;
		this.dataViews = {};

		this.indexLengths = null;
		// Triangles, TriangleStrip, TriangleFan, Lines, LineStrip, LineLoop, Points
		this.indexModes = ['Triangles'];

		this.type = MeshData.MESH;

		this.rebuildData(this.vertexCount, this.indexCount);
	}

	MeshData.MESH = 0;
	MeshData.SKINMESH = 1;

	MeshData.prototype.rebuildData = function (vertexCount, indexCount, saveOldData) {
		var savedAttributes = {};
		var savedIndices = null;

		if (saveOldData) {
			for (var i in this.attributeMap) {
				var view = this.dataViews[i];
				if (view) {
					savedAttributes[i] = view;
				}
			}
			if (this.indexData) {
				savedIndices = this.indexData.data;
			}
		}

		this.rebuildVertexData(vertexCount);

		this.rebuildIndexData(indexCount);

		if (saveOldData) {
			for (var i in this.attributeMap) {
				var saved = savedAttributes[i];
				if (saved) {
					var view = this.dataViews[i];
					view.set(saved);
				}
			}
			savedAttributes = {};
			if (savedIndices) {
				this.indexData.data.set(savedIndices);
			}
		}
	};

	MeshData.prototype.rebuildVertexData = function (vertexCount) {
		if (!isNaN(vertexCount)) {
			this.vertexCount = vertexCount;
			this._vertexCountStore = this.vertexCount;
		}
		if (this.vertexCount > 0) {
			var vertexByteSize = 0;
			for (var i in this.attributeMap) {
				var attribute = this.attributeMap[i];
				vertexByteSize += Util.getByteSize(attribute.type) * attribute.count;
			}
			this.vertexData = new BufferData(new ArrayBuffer(vertexByteSize * this.vertexCount), 'ArrayBuffer');

			this.generateAttributeData();
		}
	};

	MeshData.prototype.rebuildIndexData = function (indexCount) {
		if (indexCount !== undefined) {
			this.indexCount = indexCount;
		}
		if (this.indexCount > 0) {
			var indices = BufferUtils.createIndexBuffer(this.indexCount, this.vertexCount);
			this.indexData = new BufferData(indices, 'ElementArrayBuffer');
		}
	};

	MeshData.prototype.setVertexDataUpdated = function () {
		this.vertexData._dataNeedsRefresh = true;
	};

	MeshData.prototype.getSectionCount = function () {
		return this.indexLengths ? this.indexLengths.length : 1;
	};

	MeshData.prototype.getPrimitiveCount = function (section) {
		if (section >= 0 && section < this.primitiveCounts.length) {
			return this.primitiveCounts[section];
		}
		return 0;
	};

	MeshData.prototype.getPrimitiveVertices = function (primitiveIndex, section, store) {
		var count = this.getPrimitiveCount(section);
		if (primitiveIndex >= count || primitiveIndex < 0) {
			throw new Error("Invalid primitiveIndex '" + primitiveIndex + "'.  Count is " + count);
		}

		var mode = this.indexModes[section];
		var rSize = MeshData.getVertexCount(mode);
		var result = store;
		if (!result || result.length < rSize) {
			result = [];
		}

		var verts = this.getAttributeBuffer(MeshData.POSITION);
		for (var i = 0; i < rSize; i++) {
			if (!result[i]) {
				result[i] = new Vector3();
			}
			if (this.getIndexBuffer()) {
				// indexed geometry
				var vert = this.getIndexBuffer()[this.getVertexIndex(primitiveIndex, i, section)];
				result[i].x = verts[vert * 3 + 0];
				result[i].y = verts[vert * 3 + 1];
				result[i].z = verts[vert * 3 + 2];
			} else {
				// non-indexed geometry
				var vert = this.getVertexIndex(primitiveIndex, i, section);
				result[i].x = verts[vert * 3 + 0];
				result[i].y = verts[vert * 3 + 1];
				result[i].z = verts[vert * 3 + 2];
			}
		}

		return result;
	};

	MeshData.prototype.getVertexIndex = function (primitiveIndex, point, section) {
		var index = 0;
		// move our offset up to the beginning of our section
		for (var i = 0; i < section; i++) {
			index += this.indexLengths[i];
		}

		// Ok, now pull primitive index based on indexmode.
		switch (this.indexModes[section]) {
			case "Triangles":
				index += primitiveIndex * 3 + point;
				break;
			case "TriangleStrip":
				// XXX: Do we need to flip point 0 and 1 on odd primitiveIndex values?
				// if (point < 2 && primitiveIndex % 2 == 1) {
				// index += primitiveIndex + (point == 0 ? 1 : 0);
				// } else {
				index += primitiveIndex + point;
				// }
				break;
			case "TriangleFan":
				if (point === 0) {
					index += 0;
				} else {
					index += primitiveIndex + point;
				}
				break;
			case "Points":
				index += primitiveIndex;
				break;
			case "Lines":
				index += primitiveIndex * 2 + point;
				break;
			case "LineStrip":
			case "LineLoop":
				index += primitiveIndex + point;
				break;
			default:
				MeshData.logger.warning("unimplemented index mode: " + this.getIndexMode(0));
				return -1;
		}
		return index;
	};

	MeshData.prototype.getTotalPrimitiveCount = function () {
		var count = 0;
		for (var i = 0, max = this.primitiveCounts.length; i < max; i++) {
			count += this.primitiveCounts[i];
		}
		return count;
	};

	MeshData.prototype.updatePrimitiveCounts = function () {
		var maxIndex = this.indexData ? this.indexData.data.length : this.vertexCount;
		var maxSection = this.getSectionCount();
		if (this.primitiveCounts.length !== maxSection) {
			this.primitiveCounts = [];
		}
		for (var i = 0; i < maxSection; i++) {
			var size = this.indexLengths ? this.indexLengths[i] : maxIndex;
			var count = MeshData.getPrimitiveCount(this.indexModes[i], size);
			this.primitiveCounts[i] = count;
		}
	};

	MeshData.getPrimitiveCount = function (indexMode, size) {
		switch (indexMode) {
			case "Triangles":
				return size / 3;
			case "TriangleFan":
			case "TriangleStrip":
				return size - 2;
			case "Lines":
				return size / 2;
			case "LineStrip":
				return size - 1;
			case "LineLoop":
				return size;
			case "Points":
				return size;
		}

		throw new Error("unimplemented index mode: " + indexMode);
	};

	MeshData.getVertexCount = function (indexMode) {
		switch (indexMode) {
			case "Triangles":
			case "TriangleFan":
			case "TriangleStrip":
				return 3;
			case "Lines":
			case "LineStrip":
			case "LineLoop":
				return 2;
			case "Points":
				return 1;
		}

		throw new Error("unimplemented index mode: " + indexMode);
	};

	var ArrayTypes = {
		Byte: Int8Array,
		UnsignedByte: Uint8Array,
		UnsignedByteClamped: Uint8ClampedArray,
		Short: Int16Array,
		UnsignedShort: Uint16Array,
		Int: Int32Array,
		UnsignedInt: Uint32Array,
		Float: Float32Array,
		Double: Float64Array
	};

	MeshData.prototype.generateAttributeData = function () {
		var data = this.vertexData.data;
		var view;
		var offset = 0;
		for (var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = offset;
			var length = this.vertexCount * attribute.count;
			offset += length * Util.getByteSize(attribute.type);

			var ArrayType = ArrayTypes[attribute.type];
			if (ArrayType) {
				view = new ArrayType(data, attribute.offset, length);
			} else {
				throw "Unsupported DataType: " + attribute.type;
			}

			this.dataViews[key] = view;
		}
	};

	MeshData.prototype.makeInterleavedData = function () {
		var stride = 0;
		var offset = 0;
		for (var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = stride;
			stride += attribute.count * Util.getByteSize(attribute.type);
		}

		var newVertexData = new BufferData(new ArrayBuffer(stride * this.vertexCount), this.vertexData.target);
		newVertexData._dataUsage = this.vertexData._dataUsage;
		newVertexData._dataNeedsRefresh = true;

		var targetView = new DataView(newVertexData.data);
		for (var key in this.attributeMap) {
			var view = this.dataViews[key];
			var attribute = this.attributeMap[key];
			attribute.stride = stride;
			var offset = attribute.offset;
			var count = attribute.count;
			var size = Util.getByteSize(attribute.type);

			var method = this.getDataMethod(attribute.type);
			var fun = targetView[method];
			for (var i = 0; i < this.vertexCount; i++) {
				for (var j = 0; j < count; j++) {
					fun.apply(targetView, [(offset + stride * i + j * size), view[i * count + j], true]);
				}
			}
		}

		this.vertexData = newVertexData;
	};

	MeshData.prototype.getDataMethod = function (type) {
		switch (type) {
			case 'Byte':
				return 'setInt8';
			case 'UnsignedByte':
				return 'setUInt8';
			case 'Short':
				return 'setInt16';
			case 'UnsignedShort':
				return 'setUInt16';
			case 'Int':
				return 'setInt32';
			case 'HalfFloat':
				return 'setInt16';
			case 'Float':
				return 'setFloat32';
			case 'Double':
				return 'setFloat64';
		}
	};

	MeshData.prototype.getAttributeBuffer = function (attributeName) {
		return this.dataViews[attributeName];
	};

	MeshData.prototype.getIndexData = function () {
		return this.indexData;
	};

	MeshData.prototype.getIndexBuffer = function () {
		if (this.indexData !== null) {
			return this.indexData.data;
		}
		return null;
	};

	MeshData.prototype.getIndexLengths = function () {
		return this.indexLengths;
	};

	MeshData.prototype.getIndexModes = function () {
		return this.indexModes;
	};

	MeshData.prototype.resetVertexCount = function () {
		this.vertexCount = this.vertexCountStore;
	};

	MeshData.POSITION = 'POSITION';
	MeshData.NORMAL = 'NORMAL';
	MeshData.COLOR = 'COLOR';
	MeshData.TANGENT = 'TANGENT';
	MeshData.TEXCOORD0 = 'TEXCOORD0';
	MeshData.TEXCOORD1 = 'TEXCOORD1';
	MeshData.TEXCOORD2 = 'TEXCOORD2';
	MeshData.TEXCOORD3 = 'TEXCOORD3';
	MeshData.WEIGHTS = 'WEIGHTS';
	MeshData.JOINTIDS = 'JOINTIDS';

	/**
	 * Creates a definition for a vertex attribute
	 *
	 * @param count Tuple size of attribute
	 * @param type Data type
	 * @param normalized If data should be normalized (true) or converted direction (false)
	 * @returns {Object} Attribute definition
	 */
	MeshData.createAttribute = function (count, type, normalized) {
		return {
			count: count,
			type: type,
			stride: 0,
			offset: 0,
			normalized: normalized !== undefined ? normalized : false
		};
	};

	var defaults = {
		'POSITION': MeshData.createAttribute(3, 'Float'),
		'NORMAL': MeshData.createAttribute(3, 'Float'),
		'COLOR': MeshData.createAttribute(4, 'Float'),
		'TANGENT': MeshData.createAttribute(4, 'Float'),
		'TEXCOORD0': MeshData.createAttribute(2, 'Float'),
		'TEXCOORD1': MeshData.createAttribute(2, 'Float'),
		'TEXCOORD2': MeshData.createAttribute(2, 'Float'),
		'TEXCOORD3': MeshData.createAttribute(2, 'Float'),
		'WEIGHTS': MeshData.createAttribute(4, 'Float'),
		'JOINTIDS': MeshData.createAttribute(4, 'Short')
	};

	function buildMap(types) {
		var map = {};
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			if (defaults[type] !== undefined) {
				map[type] = Util.clone(defaults[type]);
			} else {
				throw "No default attribute named: " + type;
			}
		}
		return map;
	}

	MeshData.defaultMap = function (types) {
		if (types === undefined) {
			return buildMap(Object.keys(defaults));
		} else {
			return buildMap(types);
		}
	};

	return MeshData;
});