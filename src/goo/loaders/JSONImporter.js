/* jshint bitwise: false */
define([
	'goo/renderer/MeshData',
	'goo/loaders/JsonUtils',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator',
	'goo/animation/Joint',
	'goo/animation/Skeleton',
	'goo/animation/SkeletonPose',
	'goo/util/URLTools',
	'goo/util/SimpleResourceUtil',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Shader'
],
/** @lends */
function (
	MeshData,
	JsonUtils,
	MeshDataComponent,
	MeshRendererComponent,
	Material,
	TextureCreator,
	Joint,
	Skeleton,
	SkeletonPose,
	URLTools,
	SimpleResourceUtil,
	ShaderLib,
	Shader
) {
	"use strict";

	/**
	 * @constructor
	 * @class Importer for our compressed JSON format
	 * @param {World} world {@link World} reference needed to create entities
	 * @example require(['goo/loaders/JSONImporter'], function(JSONImporter) { var goo = new GooRunner(); ... var importer = new
	 *          JSONImporter(goo.world); ... });
	 */
	function JSONImporter (world) {
		this.world = world;

		this.materials = {};
		this.skeletonMap = {};
		this.poseMap = {};

		this.slotUnitMap = {
			diffuse : Shader.DIFFUSE_MAP,
			normal : Shader.NORMAL_MAP,
			ao : Shader.AO_MAP,
			occlusion : 'OCCLUSION_MAP',
			specular : Shader.SPECULAR_MAP
		};

		this.loadedEntities = [];

		this.baseTextureDir = '';
	}

	/**
	 * Loads a model from the supplied model url and texture path.
	 * 
	 * @param modelUrl URL of the model file to load.
	 * @param textureDir Base URL for textures. Optional. If not supplied, modelUrl up to the last '/' is used as base.
	 * @param callback Callback with
	 *            <ul>
	 *            <li>onSuccess(entities)
	 *            <li>onError(error)
	 *            </ul>
	 * @param [shaderExtractor] Callback function for deciding shaders based on mesh/material information. Callback definition function(attributes,
	 *            info)
	 * @returns Entities created during load
	 */
	JSONImporter.prototype.load = function (modelUrl, textureDir, callback, shaderExtractor) {
		var request = new XMLHttpRequest();
		if (typeof textureDir === 'undefined' || textureDir === null) {
			textureDir = URLTools.getDirectory(modelUrl);
		}
		request.open('GET', modelUrl, true);
		var that = this;
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					var entities = that.parse(request.responseText, textureDir, shaderExtractor);
					callback.onSuccess(entities);
				} else {
					callback.onError(request.statusText);
				}
			}
		};
		request.send();
	};

	/**
	 * Parses a model from the supplied model source and texture path.
	 * 
	 * @param {String} modelSource JSON model source as a string
	 * @param textureDir Texture path
	 * @param [shaderExtractor] Callback function for deciding shaders based on mesh/material information. Callback definition function(attributes,
	 *            info)
	 * @returns Entities created during load
	 */
	JSONImporter.prototype.parse = function (modelSource, textureDir, shaderExtractor) {
		this.baseTextureDir = textureDir || '';
		this.loadedEntities = [];
		this.shaderExtractor = shaderExtractor;

		var root = JSON.parse(modelSource);

		// check if we're compressed or not
		this.useCompression = root.UseCompression || false;

		if (this.useCompression) {
			this.compressedVertsRange = root.CompressedVertsRange || (1 << 14) - 1; // int
			this.compressedColorsRange = root.CompressedColorsRange || (1 << 8) - 1; // int
			this.compressedUnitVectorRange = root.CompressedUnitVectorRange || (1 << 10) - 1; // int
		}

		// pull in materials
		this._parseMaterials(root.Materials);

		// pull in skeletons if we have any
		if (root.Skeletons) {
			this.parseSkeletons(root.Skeletons);
		}

		// pull in skeleton poses if we have any
		if (root.SkeletonPoses) {
			this.parseSkeletonPoses(root.SkeletonPoses);
		}

		// parse scene
		this._parseSpatial(root.Scene);

		delete this.shaderExtractor;

		return this.loadedEntities;
	};

	JSONImporter.prototype._parseSpatial = function (object) {
		var type = object.Type;
		var name = object.Name === null ? "null" : object.Name;

		var entity = this.world.createEntity();
		entity.name = name;
		this.loadedEntities.push(entity);

		if (type === "Node") {
			if (object.Children) {
				for ( var i in object.Children) {
					var child = object.Children[i];
					var childEntity = this._parseSpatial(child);
					if (childEntity !== null) {
						entity.transformComponent.attachChild(childEntity.transformComponent);
					}
				}
			}
		} else if (type === "Mesh") {
			var meshData = this._parseMeshData(object.MeshData, 0, entity, type);
			if (meshData === null) {
				return null;
			}
			meshData.type = MeshData.MESH;

			entity.setComponent(new MeshDataComponent(meshData));

			var meshRendererComponent = new MeshRendererComponent();
			entity.setComponent(meshRendererComponent);
			this._parseMaterial(object, entity);
		} else if (type === "SkinnedMesh") {
			var meshData = this._parseMeshData(object.MeshData, 4, entity, type);
			if (meshData === null) {
				return null;
			}
			meshData.type = MeshData.SKINMESH;

			entity.setComponent(new MeshDataComponent(meshData));

			var meshRendererComponent = new MeshRendererComponent();
			entity.setComponent(meshRendererComponent);
			this._parseMaterial(object, entity);

			if (object.Pose) {
				meshData.currentPose = this.poseMap[object.Pose];
			}
		} else {
			return;
		}

		var transform = JsonUtils.parseTransform(object.Transform);
		entity.transformComponent.transform = transform;

		return entity;
	};

	JSONImporter.prototype.parseSkeletons = function (array) {
		for ( var i = 0, maxI = array.length; i < maxI; i++) {
			var obj = array[i];
			var ref = obj.ref;
			var skName = obj.Name;
			var jointArray = obj.Joints;
			var joints = [];

			for ( var j = 0, maxJ = jointArray.length; j < maxJ; j++) {
				var jointObj = jointArray[j];
				var jName = jointObj.Name;
				var joint = new Joint(jName);

				joint._index = Math.round(jointObj.Index);
				joint._parentIndex = Math.round(jointObj.ParentIndex);
				joint._inverseBindPose.copy(JsonUtils.parseTransform(jointObj.InverseBindPose));
				joint._inverseBindPose.update();
				joints[j] = joint;
			}

			var skeleton = new Skeleton(skName, joints);
			this.skeletonMap[ref] = skeleton;
		}
	};

	JSONImporter.prototype.parseSkeletonPoses = function (array) {
		for ( var i = 0, max = array.length; i < max; i++) {
			var obj = array[i];
			var ref = obj.ref;
			var sk = obj.Skeleton;
			var skeleton = this.skeletonMap[sk];
			var pose = new SkeletonPose(skeleton);
			pose.setToBindPose();
			this.poseMap[ref] = pose;
		}
	};

	JSONImporter.prototype._parseMeshData = function (object, weightsPerVertex, entity, type) {
		var vertexCount = object.VertexCount; // int
		if (vertexCount === 0) {
			return null;
		}
		var indexCount = object.IndexLengths ? object.IndexLengths[0] : object.Indices ? object.Indices.length : 0;

		var attributeMap = {};
		if (object.Vertices) {
			attributeMap.POSITION = MeshData.createAttribute(3, 'Float');
		}
		if (object.Normals) {
			attributeMap.NORMAL = MeshData.createAttribute(3, 'Float');
		}
		if (object.Tangents) {
			attributeMap.TANGENT = MeshData.createAttribute(4, 'Float');
		}
		if (object.Colors) {
			attributeMap.COLOR = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVertex > 0 && object.Weights) {
			attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float');
		}
		if (weightsPerVertex > 0 && object.Joints) {
			attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short');
		}
		if (object.TextureCoords) {
			for ( var i in object.TextureCoords) {
				attributeMap['TEXCOORD' + i] = MeshData.createAttribute(2, 'Float');
			}
		}

		var meshData = new MeshData(attributeMap, vertexCount, indexCount);

		if (object.Vertices) {
			if (this.useCompression) {
				var offsetObj = object.VertexOffsets;
				JsonUtils.fillAttributeBufferFromCompressedString(object.Vertices, meshData, MeshData.POSITION, [object.VertexScale,
						object.VertexScale, object.VertexScale], [offsetObj.xOffset, offsetObj.yOffset, offsetObj.zOffset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Vertices, meshData, MeshData.POSITION);
			}
		}
		if (object.Weights) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 1 / this.compressedVertsRange;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Weights, meshData, MeshData.WEIGHTS, [scale], [offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Weights, meshData, MeshData.WEIGHTS);
			}
		}
		if (object.Normals) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Normals, meshData, MeshData.NORMAL, [scale, scale, scale], [offset, offset,
						offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Normals, meshData, MeshData.NORMAL);
			}
		}
		if (object.Tangents) {
			if (this.useCompression) {
				var offset = 1 - (this.compressedUnitVectorRange + 1 >> 1);
				var scale = 1 / -offset;

				JsonUtils.fillAttributeBufferFromCompressedString(object.Tangents, meshData, MeshData.TANGENT, [scale, scale, scale, scale], [offset,
						offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Tangents, meshData, MeshData.TANGENT);
			}
		}
		if (object.Colors) {
			if (this.useCompression) {
				var offset = 0;
				var scale = 1 / (this.compressedColorsRange + 1);
				JsonUtils.fillAttributeBufferFromCompressedString(object.Colors, meshData, MeshData.COLOR, [scale, scale, scale, scale], [offset,
						offset, offset, offset]);
			} else {
				JsonUtils.fillAttributeBuffer(object.Colors, meshData, MeshData.COLOR);
			}
		}
		if (object.TextureCoords) {
			var textureUnits = object.TextureCoords;
			if (this.useCompression) {
				for ( var i = 0; i < textureUnits.length; i++) {
					var texObj = textureUnits[i];
					JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + i, texObj.UVScales, texObj.UVOffsets);
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
				var localJointMap = [];
				var localIndex = 0;
				for ( var i = 0, max = data.length; i < max; i++) {
					var jointIndex = data[i];
					if (localJointMap[jointIndex] === undefined) {
						localJointMap[jointIndex] = localIndex++;
					}

					buffer.set([localJointMap[jointIndex]], i);
				}

				// store local map
				var localMap = [];
				for ( var jointIndex = 0; jointIndex < localJointMap.length; jointIndex++) {
					localIndex = localJointMap[jointIndex];
					if (localIndex !== undefined) {
						localMap[localIndex] = jointIndex;
					}
				}

				meshData.paletteMap = localMap;
				meshData.weightsPerVertex = weightsPerVertex;
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
			if (modes.length === 1) {
				meshData.indexModes[0] = modes[0];
			} else {
				var modeArray = [];
				for ( var i = 0; i < modes.length; i++) {
					modeArray[i] = modes[i];
				}
				meshData.indexModes = modeArray;
			}
		}

		if (object.IndexLengths) {
			var lengths = object.IndexLengths;
			var lengthArray = [];
			for ( var i = 0; i < lengths.length; i++) {
				lengthArray[i] = lengths[i];
			}
			meshData.indexLengths = lengthArray;
		}

		return meshData;
	};

	JSONImporter.prototype._parseMaterials = function (array) {
		if (!array) {
			return;
		}

		for ( var i = 0, max = array.length; i < max; i++) {
			var obj = array[i];
			if (obj === null) {
				continue;
			}

			var info = new MaterialInfo();

			// name is required
			info.materialName = obj.MaterialName;
			info.profile = obj.Profile;
			info.technique = obj.Technique;
			info.usesTransparency = obj.UsesTransparency;
			info.materialState = this._parseMaterialstate(obj);

			if (obj.TextureEntries) {
				var entries = obj.TextureEntries;
				for ( var j = 0, maxEntry = entries.length; j < maxEntry; j++) {
					var entry = entries[j];

					var textureSlot = entry.Slot;
					var textureReference = entry.TextureReference || null;
					var fileName = entry.TextureSource || null;
					var minificationFilterStr = entry.MinificationFilter || null;
					var minificationFilter = 'Trilinear';
					if (minificationFilterStr !== null) {
						try {
							minificationFilter = 'minificationFilterStr';
						} catch (e) {
							console.warn("Bad texture minification filter: " + minificationFilterStr);
						}
					}
					var flipTexture = entry.Flip !== undefined ? entry.Flip : true;

					info.textureReferences[textureSlot] = textureReference;
					info.textureFileNames[textureSlot] = fileName;
					info.textureMinificationFilters[textureSlot] = minificationFilter;
					info.textureFlipSettings[textureSlot] = flipTexture;
				}
			}
			this.materials[info.materialName] = info;
		}
	};

	JSONImporter.prototype._parseMaterial = function (object, entity) {
		// look for material
		if (object.Material) {
			var info = this.materials[object.Material];
			if (info !== undefined) {
				var meshRendererComponent = entity.meshRendererComponent;
				var attributes = entity.meshDataComponent.meshData.attributeMap;

				var material = null;
				if (!this.shaderExtractor) {
					// var shaderSource, type;
					// if (attributes.NORMAL && attributes.TANGENT && attributes.TEXCOORD0 && attributes.TEXCOORD1 && attributes.TEXCOORD2
					// 	&& info.textureFileNames.diffuse && info.textureFileNames.normal && info.textureFileNames.ao) {
					// 	shaderSource = ShaderLib.texturedNormalAOLit;
					// 	type = 'texturedNormalAOLit';
					// } else if (attributes.NORMAL && attributes.TEXCOORD0 && info.textureFileNames.diffuse) {
					// 	shaderSource = ShaderLib.texturedLit;
					// 	type = 'texturedLit';
					// } else if (attributes.TEXCOORD0 && info.textureFileNames.diffuse) {
					// 	shaderSource = ShaderLib.textured;
					// 	type = 'textured';
					// } else {
					// 	shaderSource = ShaderLib.simple;
					// 	type = 'simple';
					// }
					// material = Material.createMaterial(shaderSource, info.materialName);
					material = Material.createMaterial(ShaderLib.uber, info.materialName);
				} else {
					var extractedData = this.shaderExtractor(attributes, info);
					if (extractedData instanceof Material) {
						material = extractedData;
					} else if (extractedData instanceof Shader) {
						material = new Material(info.materialName);
						material.shader = extractedData;
					} else {
						throw new Error('The extractor should return a Material or a Shader');
					}
				}

				meshRendererComponent.materials[0] = material;
				// info.connectedMeshes.push(mesh);

				// apply material state
				material.materialState = info.materialState;

				// TODO: useTransparency
				// if (info.useTransparency) {
				// var bs = new BlendState();
				// bs.setBlendEnabled(true);
				// bs.setSourceFunction(SourceFunction.SourceAlpha);
				// bs.setDestinationFunction(DestinationFunction.OneMinusSourceAlpha);
				// // bs.setConstantColor(new ColorRGBA(0.5f, 0.5f,
				// 0.5f,
				// // 0.5f));
				// mesh.setRenderState(bs);
				// mesh.getSceneHints().setRenderBucketType(RenderBucketType.Transparent);
				// }

				// apply textures
				for ( var key in this.slotUnitMap) {
					if (info.textureFileNames[key] !== undefined) {
						var baseTexFileName = info.textureFileNames[key];
						// var minificationFilter = info.textureMinificationFilters[key];
						// var flipTexture = info.textureFlipSettings[key];

						var tex;

						// Copied from the else clause below
						tex = new TextureCreator().loadTexture2D(this.baseTextureDir + baseTexFileName);

						// tex.setWrap(WrapMode.Repeat);
						material.setTexture(this.slotUnitMap[key], tex);
					}
				}
			}
		}
	};

	JSONImporter.prototype._parseMaterialstate = function (object) {
		var ms = {};

		ms.ambient = this._parseColor(object.AmbientColor);
		ms.diffuse = this._parseColor(object.DiffuseColor);
		ms.emissive = this._parseColor(object.EmissiveColor);
		ms.specular = this._parseColor(object.SpecularColor);
		ms.shininess = object.Shininess;

		return ms;
	};

	JSONImporter.prototype._parseColor = function (hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})*$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16) / 255.0,
			parseInt(result[2], 16) / 255.0,
			parseInt(result[3], 16) / 255.0,
			result[4] !== undefined ? parseInt(result[4], 16) / 255.0 : 1.0
		] : null;
	};
	/*
	JSONImporter.prototype.importAnimationTree = function (manager, treeSource, completeCallback) {
		return this.importAnimationTreeFromJSON(manager, JSON.parse(treeSource), completeCallback);
	};

	JSONImporter.prototype.importAnimationTreeFromJSON = function (manager, root, completeCallback) {
		var outputStore = new OutputStore();
		// read clip info
		if (!root.Clips || !root.Layers) {
			if (completeCallback) {
				completeCallback.onSuccess(outputStore);
			}
			return;
		}
		var clips = root.Clips;
		var names = [];
		var urls = [];
		for ( var i = 0, max = clips.length; i < max; i++) {
			var obj = clips[i];
			names.push(obj.Name);
			urls.push(obj.URL);
		}

		// load all clips and report back when done
		SimpleResourceUtil.loadTextAssets(urls, names, {
			onSuccess : function (clipSources) {
				// done with clips, parse out the layers
				var inputStore = {};
				for ( var i = 0, max = names.length; i < max; i++) {
					var clip = new JSONImporter().importAnimation(clipSources[names[i]], names[i]);
					inputStore[clip._name] = clip;
				}

				JsonUtils.parseAnimationLayers(manager, completeCallback, inputStore, outputStore, root);
			},
			onError : function (error) {
				console.warn("failed loading tree clips: " + error);
				if (completeCallback) {
					completeCallback.onError(error);
				}
			}
		});
	};

	JSONImporter.prototype.importAnimation = function (clipSource, clipName) {
		var clip = new AnimationClip(clipName);
		var root = JSON.parse(clipSource);

		// check if we're compressed or not.
		this.useCompression = root.UseCompression || false;

		if (this.useCompression) {
			this.compressedAnimRange = root.CompressedRange || (1 << 15) - 1; // int
		}

		// parse channels
		if (root.Channels) {
			var array = root.Channels;
			for ( var i = 0, max = array.length; i < max; i++) {
				var chanObj = array[i];
				var type = chanObj.Type;
				var name = chanObj.Name;
				var times = JsonUtils.parseChannelTimes(chanObj, this.useCompression);
				var channel;
				if ("Joint" === type) {
					var jointName = chanObj.JointName;
					var jointIndex = chanObj.JointIndex;
					var rots = JsonUtils.parseRotationSamples(chanObj, this.compressedAnimRange, this.useCompression);
					var trans = JsonUtils.parseTranslationSamples(chanObj, times.length, this.useCompression);
					var scales = JsonUtils.parseScaleSamples(chanObj, times.length, this.useCompression);
					channel = new JointChannel(jointName, jointIndex, times, rots, trans, scales);
				} else if ("Transform" === type) {
					var rots = JsonUtils.parseRotationSamples(chanObj, this.compressedAnimRange, this.useCompression);
					var trans = JsonUtils.parseTranslationSamples(chanObj, times.length, this.useCompression);
					var scales = JsonUtils.parseScaleSamples(chanObj, times.length, this.useCompression);
					channel = new TransformChannel(name, times, rots, trans, scales);
				} else if ("FloatLERP" === type) {
					channel = new InterpolatedFloatChannel(name, times, JsonUtils.parseFloatLERPValues(chanObj, this.useCompression));
				} else {
					console.warn("Unhandled channel type: " + type);
					continue;
				}
				clip.addChannel(channel);
			}
		}

		return clip;
	};
	*/
	function MaterialInfo () {
		this.materialName = 'not set';
		this.profile = null;
		this.technique = null;
		this.textureReferences = {};
		this.textureFileNames = {};
		this.textureMinificationFilters = {};
		this.textureFlipSettings = {};
		this.usesTransparency = false;
		this.materialState = {};
		this.connectedMeshes = [];
	}

	return JSONImporter;
});