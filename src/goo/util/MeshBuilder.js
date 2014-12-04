define([
        'goo/renderer/MeshData',
        'goo/math/Vector3',
        // 'goo/renderer/Capabilities',
        'goo/entities/EntityUtils'
        ],
	/** @lends */
	function (
		MeshData,
		Vector3,
		// Capabilities,
		EntityUtils
	) {
	'use strict';

	/**
	 * @class Combines the MeshData of passed-in entities into one new MeshData. This can be useful to reduce draw calls.
	 * Combination is currently limited to 65536 vertices if you don't have the OES_element_index_uint extension.
	 * Keep in mind that combined MeshData can only use one diffuse color texture, so this is best suited for MeshData that can share the same texture.
	 * @example
	 * var meshBuilder = new MeshBuilder();
	 * var transform = new Transform();
	 * 
	 * var box1 = new Box(0.3, 1, 1.6);
	 * var box2 = new Box(0.2, 0.15, 0.7);
	 * 
	 * transform.translation.setDirect(0, 0, 1.3);
	 * transform.update();
	 * meshBuilder.addMeshData(box1, transform);
     * 
	 * transform.translation.setDirect(0, 0, 0);
	 * transform.update();
	 * meshBuilder.addMeshData(box2, transform);
     * 
	 * var meshData = meshBuilder.build()[0];
	 * goo.world.createEntity( meshData, new Material(ShaderLib.simpleLit)).addToWorld();

	 */
	function MeshBuilder() {
		this.meshDatas = [];

		this.vertexData = {};
		this.indexData = [];
		this.vertexCounter = 0;
		this.indexCounter = 0;

		this.indexLengths = [];
		this.indexModes = [];
	}

	/**
	 * add the MeshData of an entity to this MeshBuilder
	 * @param {Entity} entity
	 */
	MeshBuilder.prototype.addEntity = function (entity) {
		entity.traverse(function (entity) {
			if (entity.transformComponent._dirty) {
				entity.transformComponent.updateTransform();
			}
		});
		entity.traverse(function (entity) {
			if (entity.transformComponent._dirty) {
				EntityUtils.updateWorldTransform(entity.transformComponent);
			}
		});
		entity.traverse(function (entity) {
			if (entity.meshDataComponent) {
				this.addMeshData(entity.meshDataComponent.meshData, entity.transformComponent.worldTransform);
			}
		});
	};

	// var normalMatrix = new Matrix3x3();
	var vert = new Vector3();
	/**
	 * add MeshData to this MeshBuilder
	 * @param {MeshData} meshData
	 */
	MeshBuilder.prototype.addMeshData = function (meshData, transform) {
		// TODO: check Capabilities when that is merged to master
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} else if (this.vertexCounter + meshData.vertexCount >= 65536) {
			this._generateMesh();
		}

		var matrix = transform.matrix;
		var rotation = transform.rotation;
		// Matrix3x3.invert(transform.rotation, normalMatrix);
		// Matrix3x3.transpose(normalMatrix, normalMatrix);

		var attributeMap = meshData.attributeMap;
		var keys = Object.keys(attributeMap);
		for (var ii = 0, l = keys.length; ii < l; ii++) {
			var key = keys[ii];
			var map = attributeMap[key];
			var attribute = this.vertexData[key];
			if (!attribute) {
				this.vertexData[key] = {};
				attribute = this.vertexData[key];
				attribute.array = [];
				attribute.map = {
					count: map.count,
					type: map.type,
					stride : map.stride,
					offset : map.offset,
					normalized: map.normalized
				};
			}

			var view = meshData.getAttributeBuffer(key);
			var viewLength = view.length;
			var array = attribute.array;
			var count = map.count;
			var vertexPos = this.vertexCounter * count;
			if (key === MeshData.POSITION) {
				for (var i = 0; i < viewLength; i += count) {
					vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
					matrix.applyPostPoint(vert);
					array[vertexPos + i + 0] = vert.data[0];
					array[vertexPos + i + 1] = vert.data[1];
					array[vertexPos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.NORMAL) {
				for (var i = 0; i < viewLength; i += count) {
					vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
					rotation.applyPost(vert);
					array[vertexPos + i + 0] = vert.data[0];
					array[vertexPos + i + 1] = vert.data[1];
					array[vertexPos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.TANGENT) {
				for (var i = 0; i < viewLength; i += count) {
					vert.setDirect(view[i + 0], view[i + 1], view[i + 2]);
					rotation.applyPost(vert);
					array[vertexPos + i + 0] = vert.data[0];
					array[vertexPos + i + 1] = vert.data[1];
					array[vertexPos + i + 2] = vert.data[2];
					array[vertexPos + i + 3] = view[i + 3];
				}
			} else {
				for (var i = 0; i < viewLength; i++) {
					array[vertexPos + i] = view[i];
				}
			}
		}
		var indices = meshData.getIndexBuffer();
		for (var i = 0, l = meshData.indexCount; i < l; i++) {
			this.indexData[this.indexCounter + i] = indices[i] + this.vertexCounter;
		}
		this.vertexCounter += meshData.vertexCount;
		this.indexCounter += meshData.indexCount;

		if(meshData.indexLengths) {
			this.indexLengths = this.indexLengths.concat(meshData.indexLengths);
		} else {
			this.indexLengths = this.indexLengths.concat(meshData.getIndexBuffer().length);
		}

		this.indexModes = this.indexModes.concat(meshData.indexModes);
	};

	MeshBuilder.prototype._generateMesh = function () {
		var attributeMap = {};
		for (var key in this.vertexData) {
			var data = this.vertexData[key];
			attributeMap[key] = data.map;
		}

		var meshData = new MeshData(attributeMap, this.vertexCounter, this.indexCounter);
		for (var key in this.vertexData) {
			var data = this.vertexData[key].array;
			meshData.getAttributeBuffer(key).set(data);
		}
		meshData.getIndexBuffer().set(this.indexData);

		meshData.indexLengths = this.indexLengths;
		meshData.indexModes = this.indexModes;

		// Diet down the index arrays
		var indexMode = meshData.indexModes[0];
		var indexCount = 0;
		var indexModes = [];
		var indexLengths = [];
		for (var i = 0; i < meshData.indexModes.length; i++) {
			var mode = meshData.indexModes[i];
			if (indexMode !== mode) {
				indexModes.push(indexMode);
				indexLengths.push(indexCount);
				indexMode = mode;
				indexCount = 0;
			}
			indexCount += meshData.indexLengths[i];
			if (i === meshData.indexModes.length - 1) {
				indexModes.push(mode);
				indexLengths.push(indexCount);
				indexMode = mode;
				indexCount = 0;
			}
		}
		meshData.indexLengths = indexLengths;
		meshData.indexModes = indexModes;

		this.meshDatas.push(meshData);

		this.vertexData = {};
		this.indexData = [];
		this.vertexCounter = 0;
		this.indexCounter = 0;
		this.indexLengths = [];
		this.indexModes = [];
	};

	/**
	 * build the unified MeshData from all the added MeshData so far and then reset in the internal state.
	 * @return {MeshData[]} array of meshData, but currently there will only be one entry so you can always use [0].
	 */
	MeshBuilder.prototype.build = function () {
		if (this.vertexCounter > 0) {
			this._generateMesh();
		}

		return this.meshDatas;
	};

	/**
	 * reset in the internal state.
	 */
	MeshBuilder.prototype.reset = function () {
		this.meshDatas = [];

		this.vertexData = {};
		this.indexData = [];
		this.vertexCounter = 0;
		this.indexCounter = 0;

		this.indexLengths = [];
		this.indexModes = [];
	};

	return MeshBuilder;
});