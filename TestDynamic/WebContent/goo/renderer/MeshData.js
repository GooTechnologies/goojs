define(['goo/renderer/BufferData', 'goo/renderer/Util', 'goo/renderer/BufferUtils'], function(BufferData, Util,
	BufferUtils) {
	"use strict";

	function MeshData(attributeMap, vertexCount, indexCount) {
		this.attributeMap = attributeMap;

		this.indexData = null;
		this.indexLengths = null;
		this.indexModes = ['Triangles'];

		this.rebuildData(vertexCount, indexCount);
	}

	MeshData.prototype.rebuildData = function(vertexCount, indexCount) {
		this.vertexCount = vertexCount;
		this._vertexCountStore = this.vertexCount;
		this.indexCount = indexCount || 0;

		var vertexByteSize = 0;
		for ( var i in this.attributeMap) {
			var attribute = this.attributeMap[i];
			vertexByteSize += Util.getByteSize(attribute.type) * attribute.count;
		}

		this.vertexData = new BufferData(new ArrayBuffer(vertexByteSize * this.vertexCount), 'ArrayBuffer');

		if (this.indexCount > 0) {
			var indices = BufferUtils.createIntBuffer(this.indexCount, this.vertexCount);
			this.indexData = new BufferData(indices, 'ElementArrayBuffer');
		}

		this.generateAttributeData();
	};

	var arrayTypes = {
		Byte : Int8Array,
		UnsignedByte : Uint8Array,
		UnsignedByteClamped : Uint8ClampedArray,
		Short : Int16Array,
		UnsignedShort : Uint16Array,
		Int : Int32Array,
		UnsignedInt : Uint32Array,
		Float : Float32Array,
		Double : Float64Array,
	};

	MeshData.prototype.generateAttributeData = function() {
		var data = this.vertexData.data;
		var view;
		var offset = 0;
		for ( var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = offset;
			var length = this.vertexCount * attribute.count;
			offset += length * Util.getByteSize(attribute.type);

			var arrayType = arrayTypes[attribute.type];
			if (arrayType) {
				view = new arrayTypes[attribute.type](data, attribute.offset, length);
			} else {
				throw "Unsupported DataType: " + attribute.type;
			}

			this.attributeMap[key].array = view;
		}
	};

	MeshData.prototype.getAttributeBuffer = function(attributeName) {
		return this.attributeMap[attributeName].array;
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
	MeshData.WEIGHTS = 'WEIGHTS';
	MeshData.JOINTIDS = 'JOINTIDS';

	MeshData.createAttribute = function(count, type) {
		return {
			count : count,
			type : type
		};
	};

	var defaults = {
		POSITION : MeshData.createAttribute(3, 'Float'),
		NORMAL : MeshData.createAttribute(3, 'Float'),
		COLOR : MeshData.createAttribute(4, 'Float'),
		TEXCOORD0 : MeshData.createAttribute(2, 'Float'),
	};

	function buildMap(types) {
		var map = {};
		for ( var i = 0; i < types.length; i++) {
			var type = types[i];
			if (defaults[type] !== undefined) {
				map[type] = defaults[type];
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