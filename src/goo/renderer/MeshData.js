define([
	'goo/renderer/BufferData',
	'goo/renderer/Util',
	'goo/renderer/BufferUtils'
],
/** @lends MeshData */
function(
	BufferData,
	Util,
	BufferUtils
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

	MeshData.prototype.rebuildData = function(vertexCount, indexCount, saveOldData) {
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

	MeshData.prototype.rebuildVertexData = function(vertexCount) {
		if (vertexCount !== undefined) {
			this.vertexCount = vertexCount;
			this._vertexCountStore = this.vertexCount;
		}
		var vertexByteSize = 0;
		for ( var i in this.attributeMap) {
			var attribute = this.attributeMap[i];
			vertexByteSize += Util.getByteSize(attribute.type) * attribute.count;
		}
		this.vertexData = new BufferData(new ArrayBuffer(vertexByteSize * this.vertexCount), 'ArrayBuffer');

		this.generateAttributeData();
	};

	MeshData.prototype.rebuildIndexData = function(indexCount) {
		if (indexCount !== undefined) {
			this.indexCount = indexCount;
		}
		if (this.indexCount > 0) {
			var indices = BufferUtils.createIndexBuffer(this.indexCount, this.vertexCount);
			this.indexData = new BufferData(indices, 'ElementArrayBuffer');
		}
	};

	var ArrayTypes = {
		Byte : Int8Array,
		UnsignedByte : Uint8Array,
		UnsignedByteClamped : Uint8ClampedArray,
		Short : Int16Array,
		UnsignedShort : Uint16Array,
		Int : Int32Array,
		UnsignedInt : Uint32Array,
		Float : Float32Array,
		Double : Float64Array
	};

	MeshData.prototype.generateAttributeData = function() {
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

	MeshData.prototype.makeInterleavedData = function() {
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
	
			for (var i=0; i<this.vertexCount; i++) {
				for (var j=0; j<count; j++) {
					this.setDataValue(attribute.type, targetView, (offset + stride * i + j * Util.getByteSize(attribute.type)), view[i * count + j]);
				}
			}
		}

		this.vertexData = newVertexData;
	};

	MeshData.prototype.setDataValue = function (type, targetView, targetIndex, value) {
		switch (type)
		{
		case 'Byte':
			return targetView.setInt8(targetIndex, value, true);
		case 'UnsignedByte':
			return targetView.setUInt8(targetIndex, value, true);
		case 'Short':
			return targetView.setInt16(targetIndex, value, true);
		case 'UnsignedShort':
			return targetView.setUInt16(targetIndex, value, true);
		case 'Int':
			return targetView.setInt32(targetIndex, value, true);
		case 'HalfFloat':
			return targetView.setInt16(targetIndex, value, true);
		case 'Float':
			return targetView.setFloat32(targetIndex, value, true);
		case 'Double':
			return targetView.setFloat64(targetIndex, value, true);
		}
	};


	MeshData.prototype.getAttributeBuffer = function(attributeName) {
		return this.dataViews[attributeName];
	};

	MeshData.prototype.getIndexData = function() {
		return this.indexData;
	};

	MeshData.prototype.getIndexBuffer = function() {
		if (this.indexData !== null) {
			return this.indexData.data;
		}
		return null;
	};

	MeshData.prototype.getIndexLengths = function() {
		return this.indexLengths;
	};

	MeshData.prototype.getIndexModes = function() {
		return this.indexModes;
	};

	MeshData.prototype.resetVertexCount = function() {
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
	 * @param count Tuple size of attribute
	 * @param type Data type
	 * @param normalized If data should be normalized (true) or converted direction (false)
	 * @returns {Object} Attribute definition
	 */
	MeshData.createAttribute = function(count, type, normalized) {
		return {
			count : count,
			type : type,
			stride : 0,
			offset : 0,
			normalized : normalized !== undefined ? normalized : false
		};
	};

	var defaults = {
		'POSITION' : MeshData.createAttribute(3, 'Float'),
		'NORMAL' : MeshData.createAttribute(3, 'Float'),
		'COLOR' : MeshData.createAttribute(4, 'Float'),
		'TANGENT' : MeshData.createAttribute(4, 'Float'),
		'TEXCOORD0' : MeshData.createAttribute(2, 'Float'),
		'TEXCOORD1' : MeshData.createAttribute(2, 'Float'),
		'TEXCOORD2' : MeshData.createAttribute(2, 'Float'),
		'TEXCOORD3' : MeshData.createAttribute(2, 'Float'),
		'WEIGHTS' : MeshData.createAttribute(4, 'Float'),
		'JOINTIDS' : MeshData.createAttribute(4, 'Short')
	};

	function buildMap(types) {
		var map = {};
		for ( var i = 0; i < types.length; i++) {
			var type = types[i];
			if (defaults[type] !== undefined) {
				map[type] = Util.clone(defaults[type]);
			} else {
				throw "No default attribute named: " + type;
			}
		}
		return map;
	}

	MeshData.defaultMap = function(types) {
		if (types === undefined) {
			return buildMap(Object.keys(defaults));
		} else {
			return buildMap(types);
		}
	};

	return MeshData;
});