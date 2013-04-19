define([
        'goo/renderer/MeshData',
        'goo/math/Vector3'
        ],
	/** @lends */
	function (
		MeshData,
		Vector3
	) {
	"use strict";

	/**
	 * @class Builds numerous copies of a given mesh. Groups them into larger meshes.
	 * @example
	 * var count = 50;
	 * // prepare the builder
	 * var meshBuilder = new FastBuilder(meshData, count, {
	 *   progress: function (percent) {
	 *       console.log(percent);
	 *     },
	 *     done: function () {
	 *       console.log('Done!');
	 *     }
	 *   });
	 * // add each mesh with a different translation
	 * var transform = new Transform();
	 * for (var x = 0; x < count; x++) {
	 *   // make a circle
	 *   transform.translation.data[0] = Math.sin(x*Math.PI*2/count);
	 *   transform.translation.data[1] = 0;
	 *   transform.translation.data[2] = Math.cos(x*Math.PI*2/count);
	 *   transform.translation.mul(20.0);
	 *   transform.update();
	 *
	 *   meshBuilder.addMeshData(meshData, transform);
	 * }
	 * // notify that we're done and return the grouped meshes for further configuration
	 * var meshDatas = meshBuilder.build();
	 * @param {MeshData} meshData The mesh to copy
	 * @param {number} count The number of copies
	 * @param {Object} [callback] A set of progress monitoring callbacks. Accepts an object of the form:<pre>
	 * {
	 *   progress: function () {...},
	 *   done: function () {...}
	 * }
	 * </pre>
	 * The progress function is called in certain intervals during the loading of the meshes. done is called after loading is done.
	 */
	function FastBuilder(meshData, count, callback) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		}

		this.callback = callback || {
			progress: function () {},
			done: function () {}
		};
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
					stride : data.stride,
					offset : data.offset,
					normalized: data.normalized
				};
			}
			var newMeshData = new MeshData(attributeMap, vertexCount, indexCount);
			counter -= amount;
			this.meshDatas.push(newMeshData);
			if (counter <= 0)  {
				break;
			}
		}

		this.vertexCounter = 0;
		this.indexCounter = 0;

		this.callback.progress(0);
	}

	var vert = new Vector3();
	/**
	 * Adds a new copy of the mesh with its own transform element. Creates a new group if needed.
	 * @param {MeshData} meshData
	 * @param {Transform} transform
	 */
	FastBuilder.prototype.addMeshData = function (meshData, transform) {
		if (meshData.vertexCount >= 65536) {
			throw new Error("Maximum number of vertices for a mesh to add is 65535. Got: " + meshData.vertexCount);
		} else if (this.vertexCounter + meshData.vertexCount >= 65536) {
//			console.log('Mesh size limit reached, creating new mesh');

			this.dataCounter++;
			this.vertexData = {};
			this.indexData = [];
			this.vertexCounter = 0;
			this.indexCounter = 0;

			this.callback.progress(this.dataCounter / (this.meshDatas.length - 1));
		}

		var currentMesh = this.meshDatas[this.dataCounter];
		var attributeMap = meshData.attributeMap;
		for (var key in attributeMap) {
			var map = attributeMap[key];

			var basePos = this.vertexCounter * map.count;
			var view = meshData.getAttributeBuffer(key);
			var viewLength = view.length;
			var array = currentMesh.getAttributeBuffer(key);
			if (key === MeshData.POSITION) {
				for (var i = 0; i < viewLength; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.matrix.applyPostPoint(vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.NORMAL) {
				for (var i = 0; i < viewLength; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.rotation.applyPost(vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else if (key === MeshData.TANGENT) {
				for (var i = 0; i < viewLength; i += 3) {
					vert.setd(view[i + 0], view[i + 1], view[i + 2]);
					transform.rotation.applyPost(vert);
					array[basePos + i + 0] = vert.data[0];
					array[basePos + i + 1] = vert.data[1];
					array[basePos + i + 2] = vert.data[2];
				}
			} else {
				for (var i = 0; i < viewLength; i++) {
					array[basePos + i] = view[i];
				}
			}
		}
		var indices = meshData.getIndexBuffer();
		var array = currentMesh.getIndexBuffer();
		for (var i = 0, l = meshData.indexCount; i < l; i++) {
			array[this.indexCounter + i] = indices[i] + this.vertexCounter;
		}
		this.vertexCounter += meshData.vertexCount;
		this.indexCounter += meshData.indexCount;
	};

	/**
	 * Calls callback.done and returns an array containing the group meshes.
	 * @returns {MeshData[]}
	 */
	FastBuilder.prototype.build = function () {
		this.callback.done();
		return this.meshDatas;
	};

	return FastBuilder;
});