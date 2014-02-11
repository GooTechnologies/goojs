define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/MeshData',
	'goo/animation/SkeletonPose',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil'
],
/** @lends */
function(
	ConfigHandler,
	MeshData,
	SkeletonPose,
	JsonUtils,
	PromiseUtil,
	ArrayUtil
) {
	"use strict";

	/*jshint eqeqeq: false, -W041, bitwise: false */
	/**
	* @class
	* @private
	*/
	function MeshDataHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	MeshDataHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('mesh', MeshDataHandler);

	MeshDataHandler.prototype.update = function(ref, meshConfig) {
		var that = this;
		if (!this._objects[ref]) {
			if (meshConfig.binaryRef) {
				return this.getConfig(meshConfig.binaryRef).then(function(bindata) {
					if (!bindata) {
						throw new Error("Binary mesh data was empty");
					}
					return that._createMeshData(meshConfig, bindata).then(function(meshData) {
						return that._objects[ref] = meshData;
					});
				});
			} else {
				return this._createMeshData(meshConfig, null).then(function(meshData) {
					return that._objects[ref] = meshData;
				});
			}
		} else {
			return PromiseUtil.createDummyPromise(this._objects[ref]);
		}
	};

	MeshDataHandler.prototype.remove = function(/*ref*/) {};

	MeshDataHandler.prototype._createMeshData = function(meshConfig, bindata) {
		var compression;
		if (meshConfig.compression && meshConfig.compression.compressed) {
			compression = {
				compressedVertsRange: meshConfig.compression.compressedVertsRange || (1 << 14) - 1,
				compressedColorsRange: meshConfig.compression.compressedColorsRange || (1 << 8) - 1,
				compressedUnitVectorRange: meshConfig.compression.compressedUnitVectorRange || (1 << 10) - 1
			};
		}

		var meshData = this._createMeshDataObject(meshConfig);
		this._fillMeshData(meshData, meshConfig, bindata, compression);

		return PromiseUtil.createDummyPromise(meshData);
	};

	MeshDataHandler.prototype._createMeshDataObject = function(config) {
		var attributeMap, indexCount, meshData, type, vertexCount, weightsPerVert;//, _i, _len, _ref, _ref1, _ref2;
		var data = config.data || config;
		if (config.type === 'SkinnedMesh') {
			weightsPerVert = 4;
			type = MeshData.SKINMESH;
		} else {
			weightsPerVert = 0;
			type = MeshData.MESH;
		}
		vertexCount = data.vertexCount;
		if (vertexCount === 0) {
			return null;
		}
		if(data.indexLengths != null) {
			indexCount = data.indexLengths[0];
		} else if (data.indices != null) {
			indexCount = data.indices.length;

		} else {
			indexCount = 0;
		}

		attributeMap = {};
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
			attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Float');
		}
		if (data.textureCoords && data.textureCoords.length > 0) {
			for (var texIdx = 0; texIdx < data.textureCoords.length; texIdx++) {
				attributeMap['TEXCOORD' + texIdx] = MeshData.createAttribute(2, 'Float');
			}
		}
		meshData = new MeshData(attributeMap, vertexCount, indexCount);
		meshData.type = type;

		return meshData;
	};

	MeshDataHandler.prototype._fillMeshData = function(meshData, config, bindata, compression) {
		var that = this;

		var data = config.data || config;

		var weightsPerVert;
		if (meshData.type === MeshData.SKINMESH) {
			weightsPerVert = 4;
		} else {
			weightsPerVert = 0;
		}

		var _fillAttributeBuffer = function(attr, data) {
			var opts;
			if (data != null ? data.length : void 0) {
				if (compression && typeof data === 'string') {
					opts = that._getCompressionOptions(attr, config, compression);
					JsonUtils.fillAttributeBufferFromCompressedString(data, meshData, attr, opts.scale, opts.offset);
				} else if (bindata) {
					meshData.getAttributeBuffer(attr).set(ArrayUtil.getTypedArray(bindata, data));
				} else {
					JsonUtils.fillAttributeBuffer(data, meshData, attr);
				}
			}
		};

		_fillAttributeBuffer(MeshData.POSITION, data.vertices);
		_fillAttributeBuffer(MeshData.NORMAL, data.normals);
		_fillAttributeBuffer(MeshData.TANGENT, data.tangents);
		_fillAttributeBuffer(MeshData.COLOR, data.colors);


		if (meshData.type === MeshData.SKINMESH) {
			_fillAttributeBuffer(MeshData.WEIGHTS, data.weights);
		}
		if (data.textureCoords != null && data.textureCoords.length > 0) {
			var textureUnits = data.textureCoords;
			for (var texIdx = 0; texIdx < textureUnits.length; texIdx++) {
				var texObj = textureUnits[texIdx];
				var attr = 'TEXCOORD' + texIdx;
				_fillAttributeBuffer(attr, texObj.UVs || texObj);
			}
		}
		if (weightsPerVert > 0 && data.joints != null && data.joints.length > 0) {
			var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
			var jointData = this._getIntBuffer(data.joints, 32767, bindata, compression);
			if (meshData.type === MeshData.SKINMESH) {
				var localJointMap = [];
				var localIndex = 0;
				for (var idx = 0; idx < jointData.length; idx++) {
					var jointIndex = jointData[idx];
					if (localJointMap[jointIndex] === void 0) {
						localJointMap[jointIndex] = localIndex++;
					}
					buffer.set([localJointMap[jointIndex]], idx);
				}
				var localMap = [];
				for (var jointIndex = 0; jointIndex < localJointMap.length; jointIndex++) {
					var localIndex = localJointMap[jointIndex];
					if (localIndex !== null) {
						localMap[localIndex] = jointIndex;
					}
				}
				meshData.paletteMap = localMap;
				meshData.weightsPerVertex = weightsPerVert;
			} else {
				for (var jointIdx = 0; 0 < jointData.capacity(); jointIdx++) {
					buffer.putCast(jointIdx, jointData.get(jointIdx));
				}
			}
		}

		if (data.indices) {
			meshData.getIndexBuffer().set(this._getIntBuffer(data.indices, data.vertexCount, bindata, compression));
		}
		if (data.indexModes) {
			meshData.indexModes = data.indexModes.slice(0);
		}
		if (data.indexLengths) {
			meshData.indexLengths = data.indexLengths.slice(0);
		}
		if (data.boundingVolume) {
			if (data.boundingVolume.type === "BoundingBox") {
				meshData.boundingBox = {min: data.boundingVolume.min, max: data.boundingVolume.max};
			}
			else {
				throw new Error("Bounding volume was not BoundingBox");
			}
		}
		return meshData;
	};

	MeshDataHandler.prototype._getIntBuffer = function(data, len, bindata, compression) {
		if (!data) {
			return null;
		} else if (compression) {
			return JsonUtils.getIntBufferFromCompressedString(data, len);
		} else if (bindata) {
			return ArrayUtil.getTypedArray(bindata, data);
		} else {
			return JsonUtils.getIntBuffer(data, len);
		}
	};

	MeshDataHandler.prototype._getCompressionOptions = function(attr, config, compression) {
		var offset, offsetObj, options, scale;
		var data = config.data || config;
		if (attr === MeshData.POSITION) {
			offsetObj = data.vertexOffsets;
			options = {
				offset: [offsetObj.xOffset, offsetObj.yOffset, offsetObj.zOffset],
				scale: [data.vertexScale, data.vertexScale, data.vertexScale]
			};
		} else if (attr === MeshData.WEIGHTS) {
			offset = 0;
			scale = 1 / compression.compressedVertsRange;
			options = {
				offset: [offset],
				scale: [scale]
			};
		} else if (attr === MeshData.NORMAL) {
			offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1);
			scale = 1 / -offset;
			options = {
				offset: [offset, offset, offset],
				scale: [scale, scale, scale]
			};
		} else if (attr === MeshData.TANGENT) {
			offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1);
			scale = 1 / -offset;
			options = {
				offset: [offset, offset, offset, offset],
				scale: [scale, scale, scale, scale]
			};
		} else if (attr === MeshData.COLOR) {
			offset = 0;
			scale = 1 / (compression.compressedColorsRange + 1);
			options = {
				offset: [offset, offset, offset, offset],
				scale: [scale, scale, scale, scale]
			};
		} else if (attr.substr(0, 8) === 'TEXCOORD') {
			var texIdx = parseInt(attr.substr(8),10);
			var texObj = data.textureCoords[texIdx];
			options = {
				offset: texObj.UVOffsets,
				scale: texObj.UVScales
			};
		}

		return options;
	};

	return MeshDataHandler;

});
