define([
        'goo/renderer/MeshData',
        'goo/math/Vector3'
        ],
	/** @lends FastBuilder */
	function (
		MeshData,
		Vector3
	) {
	"use strict";

	/**
	 * @class Combines mesh datas
	 */
	function FastBuilder(meshData, count) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} 

		this.meshDatas = [];
		this.dataCounter = 0;

		var counter = count;
		while (true) {
			var amount = Math.floor(65535/meshData.vertexCount);
			amount = Math.min(amount, count);
			var vertexCount = meshData.vertexCount * amount;
			var indexCount = meshData.indexCount * amount;
			
			var attributeMap = {};
			for (var key in meshData.attributeMap) {
				var data = meshData.attributeMap[key];
				attributeMap[key] = {
					count: data.count,
					type: data.type,
					normalize: data.normalize
				};
			}
			var newMeshData = new MeshData(attributeMap, vertexCount, indexCount);
			counter -= amount;
			this.meshDatas.push(newMeshData);
			if (counter <= 0)  {
				break;
			}
		}
		console.log('created ', this.meshDatas);

		this.vertexCounter = 0;
		this.indexCounter = 0;
	}
	
	FastBuilder.prototype.addMeshData = function (meshData, transform) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} else if (this.vertexCounter + meshData.vertexCount >= 65536) {
			console.log('Mesh size limit reached, creating new mesh');

			this.dataCounter++;
			this.vertexData = {};
			this.indexData = [];
			this.vertexCounter = 0;
			this.indexCounter = 0;
		}

		var vert = new Vector3();
		var currentMesh = this.meshDatas[this.dataCounter];
		var attributeMap = meshData.attributeMap;
		for (var key in attributeMap) {
			var map = attributeMap[key];

			var basePos = this.vertexCounter * map.count;
			var view = meshData.getAttributeBuffer(key);
			var array = currentMesh.getAttributeBuffer(key);
			if (key === MeshData.POSITION) {
				for (var i = 0; i < view.length; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForward(vert, vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.NORMAL) {
				for (var i = 0; i < view.length; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForwardVector(vert, vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.TANGENT) {
				for (var i = 0; i < view.length; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.applyForwardVector(vert, vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else {
				for (var i = 0; i < view.length; i++) {
					array[basePos + i] = view[i];
				}
			}
		}
		var indices = meshData.getIndexBuffer();
		var array = currentMesh.getIndexBuffer();
		for (var i = 0; i < meshData.indexCount; i++) {
			array[this.indexCounter + i] = indices[i] + this.vertexCounter;
		}
		this.vertexCounter += meshData.vertexCount;
		this.indexCounter += meshData.indexCount;
	};

	FastBuilder.prototype.build = function () {
		return this.meshDatas;
	};

	return FastBuilder;
});