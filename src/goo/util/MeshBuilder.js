define([
        'goo/renderer/MeshData',
        'goo/math/Vector3'
        ],
	/** @lends MeshBuilder */
	function (
		MeshData,
		Vector3
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
	}
	
	MeshBuilder.prototype.addEntity = function (entity) {
		EntityUtils.traverse(entity, function (foundEntity) {
			if (entity.transformComponent._dirty) {
				entity.transformComponent.updateTransform();
			}
		});
		EntityUtils.traverse(entity, function (foundEntity) {
			if (entity.transformComponent._dirty) {
				EntityUtils.updateWorldTransform(entity.transformComponent);
			}
		});
		EntityUtils.traverse(entity, function (foundEntity) {
			if (entity.meshDataComponent) {
				this.addMeshData(entity.meshDataComponent.meshData, entity.transformComponent.worldTransform);
			}
		});
	};

	MeshBuilder.prototype.addMeshData = function (meshData, transform) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} else if (this.vertexCounter + meshData.vertexCount >= 65536) {
			console.log('Mesh size limit reached, creating new mesh');

			this._generateMesh();
		}
		
		var attributeMap = meshData.attributeMap;
		for (var key in attributeMap) {
			var map = attributeMap[key];
			var attribute = this.vertexData[key];
			if (!attribute) {
				this.vertexData[key] = [];
				attribute = this.vertexData[key];
			}

			var view = meshData.getAttributeBuffer(key);
			if (key === MeshData.POSITION) {
				for (var i = 0; i < view.length; i += 3) {
					var vert = new Vector3(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForward(vert, vert);
					attribute[this.vertexCounter * map.count + i + 0] = vert[0];
					attribute[this.vertexCounter * map.count + i + 1] = vert[1];
					attribute[this.vertexCounter * map.count + i + 2] = vert[2];
				}
			} else if (key === MeshData.NORMAL) {
				for (var i = 0; i < view.length; i += 3) {
					var vert = new Vector3(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForwardVector(vert, vert);
					attribute[this.vertexCounter * map.count + i + 0] = vert[0];
					attribute[this.vertexCounter * map.count + i + 1] = vert[1];
					attribute[this.vertexCounter * map.count + i + 2] = vert[2];
				}
			} else if (key === MeshData.TANGENT) {
				for (var i = 0; i < view.length; i += 3) {
					var vert = new Vector3(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForwardVector(vert, vert);
					attribute[this.vertexCounter * map.count + i + 0] = vert[0];
					attribute[this.vertexCounter * map.count + i + 1] = vert[1];
					attribute[this.vertexCounter * map.count + i + 2] = vert[2];
				}
			} else {
				for (var i = 0; i < view.length; i++) {
					attribute[this.vertexCounter * map.count + i] = view[i];
				}
			}
		}
		var indices = meshData.getIndexBuffer();
		for (var i = 0; i < meshData.indexCount; i++) {
			this.indexData[this.indexCounter + i] = indices[i] + this.vertexCounter;
		}
		this.vertexCounter += meshData.vertexCount;
		this.indexCounter += meshData.indexCount;
	};

	MeshBuilder.prototype._generateMesh = function () {
		var attributeKeys = Object.keys(this.vertexData);
		var attributeMap = MeshData.defaultMap(attributeKeys);

		var meshData = new MeshData(attributeMap, this.vertexCounter, this.indexCounter);
		for (var key in this.vertexData) {
			var data = this.vertexData[key];
			meshData.getAttributeBuffer(key).set(data);
		}
		meshData.getIndexBuffer().set(this.indexData);

		this.meshDatas.push(meshData);

		this.vertexData = {};
		this.indexData = [];
		this.vertexCounter = 0;
		this.indexCounter = 0;
	};

	MeshBuilder.prototype.build = function () {
		if (this.vertexCounter > 0) {
			this._generateMesh();
		}
		
		return this.meshDatas;
	};

	return MeshBuilder;
});