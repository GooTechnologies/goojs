/* jshint bitwise: false */
define([
		'goo/entities/Entity',
		'goo/entities/components/TransformComponent',
		'goo/entities/components/CameraComponent',
		'goo/entities/components/MeshRendererComponent',
		'goo/entities/components/MeshDataComponent',
		'goo/renderer/Camera',
		'goo/renderer/Material',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/loaders/JsonUtils',
		'goo/renderer/TextureCreator',
		'goo/shapes/ShapeCreator',
		'goo/math/Matrix3x3',
		'goo/math/Vector3'
	],
/** @lends EntityLoader */
function(
		Entity,
		TransformComponent,
		CameraComponent,
		MeshRendererComponent,
		MeshDataComponent,
		Camera,
		Material,
		MeshData,
		Shader,
		JsonUtils,
		TextureCreator,
		ShapeCreator,
		Matrix3x3,
		Vector3
	) {
	"use strict";

	/*
	 * Utility functions
	 */
	var verbal = false;
	var say = function(data) { if(verbal) console.log(data); }
	var createWaitCounter = function(callback) {

		if(callback)
		{
			return {
				up : function() {
					this._count++;
					this.check();
				},
				down: function() {
					this._count--;
					this.check();
				},
				check: function() 
				{
					if(this._count<= 0)
					{
						this._callback();
						this._count = 0;
					}
				},
				setCount: function(count) {
					this._count = count;
				},
				_count: 0,
				_callback: callback
			}
		}
		
		console.warn('Callback undefined. Returning null.');
		return null;
	}













	function EntityLoader(world) {
		this.world = world;
	}

	EntityLoader.prototype.loadEntity = function(entityURL, resourceURL, callback) {
		say('EntityLoader.loadEntity(\'' + entityURL + '\', \'' + resourceURL + '\')');

		if(resourceURL == null) { console.warn('EntityLoader: Project URL not specified.'); return; }
		this.resourceURL = resourceURL;

		if(entityURL == null) { console.warn('EntityLoader: Scene URL not specified.'); return; }
		this.entityURL = entityURL + '.json'; // It's gotta be a json object!

		var that = this;
		this._load(this.entityURL,{
			onSuccess: function(data) {
				that._parseEntity(data, function(entity) {
					entity.addToWorld();
					callback(entity);
				});
			},
			onError: function(error) {
				console.warn('Failed to load entity: ' + error);
			}
		});
	};

	EntityLoader.prototype._load = function(urlRelativeToProjectRoot, callback) {
		if(urlRelativeToProjectRoot == null) return;

		var url = this.resourceURL + urlRelativeToProjectRoot;

		var request = new XMLHttpRequest();
		
		request.open('GET', url, true);

		var that = this;
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299)
				{
					callback.onSuccess(that._handleSuccessfulRequest(request));
				}
				else
				{
					callback.onError(request.statusText);
				}
			}
		};
		request.send();
	};

	EntityLoader.prototype._handleSuccessfulRequest = function(request) {
		if(request == null) return;

		var contentType = request.getResponseHeader('Content-Type');
		if(contentType == 'application/json')
		{
			say('Received ' + contentType + ', trying to parse...');
			try {
				var json = JSON.parse(request.responseText);
			} catch (e) {
				console.warn('Couldn\'t load following data to JSON:\n' + request.responseText);
			}
			
			return json;
		}


		say('Received ' + contentType + ', passing through...');
		return request.responseText;
	};

	EntityLoader.prototype._parseEntity = function(entitySource, callback) {
		
		// Array to store loaded components
		var loadedComponents = [];
		var that = this;
		var waitCounter = createWaitCounter(function() {

			var entity = that.world.createEntity();

			for(var i in loadedComponents) entity.setComponent(loadedComponents[i]);
			

			say('Entity loaded:');
			say(entity);
			if(callback) callback(entity);
		});

		if(entitySource.components && Object.keys(entitySource.components).length)
		{
			var component;
			waitCounter.setCount(Object.keys(entitySource.components).length);


			for(var type in entitySource.components || [])
			{
				component = entitySource.components[type];

				if(type == 'transform')
				{
					// Create a transform
					var tc = new TransformComponent();

					tc.transform.translation = new Vector3(component.translation);
					tc.transform.scale		 = new Vector3(component.scale);
					tc.transform.rotation.fromAngles(
														component.rotation[0],
														component.rotation[1],
														component.rotation[2]
													);
					
					
					
					loadedComponents.push(tc);

					waitCounter.down();

				}
				else if(type == 'camera')
				{
					// Create a camera
					var cam = new Camera(
											component.fov != null ? component.fov : 45,
											component.aspect != null ? component.aspect : 1,
											component.near != null ? component.near : 1,
											component.far != null ? component.far : 100
										);
					var cc = new CameraComponent(cam);

					loadedComponents.push(cc);

					waitCounter.down();

				}
				else if(type == 'meshRenderer')
				{
					this._parseMeshRenderer(component, function(meshRenderer) {
						loadedComponents.push(meshRenderer);

						waitCounter.down();

					});
				}
				else if(type == 'meshData')
				{
					this._parseMeshDataComponent(component, function(meshData) {
						loadedComponents.push(meshData);

						waitCounter.down();

					});
				}
			}
		}
	}


	EntityLoader.prototype._parseMeshRenderer = function(meshRendererSource, callback) {
		say('Parsing mesh renderer...');

		// Array to store loaded stuff
		var materials = [];
		var waitCounter = createWaitCounter(function() {

			var meshRenderer = new MeshRendererComponent();

			for(var i in materials)	meshRenderer.materials.push(materials[i]);

			say('MeshRendererComponent loaded:');
			say(meshRenderer);
			if(callback) callback(meshRenderer);
		});

		if(meshRendererSource && Object.keys(meshRendererSource).length)
		{
			var value;
			waitCounter.setCount(Object.keys(meshRendererSource).length);


			var that = this;


			for(var attribute in meshRendererSource)
			{
				value = meshRendererSource[attribute];

				if(attribute == 'materials') for(var i in value)
				{

					this._load(value[i] + '.json', {
						onSuccess: function(data) {
							that._parseMaterial(data, function(material) {
								materials.push(material);

								waitCounter.down();

							});
						},
						onError: function(error) {
							console.warn('Failed to load material: ' + error);
						}
					});
				}
			}
		}
	};

	EntityLoader.prototype._parseMeshDataComponent = function(meshDataComponentSource, callback) {
		say('Parsing mesh data component...');
		
		var meshData;

		var waitCounter = createWaitCounter(function() {

			var meshDataComponent = new MeshDataComponent(meshData);

			say('MeshDataComponent loaded:');
			say(meshDataComponent);
			if(callback) callback(meshDataComponent);
		});

		if(meshDataComponentSource && Object.keys(meshDataComponentSource).length)
		{
			var value;
			waitCounter.setCount(Object.keys(meshDataComponentSource).length);


			var that = this;
			for(var attribute in meshDataComponentSource)
			{
				value = meshDataComponentSource[attribute];

				if(attribute == 'mesh')
				{
					this._load(value + '.json', {
						onSuccess: function(data) {
							
							that.useCompression = data.compressed || false;

							if (that.useCompression) {
								that.compressedVertsRange = data.CompressedVertsRange || (1 << 14) - 1; // int
								that.compressedColorsRange = data.CompressedColorsRange || (1 << 8) - 1; // int
								that.compressedUnitVectorRange = data.CompressedUnitVectorRange || (1 << 10) - 1; // int
							}
							

							meshData = that._parseMeshData(data, 0, 'Mesh');


							waitCounter.down();

						},
						onError: function(error) {
							console.warn('Failed to load mesh data: ' + error);
						}
					});
				}
			}
		}
	};

	EntityLoader.prototype._parseMeshData = function (object, weightsPerVert, type) {
		say('Parsing mesh data...');


		var vertexCount = object.data.VertexCount; // int
		if (vertexCount === 0) {
			return null;
		}
		var indexCount = object.data.IndexLengths ? object.data.IndexLengths[0] : 0;

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
		if (object.data.Weights) {
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
		if (object.data.Joints) {
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


		say('MeshData loaded:');
		say(meshData);

		return meshData;
	};

	EntityLoader.prototype._parseMaterial = function(materialDataSource, callback) {
		say('Parsing material...');

		var shaderDefinition = {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexNormal : MeshData.NORMAL,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				cameraPosition : Shader.CAMERA,
				lightPosition : Shader.LIGHT0,
				diffuseMap : Shader.TEXTURE0,
				materialAmbient : Shader.AMBIENT,
				materialDiffuse : Shader.DIFFUSE,
				materialSpecular : Shader.SPECULAR,
				materialSpecularPower : Shader.SPECULAR_POWER
			}
		};
		var textures = [];
		var materialState = {
								ambient  : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
								diffuse  : { r : 1.0, g : 1.0, b : 1.0, a : 1.0 },
								emissive : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
								specular : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
								shininess: 16.0
							};

		var waitCounter = createWaitCounter(function() {

			var material = Material.createMaterial(shaderDefinition);
			
			material.textures = textures;
			material.materialState = materialState;

			say('Material loaded:');
			say(material);
			if(callback) callback(material);
		});

		if(materialDataSource && Object.keys(materialDataSource).length)
		{
			var value;
			waitCounter.setCount(Object.keys(materialDataSource).length);


			var that = this;


			for(var attribute in materialDataSource)
			{
				value = materialDataSource[attribute];

				if(attribute == 'uniforms')
				{

					for(var i in value)
					{
						if(i == 'diffuseTexture') textures.push(new TextureCreator().loadTexture2D(that.resourceURL + value[i]));
						else if(i == 'shininess') materialState.shininess = value[i];
						else if(i == 'ambient')
						{
							if(value[i][0] != null) materialState.ambient.r = value[i][0];
							if(value[i][1] != null) materialState.ambient.g = value[i][1];
							if(value[i][2] != null) materialState.ambient.b = value[i][2];
							if(value[i][3] != null) materialState.ambient.a = value[i][3];
						}
						else if(i == 'diffuse')
						{
							if(value[i][0] != null) materialState.diffuse.r = value[i][0];
							if(value[i][1] != null) materialState.diffuse.g = value[i][1];
							if(value[i][2] != null) materialState.diffuse.b = value[i][2];
							if(value[i][3] != null) materialState.diffuse.a = value[i][3];
						}
						else if(i == 'emissive')
						{
							if(value[i][0] != null) materialState.emissive.r = value[i][0];
							if(value[i][1] != null) materialState.emissive.g = value[i][1];
							if(value[i][2] != null) materialState.emissive.b = value[i][2];
							if(value[i][3] != null) materialState.emissive.a = value[i][3];
						}
						else if(i == 'specular')
						{
							if(value[i][0] != null) materialState.specular.r = value[i][0];
							if(value[i][1] != null) materialState.specular.g = value[i][1];
							if(value[i][2] != null) materialState.specular.b = value[i][2];
							if(value[i][3] != null) materialState.specular.a = value[i][3];
						}
					}

					waitCounter.down();

				}
				else if(attribute == 'shader')
				{
					this._load(value + '.json', {
						onSuccess: function(data) {
							that._parseShaderDefinition(data, function(sd) {
								shaderDefinition.vshader = sd.vshader;
								shaderDefinition.fshader = sd.fshader;

								waitCounter.down();

							});
						},
						onError: function(error) {
							console.warn('Failed to load material: ' + error);
						}
					});
				}
			}
		}
	};

	EntityLoader.prototype._parseShaderDefinition = function(shaderDataSource, callback) {
		say('Parsing shader...');

		var shaderDefinition = {};

		var waitCounter = createWaitCounter(function() {
			if(!shaderDefinition.vshader || !shaderDefinition.fshader) shaderDefinition = null;

			say('Shader definition loaded:');
			say(shaderDefinition);
			if(callback) callback(shaderDefinition);
		});

		if(shaderDataSource && Object.keys(shaderDataSource).length)
		{
			if(shaderDataSource.vs == null || shaderDataSource.fs == null)
			{
				console.warn('Could not load shader: Vertex or fragment shader missing.');
				return;
			};

			var value;
			waitCounter.setCount(Object.keys(shaderDataSource).length);


			for(var attribute in shaderDataSource)
			{
				value = shaderDataSource[attribute];

				if(attribute == 'vs')
				{
					this._load(value, {
						onSuccess: function(data) {
							shaderDefinition['vshader'] = data;

							waitCounter.down();
						},
						onError: function(error) {
							console.warn('Failed to load vertex shader: ' + error);
							waitCounter.down();
						}
					});
				}
				else if(attribute == 'fs')
				{
					this._load(value, {
						onSuccess: function(data) {
							shaderDefinition['fshader'] = data;
							waitCounter.down();
						},
						onError: function(error) {
							console.warn('Failed to load fragment shader: ' + error);
							waitCounter.down();
						}
					});
				}
			}
		}
	};

	EntityLoader.prototype.toggleVerbal = function(on) {
		if(on == null) {
			verbal = !verbal;
			console.log('EntityLoader is now ' + (verbal ? 'verbal' : 'quiet'));
		}
		else verbal = on;
	};

	return EntityLoader;
});