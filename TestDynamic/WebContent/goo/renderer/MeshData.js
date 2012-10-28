define(['goo/renderer/BufferData', 'goo/renderer/Util', 'goo/renderer/BufferUtils'], function(BufferData, Util,
	BufferUtils) {
	"use strict";

	/**
	 * Creates a new meshdata object
	 * 
	 * @name MeshData
	 * @class Stores all buffers for geometric data and similar attributes
	 * @param {AttributeMap} attributeMap Describes which buffers to use and their format/sizes
	 * @param {Number} vertexCount Number of vertices in buffer
	 * @param {Number} indexCount Number of indices in buffer
	 */
	function MeshData(attributeMap, vertexCount, indexCount) {
		this.attributeMap = attributeMap;

		this.vertexCount = vertexCount;
		this.indexCount = indexCount || 0;

		this.vertexData = null;
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
				view = new arrayType(data, attribute.offset, length);
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
	MeshData.TEXCOORD2 = 'TEXCOORD2';
	MeshData.TEXCOORD3 = 'TEXCOORD3';
	MeshData.WEIGHTS = 'WEIGHTS';
	MeshData.JOINTIDS = 'JOINTIDS';

	MeshData.createAttribute = function(count, type) {
		return {
			count : count,
			type : type
		};
	};

	function clone(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) {
			return obj;
		}

		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for ( var i = 0, len = obj.length; i < len; ++i) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for ( var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = clone(obj[attr]);
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	var defaults = {
		POSITION : MeshData.createAttribute(3, 'Float'),
		NORMAL : MeshData.createAttribute(3, 'Float'),
		COLOR : MeshData.createAttribute(4, 'Float'),
		TANGENT : MeshData.createAttribute(4, 'Float'),
		TEXCOORD0 : MeshData.createAttribute(2, 'Float'),
		TEXCOORD1 : MeshData.createAttribute(2, 'Float'),
	};

	function buildMap(types) {
		var map = {};
		for ( var i = 0; i < types.length; i++) {
			var type = types[i];
			if (defaults[type] !== undefined) {
				map[type] = clone(defaults[type]);
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