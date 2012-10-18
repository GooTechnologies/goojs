define([ 'goo/renderer/DataMap', 'goo/entities/components/TransformComponent', 'goo/renderer/MeshData',
		'goo/loaders/JsonUtils' ], function(DataMap, TransformComponent, MeshData, JsonUtils) {
	function JSONImporter(world) {
		this.world = world;

		materials = {};
		// skeletonMap = Maps.newHashMap();
		// poseMap = Maps.newHashMap();
	}

	JSONImporter.prototype.import = function(modelSource) {
		var request = new XMLHttpRequest();
		request.open('GET', modelSource, false);
		request.send();

		var root = JSON.parse(request.responseText);

		console.log(root);

		// check if we're compressed or not
		this.useCompression = root.UseCompression || false;

		if (this.useCompression) {
			this.compressedVertsRange = root.CompressedVertsRange || null; // int
			this.compressedColorsRange = root.CompressedColorsRange || null; // int
			this.compressedUnitVectorRange = root.CompressedUnitVectorRange || null; // int
		}

		// pull in materials
		// parseMaterials(root.get("Materials").isArray(), resource.materials);

		// pull in skeletons if we have any
		// if (root.Skeletons")) {
		// parseSkeletons(root.get("Skeletons").isArray(), resource);
		// }

		// pull in skeleton poses if we have any
		// if (root.SkeletonPoses")) {
		// parseSkeletonPoses(root.get("SkeletonPoses").isArray(), resource);
		// }

		// parse scene
		this.parseSpatial(root.Scene);

		console.log(this.world);
	};

	JSONImporter.prototype.parseSpatial = function(object) {
		var type = object.Type;
		var name = object.Name == null ? "null" : object.Name;

		var entity = this.world.createEntity();
		entity.setComponent(new TransformComponent());
		entity.name = name;
		entity.addToWorld();

		if (type === "Node") {
			if (object.Children) {
				for ( var i in object.Children) {
					var child = object.Children[i];
					var childEntity = this.parseSpatial(child);
					if (childEntity != null) {
						entity.TransformComponent.attachChild(childEntity.TransformComponent);
					}
				}
			}
		} else if (type === "Mesh" || type === "SkinnedMesh") {
			// parseMaterial(object, resource, mesh);
			console.log('parseMeshData');
			var meshData = this.parseMeshData(object.MeshData, 4, entity);
			if (meshData == null) {
				return null;
			}
		} else if (type === "SkinnedMesh") {
			// parseMaterial(object, resource, mesh);
			//
			// final MeshData meshData =
			// parseMeshData(object.get("MeshData").isObject(),
			// mesh.getWeightsPerVert(), mesh);
			// if (meshData == null) {
			// return null;
			// }
			// mesh.setMeshData(meshData);
			//
			// if (object.Pose")) {
			// final String ref = object.get("Pose").isString().stringValue();
			// mesh.setCurrentPose(resource.poseMap.get(ref));
			// }
		} else {
			return;
		}

		// var transform = JsonUtils.parseTransform(object.Transform);
		// spatial.setTransform(transform);

		return entity;
	};

	JSONImporter.prototype.parseMeshData = function(object, weightsPerVert, mesh) {

		var vertexCount = object.VertexCount; // int
		if (vertexCount == 0) {
			return null;
		}
		var indexCount = object.IndexLengths[0];

		var builder = DataMap.builder();
		if (object.Vertices) {
			builder.add(DataMap.createDescriptor('POSITION', 3, 'Float'));
		}
		if (object.Normals) {
			builder.add(DataMap.createDescriptor('NORMAL', 3, 'Float'));
		}
		if (object.Tangents) {
			builder.add(DataMap.createDescriptor('TANGENT', 4, 'Float'));
		}
		if (object.Colors) {
			builder.add(DataMap.createDescriptor('COLOR', 4, 'Float'));
		}
		if (weightsPerVert > 0 && object.Weights) {
			builder.add(DataMap.createDescriptor('WEIGHTS', 4, 'Float'));
		}
		if (weightsPerVert > 0 && object.Joints) {
			builder.add(DataMap.createDescriptor('JOINTIDS', 4, 'Short'));
		}
		if (object.TextureCoords) {
			for (i in object.TextureCoords) {
				builder.add(DataMap.createDescriptor('TEXCOORD' + i, 2, 'Float'));
			}
		}

		var meshData = new MeshData(builder.build(), vertexCount, indexCount);

		if (object.Vertices) {
			if (this.useCompression) {
				var offsetObj = object.VertexOffsets;
				JsonUtils.fillAttributeBufferFromCompressedString(object.Vertices, meshData, MeshData.POSITION, [
						object.VertexScale, object.VertexScale, object.VertexScale ], [ offsetObj.xOffset,
						offsetObj.yOffset, offsetObj.zOffset ]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Vertices, meshData, MeshData.POSITION);
			}
		}
		if (object.Weights) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 1 / this.compressedVertsRange;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Weights, meshData, MeshData.WEIGHTS,
						[ scale ], [ offset ]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Weights, meshData, MeshData.WEIGHTS);
			}
		}
		if (object.Normals) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Normals, meshData, MeshData.NORMAL, [ scale,
						scale, scale ], [ offset, offset, offset ]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Normals, meshData, MeshData.NORMAL);
			}
		}
		if (object.Tangents) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Tangents, meshData, MeshData.TANGENT, [ scale,
						scale, scale, scale ], [ offset, offset, offset, offset ]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Tangents, meshData, MeshData.TANGENT);
			}
		}
		if (object.Colors) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 255 / (this.compressedColorsRange + 1);
				JsonUtils.fillAttributeBufferFromCompressedString(object.Colors, meshData, MeshData.COLOR, [ scale,
						scale, scale, scale ], [ offset, offset, offset, offset ]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Colors, meshData, MeshData.COLOR);
			}
		}
		if (object.TextureCoords) {
			var textureUnits = object.TextureCoords;
			if (this.useCompression) {
				for ( var i = 0; i < textureUnits.length; i++) {
					var texObj = textureUnits[i];
					var offsetsArray = texObj.UVOffsets;
					var scaleArray = texObj.UVScales;
					var scales = [];
					for ( var j = 0; j < scales.length; j++) {
						if (scaleArray[j] != null) {
							scales[j] = scaleArray[j];
						}
					}
					var offsets = [];
					for ( var j = 0; j < offsets.length; j++) {
						if (offsetsArray[j] != null) {
							offsets[j] = offsetsArray[j];
						}
					}
					JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, MeshData.TEXTURES[i],
							scales, offsets);
				}
			} else {
				for ( var i = 0; i < textureUnits.length; i++) {
					JsonUtils.fillAttributeBuffer(textureUnits[i], meshData, MeshData.TEXTURES[i]);
				}
			}
		}
		if (object.Joints) {
			var buffer = (ShortBuffer)
			meshData.getAttributeBuffer(MeshData.JOINTIDS);
			var data;
			if (this.useCompression) {
				data = JsonUtils.getIntBufferFromCompressedString(object.get("Joints").isString(), Short.MAX_VALUE);
			} else {
				data = JsonUtils.getIntBuffer(object.get("Joints").isArray(), Short.MAX_VALUE);
			}

			if (mesh instanceof SkinnedMesh) {
				// map these joints to local.
				var localJointMap = Maps.newLinkedHashMap();
				var localIndex = 0;
				for ( var i = 0, max = data.capacity(); i < max; i++) {
					var jointIndex = data.get(i);
					if (!localJointMap.containsKey(jointIndex)) {
						localJointMap.put(jointIndex, localIndex++);
					}

					buffer.putCast(i, localJointMap.get(jointIndex));
				}

				// store local map
				var localMap = new int[localJointMap.size()];
				for ( var jointIndex in localJointMap.keySet()) {
					localIndex = localJointMap.get(jointIndex);
					localMap[localIndex] = jointIndex;
				}
				// ((SkinnedMesh) mesh).setPaletteMap(localMap);
			} else {
				for ( var i = 0, max = data.capacity(); i < max; i++) {
					buffer.putCast(i, data.get(i));
				}
			}
		}

		if (object.Indices) {
			if (this.useCompression) {
				meshData.setIndices(JsonUtils.getIntBufferFromCompressedString(object.Indices, vertexCount));
			} else {
				meshData.setIndices(JsonUtils.getIntBuffer(object.Indices, vertexCount));
			}
		}

		if (object.IndexModes) {
			var modes = object.IndexModes;
			var length = modes.size();
			if (length == 1) {
				var indexMode = Enum.valueOf(IndexMode.class, modes.get(0).isString().stringValue());
				meshData.setIndexMode(indexMode);
			} else {
				var modeArray = new IndexMode[length];
				for ( var i = 0; i < modes.size(); i++) {
					var indexMode = Enum.valueOf(IndexMode.class, modes.get(i).isString().stringValue());
					modeArray[i] = indexMode;
				}
				meshData.setIndexModes(modeArray);
			}
		}

		if (object.IndexLengths) {
			var lengths = object.get("IndexLengths").isArray();
			var length = lengths.size();
			var lengthArray = new int[length];
			for ( var i = 0; i < lengths.size(); i++) {
				lengthArray[i] = (int)
				lengths.get(i).isNumber().doubleValue();
			}
			meshData.setIndexLengths(lengthArray);
		}

		return meshData;
	};

	return JSONImporter;
});