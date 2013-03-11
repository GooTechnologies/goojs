/* jshint bitwise: false */
define([
		'goo/lib/rsvp.amd',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/loaders/Loader'
	],
	/** @lends MaterialLoader */
	function(
		RSVP,
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
		var that = this;
		var promises = []; // Keep track of promises
		var shaderDefinition = this._getDefaultShaderDefinition();
		var materialState = this._getDefaultMaterialState();
		var textures = [];

		if(materialDataSource) {
			var value;

			value = materialDataSource.shader;
			if(value) {
				var p = this._loader.load(value)
				.then(function(data) {
					return that._parseShaderDefinition(data);
				})
				.then(function(shaderDef) {
					shaderDefinition.vshader = shaderDef.vshader;
					shaderDefinition.fshader = shaderDef.fshader;
					return shaderDefinition;
				});

				promises.push(p);
			}

			value = materialDataSource.uniforms;
			if(value) {
				var that = this;
				var uniform;

				uniform = value.diffuseTexture;
				if(uniform) {
					textures.push(new TextureCreator({
						loader:this._loader
					}).loadTexture2D(uniform));
				}

				uniform = value.shininess;
				if(uniform) {
					materialState.shininess = uniform;
				}

				var setDestinationColor = function(destination, color) {
					if(typeof color[0] !== 'undefined' || color[0] !== null) { destination.r = color[0]; }
					if(typeof color[1] !== 'undefined' || color[1] !== null) { destination.g = color[1]; }
					if(typeof color[2] !== 'undefined' || color[2] !== null) { destination.b = color[2]; }
					if(typeof color[3] !== 'undefined' || color[3] !== null) { destination.a = color[3]; }
				};

				uniform = value.ambient;
				if(uniform) {
					setDestinationColor(materialState.ambient, uniform);
				}

				uniform = value.diffuse;
				if(uniform) {
					setDestinationColor(materialState.diffuse, uniform);
				}

				uniform = value.emissive;
				if(uniform) {
					setDestinationColor(materialState.emissive, uniform);
				}

				uniform = value.specular;
				if(uniform) {
					setDestinationColor(materialState.specular, uniform);
				}

			}
		}

		if(promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Material definition `' + materialDataSource + '` does not seem to contain a shader definition.');
			return p;
		}

		return RSVP.all(promises)
		.then(function() {
			var material = Material.createMaterial(shaderDefinition);

			material.textures = textures;
			material.materialState = materialState;

			return material;
		});
	};

	MaterialLoader.prototype._parseShaderDefinition = function(shaderDataSource) {
		var promises = [];
		var shaderDefinition = {};

		if(shaderDataSource.vs && shaderDataSource.fs) {
			var p;

			p = this._loader.load(shaderDataSource.vs)
			.then(function(vertexShader) {
				return shaderDefinition.vshader = vertexShader;
			});
			promises.push(p);

			p = this._loader.load(shaderDataSource.fs)
			.then(function(fragmentShader) {
				return shaderDefinition.fshader = fragmentShader;
			});
			promises.push(p);
		}

		if(promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Shader definition `' + shaderDataSource + '` does not seem to contain any shader data.');
			return p;
		}

		return RSVP.all(promises)
		.then(function() {
			return shaderDefinition;
		});
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