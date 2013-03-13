/*jshint bitwise: false */
define([
		'goo/lib/rsvp.amd',
		'goo/loaders/JsonUtils',
	'goo/renderer/MeshData',
	'goo/loaders/SkeletonLoader'
	],
/** @lends MeshLoader */
function(
	RSVP,
	JsonUtils,
	MeshData,
	SkeletonLoader
	) {
	"use strict";

	/**
	 * Utility class for loading MeshData objects.
	 *
	 * @constructor
	 * @param {Loader} parameters.loader
	 */
	function MeshLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('MeshLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || parameters.loader === null) {
			throw new Error('MeshLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
	}

	/**
	 * Loads the mesh at <code>meshPath</code>.
	 *
	 * @param {string} meshPath Relative path to the mesh.
	 * @return {Promise} The promise is resolved with the loaded MeshData object.
	 */
	MeshLoader.prototype.load = function(meshPath) {
		var that = this;
		return this._loader.load(meshPath, function(data) {
			return that._parse(data);
		});
	};


	MeshLoader.prototype._parse = function(data) {
		var promise = new RSVP.Promise();

		try {

			if (data.compression) {
				this.useCompression = data.compression.compressed || false;
				this.compressedVertsRange = data.compression.compressedVertsRange || (1 << 14) - 1; // int
				this.compressedColorsRange = data.compression.compressedColorsRange || (1 << 8) - 1; // int
				this.compressedUnitVectorRange = data.compression.compressedUnitVectorRange || (1 << 10) - 1; // int
			}
			var type = (data.type === 'SkinnedMesh') ? 'SkinnedMesh' : 'Mesh';
			var meshData;
			if (data.type === 'SkinnedMesh') {
				meshData = this._parseMeshData(data, 4, type);
				meshData.type = MeshData.SKINMESH;
			} else {
				meshData = this._parseMeshData(data, 0, type);
				meshData.type = MeshData.MESH;
			}
			if (data.pose) {
				var skeletonLoader = new SkeletonLoader({
					loader: this._loader
				});
				promise = skeletonLoader.load(data.pose)
				.then(function(skeletonPose) {
					meshData.currentPose = skeletonPose;
					return meshData;
				});
			}
			else {
				promise.resolve(meshData);
			}
		} catch(e) {
			promise.reject(e);
		}

		return promise;
	};

	MeshLoader.prototype._parseMeshData = function (object, weightsPerVert, type) {
		var vertexCount = object.data.VertexCount; // int
		if (vertexCount === 0) {
			return null;
		}

		var indexCount = object.data.IndexLengths ? object.data.IndexLengths[0] : object.data.Indices ? object.data.Indices.length : 0;

		var attributeMap = {};
		if (object.data.Vertices) {
			attributeMap.POSITION = MeshData.createAttribute(3, 'Float');
		}
		if (object.data.Normals) {
			attributeMap.NORMAL = MeshData.createAttribute(3, 'Float');
		}
		if (object.data.Tangents) {
			attributeMap.TANGENT = MeshData.createAttribute(4, 'Float');
		}
		if (object.data.Colors) {
			attributeMap.COLOR = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVert > 0 && object.data.Weights) {
			attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVert > 0 && object.data.Joints) {
			attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short');
		}
		if (object.data.TextureCoords) {
			for (var i in object.data.TextureCoords) {
				attributeMap['TEXCOORD' + i] = MeshData.createAttribute(2, 'Float');
			}
		}
		var meshData = new MeshData(attributeMap, vertexCount, indexCount);

		if (object.data.Vertices) {
			if (this.useCompression) {
				var offsetObj = object.data.VertexOffsets;
				JsonUtils.fillAttributeBufferFromCompressedString(object.data.Vertices, meshData, MeshData.POSITION, [object.data.VertexScale,
						object.data.VertexScale, object.data.VertexScale], [offsetObj.xOffset, offsetObj.yOffset, offsetObj.zOffset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.data.Vertices, meshData, MeshData.POSITION);
			}
		}
		if (weightsPerVert > 0 && object.data.Weights) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 1 / this.compressedVertsRange;

				JsonUtils.fillAttributeBufferFromCompressedString(object.data.Weights, meshData, MeshData.WEIGHTS, [scale], [offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.data.Weights, meshData, MeshData.WEIGHTS);
			}
		}
		if (object.data.Normals) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.data.Normals, meshData, MeshData.NORMAL, [scale, scale, scale], [offset, offset,
						offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.data.Normals, meshData, MeshData.NORMAL);
			}
		}
		if (object.data.Tangents) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.data.Tangents, meshData, MeshData.TANGENT, [scale, scale, scale, scale], [offset,
						offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.data.Tangents, meshData, MeshData.TANGENT);
			}
		}
		if (object.data.Colors) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 255 / (this.compressedColorsRange + 1);
				JsonUtils.fillAttributeBufferFromCompressedString(object.data.Colors, meshData, MeshData.COLOR, [scale, scale, scale, scale], [offset,
						offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.data.Colors, meshData, MeshData.COLOR);
			}
		}
		if (object.data.TextureCoords) {
			var textureUnits = object.data.TextureCoords;
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
		if (weightsPerVert > 0 && object.data.Joints) {
			var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
			var data;
			if (this.useCompression) {
				data = JsonUtils.getIntBufferFromCompressedString(object.data.Joints, 32767);
			} else {
				data = JsonUtils.getIntBuffer(object.data.Joints, 32767);
			}
			if (type === 'SkinnedMesh') {
				// map these joints to local.
				var localJointMap = [];
				var localIndex = 0;
				for (var i = 0, max = data.length; i < max; i++) {
					var jointIndex = data[i];
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
				for (var i = 0, max = data.capacity(); i < max; i++) {
					buffer.putCast(i, data.get(i));
				}
			}
		}

		if (object.data.Indices) {
			if (this.useCompression) {
				meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(object.data.Indices, vertexCount));
			} else {
				meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(object.data.Indices, vertexCount));
			}
		}

		if (object.data.IndexModes) {
			var modes = object.data.IndexModes;
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

		if (object.data.IndexLengths) {
			var lengths = object.data.IndexLengths;
			var lengthArray = [];
			for (var i = 0; i < lengths.length; i++) {
				lengthArray[i] = lengths[i];
			}
			meshData.indexLengths = lengthArray;
		}
		return meshData;
	};

	return MeshLoader;
});