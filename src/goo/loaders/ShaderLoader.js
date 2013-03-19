define([
		'goo/lib/rsvp.amd',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/loaders/Loader'
	],
	/** @lends ShaderLoader */
	function(
		RSVP,
		MeshData,
		Shader,
		Loader
	) {
	"use strict";
	/**
	 * Utility class for lading Shaders
	 *
	 * @constructor
	 * @param {Loader} parameters.loader
	 */
	function ShaderLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('ShaderLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('ShaderLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
		this._cache = {};

	}

	ShaderLoader.prototype.load = function(shaderPath) {
		/*if (this._cache[shaderPath]) {
			return this._cache[shaderPath];
		}*/
		var parse = this._parse.bind(this);
		var promise = this._loader.load(shaderPath, function(data) {
			return parse(data);
		});

		this._cache[shaderPath] = promise;
		return promise;
	};

	ShaderLoader.prototype._parse = function(data) {
		var promises = [];
		if (data && data.attributes && data.uniforms) {
			var shaderDefinition = {
				attributes: data.attributes,
				uniforms: data.uniforms
			};

			for (var key in shaderDefinition.uniforms) {
				var uniform = shaderDefinition.uniforms[key];

				if (typeof uniform === 'string') {
					var funcRegexp = /^function\s?\(([^\)]+)\)\s*\{(.*)}$/;
					var test = uniform.match(funcRegexp);
					if (test && test.length === 3) {
						var args = test[1].replace(' ','').split(',');
						var body = test[2];
						/*jshint -W054 */
						shaderDefinition.uniforms[key] = new Function(args, body);
					}
				}
			}
			if (data.defines) {
				shaderDefinition.defines = data.defines;
			}
		} else {
			var shaderDefinition = this._getDefaultShaderDefinition();
		}

		if(data && data.vshaderRef && data.fshaderRef) {
			var p;

			p = this._loader.load(data.vshaderRef)
			.then(function(vertexShader) {
				return shaderDefinition.vshader = vertexShader;
			});
			promises.push(p);

			p = this._loader.load(data.fshaderRef)
			.then(function(fragmentShader) {
				return shaderDefinition.fshader = fragmentShader;
			});
			promises.push(p);
		}
		if(promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Shader definition `' + data + '` does not seem to contain any shader data.');
			return p;
		}
		return RSVP.all(promises)
		.then(function() {
			return new Shader(data.name, shaderDefinition);
		});

	};

	ShaderLoader.prototype._getDefaultShaderDefinition = function() {
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




	return ShaderLoader;
});


