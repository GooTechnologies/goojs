"use strict";

define([ 'goo/renderer/DataMap', 'goo/entities/components/TransformComponent', 'goo/renderer/MeshData',
		'goo/loaders/JsonUtils', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/Material' ], function(DataMap,
		TransformComponent, MeshData, JsonUtils, MeshDataComponent, MeshRendererComponent, Material) {
	function JSONImporter(world) {
		this.world = world;

		this.materials = {};
		// this.skeletonMap = Maps.newHashMap();
		// this.poseMap = Maps.newHashMap();

		this.loadedEntities = [];
	}

	JSONImporter.prototype.import = function(modelSource) {
		this.loadedEntities = [];

		var request = new XMLHttpRequest();
		request.open('GET', modelSource, false);
		request.send();

		var root = JSON.parse(request.responseText);

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

		return this.loadedEntities;
	};

	JSONImporter.prototype.parseSpatial = function(object) {
		var type = object.Type;
		var name = object.Name == null ? "null" : object.Name;

		var entity = this.world.createEntity();
		entity.setComponent(new TransformComponent());
		entity.name = name;
		this.loadedEntities.push(entity);

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
		} else if (type === "Mesh") {
			// parseMaterial(object, resource, mesh);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.materials.push(Material.defaultMaterial);
			entity.setComponent(meshRendererComponent);

			var meshData = this.parseMeshData(object.MeshData, 0, entity, type);
			if (meshData == null) {
				return null;
			}

			entity.setComponent(new MeshDataComponent(meshData));
		} else if (type === "SkinnedMesh") {
			// parseMaterial(object, resource, mesh);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.materials.push(Material.defaultMaterial);
			entity.setComponent(meshRendererComponent);

			var meshData = this.parseMeshData(object.MeshData, 4, entity, type);
			if (meshData == null) {
				return null;
			}

			entity.setComponent(new MeshDataComponent(meshData));

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

	JSONImporter.prototype.parseMeshData = function(object, weightsPerVert, entity, type) {
		var vertexCount = object.VertexCount; // int
		if (vertexCount == 0) {
			return null;
		}
		var indexCount = object.IndexLengths ? object.IndexLengths[0] : 0;

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
					JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + i,
							texObj.UVScales, texObj.UVOffsets);
				}
			} else {
				for ( var i = 0; i < textureUnits.length; i++) {
					JsonUtils.fillAttributeBuffer(textureUnits[i], meshData, 'TEXCOORD' + i);
				}
			}
		}
		if (object.Joints) {
			var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
			var data;
			if (this.useCompression) {
				data = JsonUtils.getIntBufferFromCompressedString(object.Joints, 32767);
			} else {
				data = JsonUtils.getIntBuffer(object.Joints, 32767);
			}

			if (type === 'SkinnedMesh') {
				// map these joints to local.
				var localJointMap = {};
				var localIndex = 0;
				for ( var i = 0, max = data.length; i < max; i++) {
					var jointIndex = data[i];
					if (localJointMap[jointIndex] === undefined) {
						localJointMap[jointIndex] = localIndex++;
					}

					buffer.set([ localJointMap[jointIndex] ], i);
				}

				// store local map
				var localMap = [];
				for ( var jointIndex in localJointMap) {
					localIndex = localJointMap[jointIndex];
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
				meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(object.Indices, vertexCount));
			} else {
				meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(object.Indices, vertexCount));
			}
		}

		if (object.IndexModes) {
			var modes = object.IndexModes;
			if (modes.length == 1) {
				meshData._indexModes[0] = modes[0];
			} else {
				var modeArray = [];
				for ( var i = 0; i < modes.length; i++) {
					modeArray[i] = modes[i];
				}
				meshData._indexModes = modeArray;
			}
		}

		if (object.IndexLengths) {
			var lengths = object.IndexLengths;
			var lengthArray = [];
			for ( var i = 0; i < lengths.length; i++) {
				lengthArray[i] = lengths[i];
			}
			meshData._indexLengths = lengthArray;
		}

		return meshData;
	};

	return JSONImporter;
});