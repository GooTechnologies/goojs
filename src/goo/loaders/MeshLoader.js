/*jshint bitwise: false */
define([
	'goo/util/rsvp',
	'goo/loaders/JsonUtils',
	'goo/renderer/MeshData',
	'goo/loaders/SkeletonLoader'
],
/** @lends */
function(
	RSVP,
	JsonUtils,
	MeshData,
	SkeletonLoader
) {
	"use strict";

	/**
	 * @class Utility class for loading {@link MeshData} objects.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {Loader} parameters.loader
	 */

	function MeshLoader(parameters) {
		if (typeof parameters === "undefined" || parameters === null) {
			throw new Error('MeshLoader(): Argument `parameters` was undefined/null');
		}

		if (typeof parameters.loader === "undefined" || parameters.loader === null) {
			throw new Error('MeshLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
		this._skeletonLoader = new SkeletonLoader(parameters);
		this._cache = {};
	}

	/**
	 * Loads the mesh at <code>meshPath</code>.
	 * @example
	 * meshLoader.load('meshes/sphere.mesh').then(function(mesh) {
	 *   // handle {@link MeshData} mesh
	 * });
	 * @param {string} meshPath Relative path to the mesh.
	 * @return {RSVP.Promise} The promise is resolved with the loaded {@link MeshData} object.
	 */
	MeshLoader.prototype.load = function(meshPath) {
		if (this._cache[meshPath]) {
			return this._cache[meshPath];
		}

		var that = this;
		var promise = this._loader.load(meshPath, function(data) {
			return that._parse(data);
		});

		this._cache[meshPath] = promise;
		return promise;
	};


	MeshLoader.prototype._parse = function(data) {
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		var promise = new RSVP.Promise();

		try {
			if (Object.keys(data).length === 0) {
				promise.reject('Empty meshdata');
				return promise;
			}
			if (data.compression) {
				this.useCompression = data.compression.compressed || false;
				this.compressedVertsRange = data.compression.compressedVertsRange || (1 << 14) - 1; // int
				this.compressedColorsRange = data.compression.compressedColorsRange || (1 << 8) - 1; // int
				this.compressedUnitVectorRange = data.compression.compressedUnitVectorRange || (1 << 10) - 1; // int
			}
			var type = (data.type === 'SkinnedMesh') ? 'SkinnedMesh' : 'Mesh';
			var meshData;
			if (data.type === 'SkinnedMesh') {
				meshData = this._parseMeshData(data.data || data, 4, type);
				meshData.type = MeshData.SKINMESH;
			} else {
				meshData = this._parseMeshData(data.data || data, 0, type);
				meshData.type = MeshData.MESH;
			}
			if (data.pose) {
				var skeletonLoader = this._skeletonLoader;
				promise = skeletonLoader.load(data.pose)
					.then(function(skeletonPose) {
					meshData.currentPose = skeletonPose;
					return meshData;
				});
			} else {
				promise.resolve(meshData);
			}
		} catch (e) {
			promise.reject(e);
		}

		return promise;
	};

	MeshLoader.prototype._parseMeshData = function(data, weightsPerVert, type) {
		var vertexCount = data.vertexCount; // int
		if (vertexCount === 0) {
			return null;
		}

		var indexCount = data.indexLengths ? data.indexLengths[0] : data.indices ? data.indices.length : 0;

		var attributeMap = {};
		if (data.vertices && data.vertices.length > 0) {
			attributeMap.POSITION = MeshData.createAttribute(3, 'Float');
		}
		if (data.normals && data.normals.length > 0) {
			attributeMap.NORMAL = MeshData.createAttribute(3, 'Float');
		}
		if (data.tangents && data.tangents.length > 0) {
			attributeMap.TANGENT = MeshData.createAttribute(4, 'Float');
		}
		if (data.colors && data.colors.length > 0) {
			attributeMap.COLOR = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVert > 0 && data.weights) {
			attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVert > 0 && data.joints) {
			attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short');
		}
		if (data.textureCoords && data.textureCoords.length > 0) {
			for (var i in data.textureCoords) {
				attributeMap['TEXCOORD' + i] = MeshData.createAttribute(2, 'Float');
			}
		}
		var meshData = new MeshData(attributeMap, vertexCount, indexCount);

		if (data.vertices && data.vertices.length > 0) {
			if (this.useCompression) {
				var offsetObj = data.vertexOffsets;
				JsonUtils.fillAttributeBufferFromCompressedString(data.vertices, meshData, MeshData.POSITION, [data.vertexScale,
				data.vertexScale, data.vertexScale], [offsetObj.xOffset, offsetObj.yOffset, offsetObj.zOffset]);
			} else {
				JsonUtils.fillAttributeBuffer(data.vertices, meshData, MeshData.POSITION);
			}
		}
		if (weightsPerVert > 0 && data.weights) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 1 / this.compressedVertsRange;

				JsonUtils.fillAttributeBufferFromCompressedString(data.weights, meshData, MeshData.WEIGHTS, [scale], [offset]);
			} else {
				JsonUtils.fillAttributeBuffer(data.weights, meshData, MeshData.WEIGHTS);
			}
		}
		if (data.normals && data.normals.length > 0) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(data.normals, meshData, MeshData.NORMAL, [scale, scale, scale], [offset, offset,
				offset]);
			} else {
				JsonUtils.fillAttributeBuffer(data.normals, meshData, MeshData.NORMAL);
			}
		}
		if (data.tangents && data.tangents.length > 0) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(data.tangents, meshData, MeshData.TANGENT, [scale, scale, scale, scale], [offset,
				offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(data.tangents, meshData, MeshData.TANGENT);
			}
		}
		if (data.colors && data.colors.length > 0) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 255 / (this.compressedColorsRange + 1);
				JsonUtils.fillAttributeBufferFromCompressedString(data.colors, meshData, MeshData.COLOR, [scale, scale, scale, scale], [offset,
				offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(data.colors, meshData, MeshData.COLOR);
			}
		}
		if (data.textureCoords && data.textureCoords.length > 0) {
			var textureUnits = data.textureCoords;
			if (this.useCompression) {
				for (var i = 0; i < textureUnits.length; i++) {
					var texObj = textureUnits[i];
					JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + i, texObj.UVScales, texObj.UVOffsets);
				}
			} else {
				for (var i = 0; i < textureUnits.length; i++) {
					JsonUtils.fillAttributeBuffer(textureUnits[i], meshData, 'TEXCOORD' + i);
				}
			}
		}
		if (weightsPerVert > 0 && data.joints) {
			var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
			var jointData;
			if (this.useCompression) {
				jointData = JsonUtils.getIntBufferFromCompressedString(data.joints, 32767);
			} else {
				jointData = JsonUtils.getIntBuffer(data.joints, 32767);
			}
			if (type === 'SkinnedMesh') {
				// map these joints to local.
				var localJointMap = [];
				var localIndex = 0;
				for (var i = 0, max = jointData.length; i < max; i++) {
					var jointIndex = jointData[i];
					if (localJointMap[jointIndex] === undefined) {
						localJointMap[jointIndex] = localIndex++;
					}

					buffer.set([localJointMap[jointIndex]], i);
				}

				// store local map
				var localMap = [];
				for (var jointIndex = 0; jointIndex < localJointMap.length; jointIndex++) {
					localIndex = localJointMap[jointIndex];
					if (localIndex !== undefined) {
						localMap[localIndex] = jointIndex;
					}
				}

				meshData.paletteMap = localMap;
				meshData.weightsPerVertex = weightsPerVert;
			} else {
				for (var i = 0, max = jointData.capacity(); i < max; i++) {
					buffer.putCast(i, jointData.get(i));
				}
			}
		}

		if (data.indices) {
			if (this.useCompression) {
				meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(data.indices, vertexCount));
			} else {
				meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(data.indices, vertexCount));
			}
		}

		if (data.indexModes) {
			var modes = data.indexModes;
			if (modes.length === 1) {
				meshData.indexModes[0] = modes[0];
			} else {
				var modeArray = [];
				for (var i = 0; i < modes.length; i++) {
					modeArray[i] = modes[i];
				}
				meshData.indexModes = modeArray;
			}
		}

		if (data.indexLengths) {
			var lengths = data.indexLengths;
			var lengthArray = [];
			for (var i = 0; i < lengths.length; i++) {
				lengthArray[i] = lengths[i];
			}
			meshData.indexLengths = lengthArray;
		}

		if (data.boundingBox) {
			meshData.boundingBox = data.boundingBox;
		}

		return meshData;
	};

	return MeshLoader;
});