"use strict";

define([ 'goo/renderer/DataMap', 'goo/entities/components/TransformComponent', 'goo/renderer/MeshData',
		'goo/loaders/JsonUtils', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/Material', 'goo/renderer/TextureCreator' ],
		function(DataMap, TransformComponent, MeshData, JsonUtils, MeshDataComponent, MeshRendererComponent, Material,
				TextureCreator) {
			function JSONImporter(world) {
				this.world = world;

				this.materials = {};
				// this.skeletonMap = Maps.newHashMap();
				// this.poseMap = Maps.newHashMap();
				this.slotUnitMap = {
					diffuse : 0,
					normal : 1,
					ao : 2,
					occlusion : 3,
					specular : 3
				};

				this.loadedEntities = [];

				this.baseTextureDir = '';
			}

			JSONImporter.prototype.load = function(modelSource, textureDir, asynchronous, callback) {
				var async = asynchronous || false;
				if (async && callback == undefined) {
					throw "Asynchronous mode needs a callback";
				}

				var request = new XMLHttpRequest();
				request.open('GET', modelSource, async);
				if (async) {
					var that = this;
					request.onreadystatechange = function() {
						if (request.readyState == 4) {
							if (request.status != 404) {
								var entities = that.parse(request.responseText, textureDir);
								callback.onSuccess(entities);
							} else {
								callback.orError(statusText);
							}
						}
					};
					request.send();
				} else {
					request.send();
					var entities = this.parse(request.responseText, textureDir);
					if (callback != undefined) {
						callback.onSuccess(entities);
					}
					return entities;
				}
			};

			JSONImporter.prototype.parse = function(modelSource, textureDir) {
				this.baseTextureDir = textureDir || '';
				this.loadedEntities = [];

				var root = JSON.parse(modelSource);

				// check if we're compressed or not
				this.useCompression = root.UseCompression || false;

				if (this.useCompression) {
					this.compressedVertsRange = root.CompressedVertsRange || (1 << 14) - 1; // int
					this.compressedColorsRange = root.CompressedColorsRange || (1 << 8) - 1; // int
					this.compressedUnitVectorRange = root.CompressedUnitVectorRange || (1 << 10) - 1; // int
				}

				// pull in materials
				this.parseMaterials(root.Materials);

				// pull in skeletons if we have any
				// if (root.Skeletons")) {
				// parseSkeletons(root.get("Skeletons").isArray(), resource);
				// }

				// pull in skeleton poses if we have any
				// if (root.SkeletonPoses")) {
				// parseSkeletonPoses(root.get("SkeletonPoses").isArray(),
				// resource);
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
					var meshRendererComponent = new MeshRendererComponent();
					meshRendererComponent.materials.push(Material.defaultMaterial);
					entity.setComponent(meshRendererComponent);

					this.parseMaterial(object, entity);

					var meshData = this.parseMeshData(object.MeshData, 0, entity, type);
					if (meshData == null) {
						return null;
					}

					entity.setComponent(new MeshDataComponent(meshData));
				} else if (type === "SkinnedMesh") {
					var meshRendererComponent = new MeshRendererComponent();
					meshRendererComponent.materials.push(Material.defaultMaterial);
					entity.setComponent(meshRendererComponent);

					this.parseMaterial(object, entity);

					var meshData = this.parseMeshData(object.MeshData, 4, entity, type);
					if (meshData == null) {
						return null;
					}

					entity.setComponent(new MeshDataComponent(meshData));

					// if (object.Pose")) {
					// final String ref =
					// object.get("Pose").isString().stringValue();
					// mesh.setCurrentPose(resource.poseMap.get(ref));
					// }
				} else {
					return;
				}

				var transform = JsonUtils.parseTransform(object.Transform);
				entity.TransformComponent.transform = transform;

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
						JsonUtils.fillAttributeBufferFromCompressedString(object.Vertices, meshData, MeshData.POSITION,
								[ object.VertexScale, object.VertexScale, object.VertexScale ], [ offsetObj.xOffset,
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

						JsonUtils.fillAttributeBufferFromCompressedString(object.Normals, meshData, MeshData.NORMAL, [
								scale, scale, scale ], [ offset, offset, offset ]);
					} else {
						JsonUtils.fillAttributeBuffer(object.Normals, meshData, MeshData.NORMAL);
					}
				}
				if (object.Tangents) {
					if (this.useCompression) {
						var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
						var scale = 1 / -offset;

						JsonUtils.fillAttributeBufferFromCompressedString(object.Tangents, meshData, MeshData.TANGENT,
								[ scale, scale, scale, scale ], [ offset, offset, offset, offset ]);
					} else {
						JsonUtils.fillAttributeBuffer(object.Tangents, meshData, MeshData.TANGENT);
					}
				}
				if (object.Colors) {
					if (this.useCompression) {
						var offset = 0;
						var scale = 255 / (this.compressedColorsRange + 1);
						JsonUtils.fillAttributeBufferFromCompressedString(object.Colors, meshData, MeshData.COLOR, [
								scale, scale, scale, scale ], [ offset, offset, offset, offset ]);
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
						meshData.getIndexBuffer().set(
								JsonUtils.getIntBufferFromCompressedString(object.Indices, vertexCount));
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

			JSONImporter.prototype.parseMaterials = function(array) {
				if (array == null) {
					return;
				}

				for ( var i = 0, max = array.length; i < max; i++) {
					var obj = array[i];
					if (obj == null) {
						continue;
					}

					var info = new MaterialInfo();

					// name is required
					info.materialName = obj.MaterialName;
					info.Profile = obj.Profile;
					info.Technique = obj.Technique;
					info.UsesTransparency = obj.UsesTransparency;
					// TODO
					// info.setMaterialState(parseMaterialState(obj));

					if (obj.TextureEntries) {
						var entries = obj.TextureEntries;
						for ( var j = 0, maxEntry = entries.length; j < maxEntry; j++) {
							var entry = entries[j];

							var textureSlot = entry.Slot;
							var textureReference = entry.TextureReference || null;
							var fileName = entry.TextureSource || null;
							var minificationFilterStr = entry.MinificationFilter || null;
							var minificationFilter = 'Trilinear';
							if (minificationFilterStr != null) {
								try {
									minificationFilter = 'minificationFilterStr';
								} catch (e) {
									console.warning("Bad texture minification filter: " + minificationFilterStr);
								}
							}
							var flipTexture = entry.Flip || true;

							info.textureReferences[textureSlot] = textureReference;
							info.textureFileNames[textureSlot] = fileName;
							info.textureMinificationFilters[textureSlot] = minificationFilter;
							info.textureFlipSettings[textureSlot] = flipTexture;
						}
					}
					this.materials[info.materialName] = info;
				}
			};

			JSONImporter.prototype.parseMaterial = function(object, entity) {
				// look for material
				if (object.Material) {
					var info = this.materials[object.Material];
					if (info != undefined) {
						// TODO
						var material = new Material(info.materialName);
						material.shader = entity.MeshRendererComponent.materials[0].shader;
						entity.MeshRendererComponent.materials[0] = material;

						// info.connectedMeshes.push(mesh);

						// apply material state
						if (info.materialState != null) {
							// mesh.setRenderState(info.getMaterialState());
						}

						if (info.useTransparency) {
							// TODO
							// var bs = new BlendState();
							// bs.setBlendEnabled(true);
							// bs.setSourceFunction(SourceFunction.SourceAlpha);
							// bs.setDestinationFunction(DestinationFunction.OneMinusSourceAlpha);
							// // bs.setConstantColor(new ColorRGBA(0.5f, 0.5f,
							// 0.5f,
							// // 0.5f));
							// mesh.setRenderState(bs);
							// mesh.getSceneHints().setRenderBucketType(RenderBucketType.Transparent);
						}

						// apply textures
						var foundTextures = false;
						for ( var key in this.slotUnitMap) {
							if (info.textureFileNames[key] != undefined) {
								var baseTexFileName = info.textureFileNames[key];
								foundTextures = true;
								var minificationFilter = info.textureMinificationFilters[key];
								var flipTexture = info.textureFlipSettings[key];

								var tex;
								if (this.nameResolver != null) {
									tex = new TextureCreator().withMinificationFilter(minificationFilter)
											.withVerticalFlip(flipTexture).withGooResourceCache(_useCache)
											.makeTexture2D(nameResolver.resolveName(baseTexFileName));
								} else {
									// look for pak contents
									// var rsrc =
									// GooResourceManager.getImageResource(_useCache,
									// baseTexFileName);
									// if (rsrc != null) {
									// tex = new
									// TextureCreator().withMinificationFilter(minificationFilter).withVerticalFlip(
									// flipTexture).withGooResourceCache(_useCache).makeTexture2D(baseTexFileName);
									// } else {

									tex = new TextureCreator().loadTexture2D(this.baseTextureDir + baseTexFileName);

									// tex = new
									// TextureCreator().withMinificationFilter(minificationFilter).withVerticalFlip(
									// flipTexture).withGooResourceCache(_useCache).makeTexture2D(
									// _baseTextureDir + baseTexFileName);
									// }
								}

								// TODO: Get wrap from json instead
								// tex.setWrap(WrapMode.Repeat);
								material.textures[this.slotUnitMap[key]] = tex;
							}
						}
						if (foundTextures) {
							// mesh.setRenderState(ts);
						}
					}
				}
			};

			function MaterialInfo() {
				this.materialName;
				this.profile;
				this.technique;
				this.textureReferences = {};
				this.textureFileNames = {};
				this.textureMinificationFilters = {};
				this.textureFlipSettings = {};
				this.useTransparency;
				this.materialState;
				this.connectedMeshes = [];
			}

			return JSONImporter;
		});