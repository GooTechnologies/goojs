var BufferData = require('../renderer/BufferData');
var RendererUtils = require('../renderer/RendererUtils');
var BufferUtils = require('../renderer/BufferUtils');
var Vector2 = require('../math/Vector2');
var Vector3 = require('../math/Vector3');
var Vector4 = require('../math/Vector4');
var ObjectUtils = require('../util/ObjectUtils');




	//! AT: why this?
	var Uint8ClampedArray = window.Uint8ClampedArray;

	/**
	 * Stores all buffers for geometric data and similar attributes
	 * @param {Object} attributeMap Describes which buffers to use and their format/sizes
	 * @param {number} vertexCount Number of vertices in buffer
	 * @param {number} indexCount Number of indices in buffer
	 * @example
	 * // Constructing a quad entity
	 * var attributes = [MeshData.POSITION, MeshData.NORMAL, MeshData.TEXCOORD0];
	 * var attributeMap = MeshData.defaultMap(attributes);
	 * var vertexCount = 4;
	 * var indexCount = 6;
	 * var meshData = new MeshData(attributeMap, vertexCount, indexCount);
	 * meshData.getAttributeBuffer(MeshData.POSITION).set([
	 *     -1, -1, 0, // 0
	 *     -1, 1, 0,  // 1
	 *      1, 1, 0,  // 2
	 *      1, -1, 0  // 3
	 * ]);
	 * meshData.getAttributeBuffer(MeshData.NORMAL).set([
	 *     0,0,1,  0,0,1,  0,0,1,  0,0,1
	 * ]);
	 * meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([
	 *     0,0,  0,1,  1,1,  1,0
	 * ]);
	 * meshData.getIndexBuffer().set([0,3,1, 1,3,2]);
	 *
	 * var quadEntity = world.createEntity(meshData, new Material(ShaderLib.textured)).addToWorld();
	 */
	function MeshData(attributeMap, vertexCount, indexCount) {
		this.attributeMap = attributeMap;

		/** The total number of vertices in the buffer.
		 * @type {number}
		 */
		this.vertexCount = this._vertexCountStore = vertexCount !== undefined ? vertexCount : 0;

		/** The total number of indices in the buffer.
		 * @type {number}
		 */
		this.indexCount = indexCount !== undefined ? indexCount : 0;

		this.primitiveCounts = [0];

		this.vertexData = null;
		this.indexData = null;
		this.dataViews = {};

		/** The number of indices used by each segment, or null to indicate only one segment that uses the whole index buffer.
		 * @type {?Array<number>}
		 */
		this.indexLengths = null;

		/** The primitive rendering types to use, for each segment. Default value of this property is ['Triangles'], but also TriangleStrip, TriangleFan, Lines, LineStrip, LineLoop and Points are available.
		 * @type {Array<string>}
		 */
		this.indexModes = ['Triangles'];

		this.type = MeshData.MESH;

		this.paletteMap = undefined;
		this.weightsPerVertex = undefined;
		this.boundingBox = undefined;
		this.store = undefined;
		this.wireframeData = undefined;
		this.flatMeshData = undefined;
		this.__boundingTree = undefined;

		this._attributeDataNeedsRefresh = false;
		this._dirtyAttributeNames = new Set();

		this.rebuildData(this.vertexCount, this.indexCount);


		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	MeshData.MESH = 0;
	MeshData.SKINMESH = 1;

	/**
	 * Rebuilds the mesh vertex and index data
	 * @param {number} vertexCount
	 * @param {number} indexCount
	 * @param {boolean} saveOldData
	 */
	MeshData.prototype.rebuildData = function (vertexCount, indexCount, saveOldData) {
		var savedAttributes = {};
		var savedIndices = null;

		if (saveOldData) {
			var keys = Object.keys(this.attributeMap);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var view = this.dataViews[key];
				if (view) {
					savedAttributes[key] = view;
				}
			}
			if (this.indexData) {
				savedIndices = this.indexData.data;
			}
		}

		this.rebuildVertexData(vertexCount);

		this.rebuildIndexData(indexCount);

		if (saveOldData) {
			var keys = Object.keys(this.attributeMap);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var saved = savedAttributes[key];
				if (saved) {
					this.dataViews[key].set(saved);
				}
			}

			if (savedIndices) {
				this.indexData.data.set(savedIndices);
			}
		}
	};

	/**
	 * Rebuilds the vertex data of a mesh
	 * @private
	 * @param {number} vertexCount
	 */
	MeshData.prototype.rebuildVertexData = function (vertexCount) {
		if (!isNaN(vertexCount)) {
			this.vertexCount = vertexCount;
			this._vertexCountStore = this.vertexCount;
		}
		if (this.vertexCount > 0) {
			var vertexByteSize = 0;
			var keys = Object.keys(this.attributeMap);
			for (var i = 0; i < keys.length; i++) {
				var attribute = this.attributeMap[keys[i]];
				vertexByteSize += RendererUtils.getByteSize(attribute.type) * attribute.count;
			}
			this.vertexData = new BufferData(new ArrayBuffer(vertexByteSize * this.vertexCount), 'ArrayBuffer');

			this.generateAttributeData();
		}
	};

	/**
	 * Rebuilds the index data
	 * @private
	 * @param {number} indexCount
	 */
	MeshData.prototype.rebuildIndexData = function (indexCount) {
		if (indexCount !== undefined) {
			this.indexCount = indexCount;
		}
		if (this.indexCount > 0) {
			var indices = BufferUtils.createIndexBuffer(this.indexCount, this.vertexCount);
			this.indexData = new BufferData(indices, 'ElementArrayBuffer');
		} else {
			this.indexData = null;
			this.indexLengths = null;
			this.indexModes = ['Triangles'];
		}
	};

	/**
	 * Requests a refresh on the vertex data
	 */
	MeshData.prototype.setVertexDataUpdated = function () {
		this.vertexData._dataNeedsRefresh = true;
	};

	/**
	 * Should be called if an attribute was updated during runtime.
	 * @example
	 * // Updating the vertex position during runtime
	 * var data = meshData.getAttributeBuffer(MeshData.POSITION);
	 * data.set([-1,-1,0, -1,1,0, 1,1,0, 1,-1,0]);
	 * meshData.setAttributeDataUpdated(MeshData.POSITION);
	 */
	MeshData.prototype.setAttributeDataUpdated = function (name) {
		this._dirtyAttributeNames.add(name);
		this._attributeDataNeedsRefresh = true;
	};

	/**
	 * @returns {number}
	 */
	MeshData.prototype.getSectionCount = function () {
		return this.indexLengths ? this.indexLengths.length : 1;
	};

	/**
	 * @returns {number}
	 */
	MeshData.prototype.getPrimitiveCount = function (section) {
		if (section >= 0 && section < this.primitiveCounts.length) {
			return this.primitiveCounts[section];
		}
		return 0;
	};

	/**
	 * @param {number} primitiveIndex
	 * @param {number} section
	 * @param {array} store
	 * @returns {array}
	 */
	MeshData.prototype.getPrimitiveVertices = function (primitiveIndex, section, store) {
		var count = this.getPrimitiveCount(section);
		if (primitiveIndex >= count || primitiveIndex < 0) {
			throw new Error("Invalid primitiveIndex '" + primitiveIndex + "'.  Count is " + count);
		}

		var mode = this.indexModes[section];
		var rSize = MeshData.getVertexCount(mode);
		var result = store || [];
		result.length = rSize;

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
			case 'Triangles':
				index += primitiveIndex * 3 + point;
				break;
			case 'TriangleStrip':
				// XXX: Do we need to flip point 0 and 1 on odd primitiveIndex values?
				// if (point < 2 && primitiveIndex % 2 == 1) {
				// index += primitiveIndex + (point == 0 ? 1 : 0);
				// } else {
				index += primitiveIndex + point;
				// }
				break;
			case 'TriangleFan':
				if (point === 0) {
					index += 0;
				} else {
					index += primitiveIndex + point;
				}
				break;
			case 'Points':
				index += primitiveIndex;
				break;
			case 'Lines':
				index += primitiveIndex * 2 + point;
				break;
			case 'LineStrip':
			case 'LineLoop':
				index += primitiveIndex + point;
				break;
			default:
				MeshData.logger.warning('unimplemented index mode: ' + this.indexModes[section]);
				return -1;
		}

		return index;
	};

	/**
	 * Get the total primitive count. Note that you need to run .updatePrimitiveCounts() before use.
	 * @returns {number}
	 */
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
			case 'Triangles':
				return size / 3;
			case 'TriangleFan':
			case 'TriangleStrip':
				return size - 2;
			case 'Lines':
				return size / 2;
			case 'LineStrip':
				return size - 1;
			case 'LineLoop':
				return size;
			case 'Points':
				return size;
			default:
				throw new Error('unimplemented index mode: ' + indexMode);
		}
	};

	MeshData.getVertexCount = function (indexMode) {
		switch (indexMode) {
			case 'Triangles':
			case 'TriangleFan':
			case 'TriangleStrip':
				return 3;
			case 'Lines':
			case 'LineStrip':
			case 'LineLoop':
				return 2;
			case 'Points':
				return 1;
			default:
				throw new Error('unimplemented index mode: ' + indexMode);
		}
	};

	var ArrayTypes = {
		Byte: Int8Array,
		UnsignedByte: Uint8Array,
		UnsignedByteClamped: Uint8ClampedArray,
		Short: Int16Array,
		UnsignedShort: Uint16Array,
		Int: Int32Array,
		UnsignedInt: Uint32Array,
		Float: Float32Array
		// Double: Float64Array
	};

	MeshData.prototype.generateAttributeData = function () {
		var data = this.vertexData.data;
		var view;
		var offset = 0;
		for (var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = offset;
			var length = this.vertexCount * attribute.count;
			offset += length * RendererUtils.getByteSize(attribute.type);

			var ArrayType = ArrayTypes[attribute.type];
			if (ArrayType) {
				view = new ArrayType(data, attribute.offset, length);
			} else {
				throw new Error('Unsupported DataType: ' + attribute.type);
			}

			this.dataViews[key] = view;

			attribute.hashKey = attribute.count + '_' + attribute.type + '_' +
				attribute.stride + '_' + attribute.offset + '_' + attribute.normalized;
		}
	};

	MeshData.prototype.deIndex = function () {
		var origI = this.getIndexBuffer();
		if (!origI) {
			return;
		}

		var data = {};
		var keys = Object.keys(this.attributeMap);
		for (var ii = 0, l = keys.length; ii < l; ii++) {
			var key = keys[ii];
			var map = this.attributeMap[key];
			var view = this.getAttributeBuffer(key);

			var array = data[key] = [];
			for (var i = 0; i < origI.length; i++) {
				var index = origI[i];
				for (var j = 0; j < map.count; j++) {
					array[i * map.count + j] = view[index * map.count + j];
				}
			}
		}

		this.rebuildData(this.indexCount, 0);

		for (var ii = 0, l = keys.length; ii < l; ii++) {
			var key = keys[ii];
			var view = this.getAttributeBuffer(key);
			view.set(data[key]);
		}

		this.setVertexDataUpdated();
	};

	//! AT: unused
	MeshData.prototype.makeInterleavedData = function () {
		var stride = 0;
		var offset = 0; // unused
		for (var key in this.attributeMap) {
			var attribute = this.attributeMap[key];
			attribute.offset = stride;
			stride += attribute.count * RendererUtils.getByteSize(attribute.type);
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
			var size = RendererUtils.getByteSize(attribute.type);

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
		// case 'Double':
			// return 'setFloat64';
		}
	};

	MeshData.prototype.getAttributeBuffer = function (attributeName) {
		return this.dataViews[attributeName];
	};

	//! schteppe: are simple getters like this really needed? Why not just use the property?
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

	//! AT: unused and undocumented; remove?
	MeshData.prototype.resetVertexCount = function () {
		this.vertexCount = this._vertexCountStore;
	};

	/**
	 * Applies a transformation on a specified attribute buffer
	 * @param {string} attributeName
	 * @param {Transform} transform
	 * @returns {MeshData} Self to allow chaining
	 */
	MeshData.prototype.applyTransform = function (attributeName, transform) {
		var vert = new Vector3();
		var view = this.getAttributeBuffer(attributeName);
		var viewLength = view.length;

		if (attributeName === MeshData.POSITION) {
			for (var i = 0; i < viewLength; i += 3) {
				vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
				vert.applyPostPoint(transform.matrix);
				view[i + 0] = vert.x;
				view[i + 1] = vert.y;
				view[i + 2] = vert.z;
			}
		} else if (attributeName === MeshData.NORMAL) {
			for (var i = 0; i < viewLength; i += 3) {
				vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
				vert.applyPost(transform.rotation);
				view[i + 0] = vert.x;
				view[i + 1] = vert.y;
				view[i + 2] = vert.z;
			}
		} else if (attributeName === MeshData.TANGENT) {
			for (var i = 0; i < viewLength; i += 3) {
				vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
				vert.applyPost(transform.rotation);
				view[i + 0] = vert.x;
				view[i + 1] = vert.y;
				view[i + 2] = vert.z;
			}
		}

		return this;
	};

	/**
	 * Applies a function on the vertices of a specified attribute buffer
	 * @param {string} attributeName
	 * @param {Function} fun
	 * @returns {MeshData} Self to allow chaining
	 */
	MeshData.prototype.applyFunction = function (attributeName, fun) {
		//! AT: fun should return a vector3, not an array
		var vert;
		var outVert;
		var view = this.getAttributeBuffer(attributeName);
		var viewLength = view.length;

		var count = this.attributeMap[attributeName].count;

		switch (count) {
		case 1:
			for (var i = 0; i < viewLength; i++) {
				view[i] = fun(view[i]);
			}
			break;
		case 2:
			vert = new Vector2();
			for (var i = 0; i < viewLength; i += 2) {
				vert.setDirect(view[i + 0], view[i + 1]);

				outVert = fun(vert);

				view[i + 0] = outVert.x;
				view[i + 1] = outVert.y;
			}
			break;
		case 3:
			vert = new Vector3();
			for (var i = 0; i < viewLength; i += 3) {
				vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);

				outVert = fun(vert);

				view[i + 0] = outVert.x;
				view[i + 1] = outVert.y;
				view[i + 2] = outVert.z;
			}
			break;
		case 4:
			vert = new Vector4();
			for (var i = 0; i < viewLength; i += 4) {
				vert.setDirect(view[i + 0], view[i + 1], view[i + 2], view[i + 3]);

				outVert = fun(vert);

				view[i + 0] = outVert.x;
				view[i + 1] = outVert.y;
				view[i + 2] = outVert.z;
				view[i + 3] = outVert.w;
			}
			break;
		}

		return this;
	};

	/**
	 * Creates a new MeshData object representing the normals of the current MeshData object
	 * @param {number} [size=1] The size of the normals
	 * @returns {MeshData}
	 */
	MeshData.prototype.getNormalsMeshData = function (size) {
		if (this.getAttributeBuffer('POSITION') === undefined) {
			return;
		}
		if (this.getAttributeBuffer('NORMAL') === undefined) {
			return;
		}

		size = size !== undefined ? size : 1;

		var verts = [];
		var indices = [];

		var nVertices = this.dataViews.POSITION.length / 3;
		for (var i = 0; i < nVertices; i++) {
			verts.push(
				this.dataViews.POSITION[i * 3 + 0],
				this.dataViews.POSITION[i * 3 + 1],
				this.dataViews.POSITION[i * 3 + 2],
				this.dataViews.POSITION[i * 3 + 0] + this.dataViews.NORMAL[i * 3 + 0] * size,
				this.dataViews.POSITION[i * 3 + 1] + this.dataViews.NORMAL[i * 3 + 1] * size,
				this.dataViews.POSITION[i * 3 + 2] + this.dataViews.NORMAL[i * 3 + 2] * size);
		}

		for (var i = 0; i < nVertices * 2; i += 2) {
			indices.push(i, i + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexModes[0] = 'Lines';

		return meshData;
	};

	/**
	 * Builds the wireframe MeshData from an existing mesh
	 * @returns {MeshData}
	 */
	MeshData.prototype.buildWireframeData = function () {
		var attributeMap = ObjectUtils.deepClone(this.attributeMap);
		var wireframeData = new MeshData(attributeMap, this.vertexCount, 0);
		wireframeData.indexModes[0] = 'Lines';

		var origI = this.getIndexBuffer();

		var that = this;
		var getIndex;
		if (origI) {
			getIndex = function (primitiveIndex, point, section) {
				return origI[that.getVertexIndex(primitiveIndex, point, section)];
			};
		} else {
			getIndex = function (primitiveIndex, point, section) {
				return that.getVertexIndex(primitiveIndex, point, section);
			};
		}

		var targetI = [];
		var indexCount = 0;
		this.updatePrimitiveCounts();
		for (var section = 0; section < this.getSectionCount(); section++) {
			var indexMode = this.indexModes[section];

			var primitiveCount = this.getPrimitiveCount(section);
			for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++) {
				switch (indexMode) {
				case 'Triangles':
				case 'TriangleFan':
				case 'TriangleStrip':
					var i1 = getIndex(primitiveIndex, 0, section);
					var i2 = getIndex(primitiveIndex, 1, section);
					var i3 = getIndex(primitiveIndex, 2, section);

					targetI[indexCount + 0] = i1;
					targetI[indexCount + 1] = i2;
					targetI[indexCount + 2] = i2;
					targetI[indexCount + 3] = i3;
					targetI[indexCount + 4] = i3;
					targetI[indexCount + 5] = i1;
					indexCount += 6;
					break;
				case 'Lines':
				case 'LineStrip':
					var i1 = getIndex(primitiveIndex, 0, section);
					var i2 = getIndex(primitiveIndex, 1, section);

					targetI[indexCount + 0] = i1;
					targetI[indexCount + 1] = i2;
					indexCount += 2;
					break;
				case 'LineLoop':
					var i1 = getIndex(primitiveIndex, 0, section);
					var i2 = getIndex(primitiveIndex, 1, section);
					if (primitiveIndex === primitiveCount - 1) {
						i2 = getIndex(0, 0, section);
					}

					targetI[indexCount + 0] = i1;
					targetI[indexCount + 1] = i2;
					indexCount += 2;
					break;
				case 'Points':
					// Not supported in wireframe
					break;
				}
			}
		}

		if (indexCount > 0) {
			wireframeData.rebuildIndexData(indexCount);
			for (var attribute in attributeMap) {
				wireframeData.getAttributeBuffer(attribute).set(this.getAttributeBuffer(attribute));
			}
			wireframeData.getIndexBuffer().set(targetI);
		}

		wireframeData.paletteMap = this.paletteMap;
		wireframeData.weightsPerVertex = this.weightsPerVertex;

		return wireframeData;
	};


	// Calculation helpers
	var v1 = new Vector3();
	var v2 = new Vector3();
	var v3 = new Vector3();
	/**
	 * Builds flat meshdata from mesh
	 * @returns {MeshData}
	 */
	MeshData.prototype.buildFlatMeshData = function () {
		var oldIdcs = this.getIndexBuffer();
		if (oldIdcs === null) {
			console.debug('No indices, probably a point mesh');
			return this;
		}

		var attributeMap = ObjectUtils.deepClone(this.attributeMap);
		var attribs = {};
		for (var key in attributeMap) {
			attribs[key] = {
				oldBuffer: this.getAttributeBuffer(key),
				values: []
			};
		}
		var indexCount = 0;
		this.updatePrimitiveCounts();
		for (var section = 0; section < this.getSectionCount(); section++) {
			var indexMode = this.indexModes[section];
			var primitiveCount = this.getPrimitiveCount(section);
			var flip = false;
			for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++) {
				switch (indexMode) {
				/*jshint -W086 */
				case 'TriangleStrip':
					flip = (primitiveIndex % 2 === 1) ? true : false;
					// fall through intended?
				case 'Triangles':
				case 'TriangleFan':
					var i1 = oldIdcs[this.getVertexIndex(primitiveIndex, 0, section)];
					var i2 = oldIdcs[this.getVertexIndex(primitiveIndex, 1, section)];
					var i3 = oldIdcs[this.getVertexIndex(primitiveIndex, 2, section)];
					if (flip) {
						var f = i3;
						i3 = i2;
						i2 = f;
					}
					for (var key in attribs) {
						if (key === MeshData.NORMAL) {
							continue;
						}
						var count = attributeMap[key].count;
						for (var i = 0; i < count; i++) {
							attribs[key].values[indexCount * count + i] = attribs[key].oldBuffer[i1 * count + i];
							attribs[key].values[(indexCount + 1) * count + i] = attribs[key].oldBuffer[i2 * count + i];
							attribs[key].values[(indexCount + 2) * count + i] = attribs[key].oldBuffer[i3 * count + i];
						}
						if (key === MeshData.POSITION) {
							v1.setDirect(
								attribs[key].values[indexCount * 3],
								attribs[key].values[indexCount * 3 + 1],
								attribs[key].values[indexCount * 3 + 2]
							);
							v2.setDirect(
								attribs[key].values[(indexCount + 1) * 3],
								attribs[key].values[(indexCount + 1) * 3 + 1],
								attribs[key].values[(indexCount + 1) * 3 + 2]
							);
							v3.setDirect(
								attribs[key].values[(indexCount + 2) * 3],
								attribs[key].values[(indexCount + 2) * 3 + 1],
								attribs[key].values[(indexCount + 2) * 3 + 2]
							);
							v2.sub(v1);
							v3.sub(v1);
							v2.cross(v3).normalize();

							if (attribs[MeshData.NORMAL]) {
								attribs[MeshData.NORMAL].values[(indexCount) * 3] = v2.x;
								attribs[MeshData.NORMAL].values[(indexCount) * 3 + 1] = v2.y;
								attribs[MeshData.NORMAL].values[(indexCount) * 3 + 2] = v2.z;

								attribs[MeshData.NORMAL].values[(indexCount + 1) * 3] = v2.x;
								attribs[MeshData.NORMAL].values[(indexCount + 1) * 3 + 1] = v2.y;
								attribs[MeshData.NORMAL].values[(indexCount + 1) * 3 + 2] = v2.z;

								attribs[MeshData.NORMAL].values[(indexCount + 2) * 3] = v2.x;
								attribs[MeshData.NORMAL].values[(indexCount + 2) * 3 + 1] = v2.y;
								attribs[MeshData.NORMAL].values[(indexCount + 2) * 3 + 2] = v2.z;
							}
						}
					}
					indexCount += 3;
				}
			}
		}
		if (indexCount === 0) {
			console.warn('Could not build flat data');
			return this;
		}
		var flatMeshData = new MeshData(attributeMap, indexCount);

		for (var key in attribs) {
			flatMeshData.getAttributeBuffer(key).set(attribs[key].values);
		}

		flatMeshData.paletteMap = this.paletteMap;
		flatMeshData.weightsPerVertex = this.weightsPerVertex;

		return flatMeshData;
	};

	/**
	 * Destroys all attached vertex and index data.
	 * @param {WebGLRenderingContext} context
	 */
	MeshData.prototype.destroy = function (context) {
		if (this.vertexData) {
			this.vertexData.destroy(context);
		}
		if (this.indexData) {
			this.indexData.destroy(context);
		}
	};

	/**
	 * Returns a clone of this mesh data
	 * @returns {MeshData}
	 */
	MeshData.prototype.clone = function () {
		var attributeMapClone = ObjectUtils.deepClone(this.attributeMap);

		var clone = new MeshData(attributeMapClone, this.vertexCount, this.indexCount);

		clone.primitiveCounts = this.primitiveCounts.slice(0); // an array

		clone.vertexData.copy(this.vertexData); // BufferData
		clone.indexData.copy(this.indexData); // BufferData

		clone.indexLengths = Array.isArray(this.indexLengths) ? this.indexLengths.slice(0) : this.indexLengths;
		clone.indexModes = this.indexModes.slice(0);

		clone.type = this.type;

		if (this.paletteMap) {
			clone.paletteMap = this.paletteMap.slice(0); // an array
		}

		clone.weightsPerVertex = this.weightsPerVertex; // a number

		return clone;
	};

	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.POSITION = 'POSITION';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.NORMAL = 'NORMAL';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.COLOR = 'COLOR';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.TANGENT = 'TANGENT';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.TEXCOORD0 = 'TEXCOORD0';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.TEXCOORD1 = 'TEXCOORD1';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.TEXCOORD2 = 'TEXCOORD2';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.TEXCOORD3 = 'TEXCOORD3';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.WEIGHTS = 'WEIGHTS';
	/**
	 * @type {string}
	 * @readonly
	 */
	MeshData.JOINTIDS = 'JOINTIDS';

	/**
	 * Creates a definition for a vertex attribute
	 *
	 * @param {number} count Tuple size of attribute
	 * @param {string} type Data type
	 * @param {boolean} [normalized=false] If data should be normalized (true) or converted direction (false)
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
		'JOINTIDS': MeshData.createAttribute(4, 'Float')
	};

	function buildMap(types) {
		var map = {};
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			if (defaults[type] !== undefined) {
				map[type] = ObjectUtils.deepClone(defaults[type]);
			} else {
				throw new Error('No default attribute named: ' + type);
			}
		}
		return map;
	}

	/**
	 * Creates an attribute given the types
	 * @param {Array<string>} [types] An array of default types. If not provided you get an attributeMap with all default attributes
	 * @returns {Object}
	 * @example var map = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
	 */
	MeshData.defaultMap = function (types) {
		if (types === undefined) {
			return buildMap(Object.keys(defaults));
		} else {
			return buildMap(types);
		}
	};

module.exports = MeshData;