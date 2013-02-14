/* jshint bitwise: false */
define([
		'goo/util/Deferred',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/loaders/Loader'
	],
	/** @lends MaterialLoader */
	function(
		Deferred,
		MeshData,
		Shader,
		TextureCreator,
		Material,
		Loader
	) {
	"use strict";

	/**
	 * Utility class for loading Material objects.
	 *
	 * @constructor
	 * @param {Loader} parameters.loader
	 */
	function MaterialLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('MaterialLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {	
			throw new Error('MaterialLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
	}

	/**
	 * Loads the material at <code>materialPath</code>.
	 *
	 * @param {string} materialPath Relative path to the material.
	 * @return {Promise} The promise is resolved with the loaded Material object.
	 */
	MaterialLoader.prototype.load = function(materialPath) {
		var that = this;
		return this._loader.load(materialPath, function(data) {
			return that._parse(data);
		});
	};

	MaterialLoader.prototype._parse = function(materialDataSource) {
		var deferred = new Deferred();
		var promises = {}; // Keep track of promises
		var shaderDefinition = this._getDefaultShaderDefinition();
		var materialState = this._getDefaultMaterialState();
		var textures = [];

		if(materialDataSource && Object.keys(materialDataSource).length) {
			var value;

			for(var attribute in materialDataSource) {
				value = materialDataSource[attribute];

				if(attribute === 'shader') {
					promises[attribute] = this._loader.load(value);
				} else if(attribute === 'uniforms') {

					for(var i in value) {
						var that = this;
						if(i === 'diffuseTexture') {
							textures.push(new TextureCreator().loadTexture2D(this._loader.projectRoot + value[i]));
						} else if(i === 'shininess') {
							materialState.shininess = value[i];
						} else if(i === 'ambient' || i === 'diffuse' || i === 'emissive' || i === 'specular') {
							if(typeof value[i][0] !== 'undefined' || value[i][0] !== null) { materialState[i].r = value[i][0]; }
							if(typeof value[i][1] !== 'undefined' || value[i][1] !== null) { materialState[i].g = value[i][1]; }
							if(typeof value[i][2] !== 'undefined' || value[i][2] !== null) { materialState[i].b = value[i][2]; }
							if(typeof value[i][3] !== 'undefined' || value[i][3] !== null) { materialState[i].a = value[i][3]; }
						}
					}
				}
			}
		}
		else
		{
			deferred.reject('Couldn\'t load from source: ' + materialDataSource);
		}

		var that = this;
		Deferred.when(promises.shader)
		.done(function(data) {

			that._parseShaderDefinition(data[0])
			.done(function(data) {

				shaderDefinition.vshader = data.vshader;
				shaderDefinition.fshader = data.fshader;

				var material = Material.createMaterial(shaderDefinition);
				
				material.textures = textures;
				material.materialState = materialState;

				deferred.resolve(material);
				
			})
			.fail(function(data) {
				deferred.reject(data);
			});
		
		})
		.fail(function(data) {
			deferred.reject(data);
		});

		return deferred.promise();
	};

	MaterialLoader.prototype._parseShaderDefinition = function(shaderDataSource) {
		var deferred = new Deferred();
		var promises = {};

		if(shaderDataSource && Object.keys(shaderDataSource).length) {
			if(shaderDataSource.vs === null || shaderDataSource.fs === null) {
				deferred.reject('Could not load shader:\n' + shaderDataSource);
			}

			var value;

			for(var attribute in shaderDataSource) {
				value = shaderDataSource[attribute];
				promises[attribute] = this._loader.load(value);
			}
		}
		else
		{
			deferred.reject('Couldn\'t load from source: ' + shaderDataSource);
		}

		Deferred.when(promises.vs, promises.fs)
		.done(function(data) {
			
			if(data.length === 2) {
				// We know that we asked for the vertex shader first and fragment second
				var shaderDefinition = {
					vshader : data[0],
					fshader : data[1]
				};

				deferred.resolve(shaderDefinition);
			} else {
				deferred.reject('Shader pair couldn\'t be loaded.');
			}
		})
		.fail(function(data) {
			deferred.reject(data);
		});

		return deferred.promise();
	};

	MaterialLoader.prototype._getDefaultShaderDefinition = function() {
		return {
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
	};

	MaterialLoader.prototype._getDefaultMaterialState = function() {
		return {
			ambient  : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			diffuse  : { r : 1.0, g : 1.0, b : 1.0, a : 1.0 },
			emissive : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			specular : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			shininess: 16.0
		};
	};

	return MaterialLoader;
});