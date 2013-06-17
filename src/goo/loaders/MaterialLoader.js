/* jshint bitwise: false */
define([
		'goo/util/rsvp',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/loaders/Loader',
		'goo/loaders/ShaderLoader',
		'goo/renderer/shaders/ShaderLib'
	],
	/** @lends */
	function(
		RSVP,
		MeshData,
		Shader,
		TextureCreator,
		Material,
		Loader,
		ShaderLoader,
		ShaderLib
	) {
	"use strict";

	/**
	 * @class Utility class for loading {@link Material} objects.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {Loader} parameters.loader
	 * @param {boolean} parameters.cacheShader Uses same instance of shader for equal shaderRefs. Doesn't work for animated meshes
	 */
	function MaterialLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('MaterialLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('MaterialLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
		this._cache = {};
		this._shaderLoader = new ShaderLoader({ loader: this._loader, doCache: parameters.cacheShader });
		this._waitForTextures = true;
	}

	/**
	 * Loads the material at <code>materialPath</code>.
	 * @example
	 * materialLoader.load('materials/shiny.mat').then(function(material) {
	 *   // handle {@link Material} material
	 * });
	 * @param {string} materialPath Relative path to the material.
	 * @returns {RSVP.Promise} The promise is resolved with the loaded {@link Material} object.
	 */
	MaterialLoader.prototype.load = function(materialPath) {
		if (this._cache[materialPath]) {
			return this._cache[materialPath];
		}

		var that = this;
		var promise = this._loader.load(materialPath, function(data) {
			return that._parse(data);
		}).then(null, function() {
			return Material.createMaterial(ShaderLib.texturedLit, 'DefaultShader');
		});

		this._cache[materialPath] = promise;
		return promise;
	};



	MaterialLoader.prototype._parse = function(materialDataSource) {
		if (typeof materialDataSource === 'string') {
			materialDataSource = JSON.parse(materialDataSource);
		}
		var that = this;
		var promises = []; // Keep track of promises
		var shader;
		var materialState = this._getDefaultMaterialState();
		var materialUniforms = {};
		var textures = [];


		function addTexture(i, texture) {
			if (typeof texture === 'string') {
				texture = JSON.parse(texture);
			}
			var tc = new TextureCreator({loader: that._loader });
			if(that._waitForTextures) {
				var p = new RSVP.Promise();
				textures[i] = tc.loadTexture2D(texture.url, null, function() {
					p.resolve();
				});
				return p;
			} else {
				textures[i] = tc.loadTexture2D(texture.url);
			}
		}

		var name = materialDataSource.name || 'DefaultMaterial';

		if(materialDataSource) {
			var value;
			value = materialDataSource.shaderRef;
			if(value) {
				var p = this._shaderLoader.load(value)
				.then(function(iShader) {
					shader = iShader;
					return shader;
				});

				promises.push(p);
			} else {
				var p = new RSVP.Promise();
				p.then(function(iShader) {
					shader = iShader;
					return shader;
				});
				p.resolve(Material.createShader(ShaderLib.texturedLit, 'DefaultShader'));
				promises.push(p);
			}

			if (materialDataSource.uniforms) {
				for (var key in materialDataSource.uniforms) {
					materialUniforms[key] = materialDataSource.uniforms[key];
				}
			}
			if (materialDataSource.textureRefs && materialDataSource.textureRefs.length) {
				for (var i = 0; i < materialDataSource.textureRefs.length; i++) {
					var pushTexture = addTexture.bind(null,i);
					var p = this._loader.load(materialDataSource.textureRefs[i])
						.then(pushTexture);
					promises.push(p);
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
			var material = new Material(name);
			material.shader = shader;
			material.textures = textures;
			material.materialState = materialState;
			material.uniforms = materialUniforms;
			if (materialDataSource) {
				var override = function(target, source) {
					if (!source) {
						return;
					}
					for (var key in source) {
						target[key] = source[key];
					}
				};
				// Note: The *State settings are not read by Tool yet
				override(material.cullState, materialDataSource.cullState);
				override(material.blendState, materialDataSource.blendState);
				override(material.depthState, materialDataSource.depthState);
				override(material.offsetState, materialDataSource.offsetState);

				if (typeof materialDataSource.renderQueue === 'number') {
					if (materialDataSource.renderQueue > -1) {
						material.renderQueue = materialDataSource.renderQueue;
					}
				}
				if (typeof materialDataSource.wireframe === 'boolean') {
					material.wireframe = materialDataSource.wireframe;
				}
			}
			return material;
		});
	};

	MaterialLoader.prototype._getDefaultMaterialState = function() {
		return {
			ambient  : [0.1, 0.1, 0.1, 1.0],
			emissive : [0, 0, 0, 0],
			diffuse : [1, 1, 1, 1],
			specular : [0.8, 0.8, 0.8, 1.0],
			shininess: 16.0
		};
	};

	return MaterialLoader;
});