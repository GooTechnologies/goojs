"use strict";

define([ 'goo/renderer/BufferData', 'goo/renderer/Util', 'goo/renderer/BufferUtils' ], function(BufferData, Util,
		BufferUtils) {

	function MeshData(attributeMap, vertexCount, indexCount) {
		this.attributeMap = attributeMap;

		this.indexData = null;
		this.indexLengths = null;
		this.indexModes = [ 'Triangles' ];

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

	MeshData.prototype.generateAttributeData = function() {
		var data = this.vertexData.data;
		var view;
		var offset = 0;
		for ( var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = offset;
			var length = this.vertexCount * attribute.count;
			offset += length * Util.getByteSize(attribute.type);
			switch (attribute.type) {
				case 'Byte':
					view = new Int8Array(data, attribute.offset, length);
					break;
				case 'UnsignedByte':
					view = new Uint8Array(data, attribute.offset, length);
					break;
				case 'Short':
					view = new Int16Array(data, attribute.offset, length);
					break;
				case 'UnsignedShort':
					view = new Uint16Array(data, attribute.offset, length);
					break;
				case 'Int':
					view = new Int32Array(data, attribute.offset, length);
					break;
				case 'UnsignedInt':
					view = new Uint32Array(data, attribute.offset, length);
					break;
				case 'Float':
					view = new Float32Array(data, attribute.offset, length);
					break;
				case 'Double':
					view = new Float64Array(data, attribute.offset, length);
					break;
				case 'HalfFloat':
					// XXX: Support?
				default:
					console.log("Unsupported DataType: " + attribute.type);
					return;
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