define([ 'renderer/BufferData' ], function(BufferData) {
	function MeshData(dataMap, vertexCount, indexCount) {
		this._primitiveCounts = [];
		this._dataMap = dataMap;
		this._dataViews = {};

		this._indexLengths = null;
		this._indexModes = [ 'Triangles' ];

		this.rebuildData(vertexCount, indexCount);
	}

	MeshData.prototype.rebuildData = function(vertexCount, indexCount) {
		this._vertexCount = vertexCount;
		this._limitVertexCount = this._vertexCount;
		this._indexCount = indexCount;

		this._vertexData = new BufferData(new ArrayBuffer(this._dataMap.vertexByteSize * this._vertexCount),
				'ArrayBuffer');

		var indices;
		if (this._vertexCount < 256) { // 2^8
			indices = new Int8Array(this._indexCount);
		} else if (this._vertexCount < 65536) { // 2^16
			indices = new Int16Array(this._indexCount);
		} else { // 2^32
			indices = new Int32Array(this._indexCount);
		}
		this._indexData = new BufferData(indices, 'ElementArrayBuffer');

		this.generateDataViews();
	};

	MeshData.prototype.generateDataViews = function() {
		this._dataViews = {};
		var data = this._vertexData.data;
		var view;
		for ( var i in this._dataMap.descriptors) {
			var d = this._dataMap.descriptors[i];
			switch (d.type) {
				case 'Byte':
					view = new Int8Array(data, d.offset);
					break;
				case 'UnsignedByte':
					view = new Uint8Array(data, d.offset);
					break;
				case 'Short':
					view = new Int16Array(data, d.offset);
					break;
				case 'UnsignedShort':
					view = new Uint16Array(data, d.offset);
					break;
				case 'Int':
					view = new Int32Array(data, d.offset);
					break;
				case 'UnsignedInt':
					view = new Uint32Array(data, d.offset);
					break;
				case 'Float':
					view = new Float32Array(data, d.offset);
					break;
				case 'Double':
					view = new Float64Array(data, d.offset);
					break;
				case 'HalfFloat':
					// XXX: Support?
				default:
					console.log("Unsupported DataType: " + d.type);
					return;
			}

			this._dataViews[d.attributeName] = view;
		}
	};

	MeshData.prototype.getAttributeBuffer = function(attributeName) {
		return this._dataViews[attributeName];
	};

	MeshData.prototype.getIndexData = function() {
		return this._indexData;
	};

	MeshData.prototype.getIndexBuffer = function() {
		return this._indexData.data;
	};

	MeshData.prototype.getIndexLengths = function() {
		return this._indexLengths;
	};

	MeshData.prototype.getIndexModes = function() {
		return this._indexModes;
	};

	return MeshData;
});