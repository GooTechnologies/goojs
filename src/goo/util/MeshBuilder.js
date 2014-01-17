define([
        'goo/renderer/MeshData',
        'goo/math/Vector3',
        'goo/entities/EntityUtils'
        ],
	/* @lends */
	function (
		MeshData,
		Vector3,
		EntityUtils
	) {
	"use strict";

	/**
	 * @class Combines mesh datas
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

	MeshBuilder.prototype.addEntity = function (entity) {
		EntityUtils.traverse(entity, function (entity) {
			if (entity.transformComponent._dirty) {
				entity.transformComponent.updateTransform();
			}
		});
		EntityUtils.traverse(entity, function (entity) {
			if (entity.transformComponent._dirty) {
				EntityUtils.updateWorldTransform(entity.transformComponent);
			}
		});
		EntityUtils.traverse(entity, function (entity) {
			if (entity.meshDataComponent) {
				this.addMeshData(entity.meshDataComponent.meshData, entity.transformComponent.worldTransform);
			}
		});
	};

	var vert = new Vector3();
	MeshBuilder.prototype.addMeshData = function (meshData, transform) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} else if (this.vertexCounter + meshData.vertexCount >= 65536) {
			this._generateMesh();
		}

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
			if (key === MeshData.POSITION) {
				for (var i = 0; i < viewLength; i += map.count) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.matrix.applyPostPoint(vert);
					array[this.vertexCounter * map.count + i + 0] = vert[0];
					array[this.vertexCounter * map.count + i + 1] = vert[1];
					array[this.vertexCounter * map.count + i + 2] = vert[2];
				}
			} else if (key === MeshData.NORMAL) {
				for (var i = 0; i < viewLength; i += map.count) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.rotation.applyPost(vert);
					array[this.vertexCounter * map.count + i + 0] = vert[0];
					array[this.vertexCounter * map.count + i + 1] = vert[1];
					array[this.vertexCounter * map.count + i + 2] = vert[2];
				}
			} else if (key === MeshData.TANGENT) {
				for (var i = 0; i < viewLength; i += map.count) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.rotation.applyPost(vert);
					array[this.vertexCounter * map.count + i + 0] = vert[0];
					array[this.vertexCounter * map.count + i + 1] = vert[1];
					array[this.vertexCounter * map.count + i + 2] = vert[2];
					array[this.vertexCounter * map.count + i + 3] = view[i + 3];
				}
			} else {
				for (var i = 0; i < viewLength; i++) {
					array[this.vertexCounter * map.count + i] = view[i];
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
			indexCount += meshData.indexLengths[i];
			if (indexMode !== mode || i === meshData.indexModes.length - 1) {
				indexModes.push(indexMode);
				indexLengths.push(indexCount);
				indexMode = mode;
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

	MeshBuilder.prototype.build = function () {
		if (this.vertexCounter > 0) {
			this._generateMesh();
		}

		return this.meshDatas;
	};

	return MeshBuilder;
});