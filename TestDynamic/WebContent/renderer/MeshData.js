define(function() {
	function MeshData(dataMap, vertexCount) {
	    /** Number of primitives represented by this data. */
	    this._primitiveCounts = [];

	    /** Map for generating data views */
	    this._dataMap = dataMap;;

	    /** Vertex attribute data. */
	    /** Vertex data views */
	    this._dataViews = {};

	    /** Index data. */
	    this._indexData = null;
	    this._indexLengths = null;
	    this._indexModes = [ 'Triangles' ];
	    /** Index view */
	    this._indexBuffer = null;

	    this.rebuildData(vertexCount);
	}

	MeshData.prototype.rebuildData = function(vertexCount) {
        this._limitVertexCount = this._totalVertexCount = vertexCount;
        this._vertexData = new BufferData(new ArrayBuffer(_dataMap.getVertexByteSize() * vertexCount), Target.ArrayBuffer);
        generateDataViews();
    };

	MeshData.prototype.generateDataViews = function() {
        _dataViews.clear();
        var data = _this.vertexData.data;
        for (final VertexDataDescriptor d : _dataMap.getDescriptors()) {
            AbstractBuffer<?, ?> view = null;
            switch (d.getType()) {
                case Byte:
                    view = new ByteBuffer(Int8Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case UnsignedByte:
                    view = new UByteBuffer(Uint8Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case Short:
                    view = new ShortBuffer(Int16Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case UnsignedShort:
                    view = new UShortBuffer(Uint16Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case Int:
                    view = new IntBuffer(Int32Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case UnsignedInt:
                    view = new UIntBuffer(Uint32Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case Float:
                    view = new FloatBuffer(Float32Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case Double:
                    view = new DoubleBuffer(Float64Array.create(data, d.getOffset()), d.getCount(), d.getStride());
                    break;
                case HalfFloat:
                    // XXX: Support?
                    break;
            }
            if (view != null) {
                _dataViews.put(d.getAttributeName(), view);
            } else {
                throw new Ardor3dException("Unsupported DataType: " + d.getType());
            }
        }
    }
    
	MeshData.prototype.added = function(entity) {
		this._entities[entity.id] = entity;
	};

	return MeshData;
});