define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/rsvp',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ConfigHandler,
	Material,
	MeshData,
	Shader,
	ShaderBuilder,
	RSVP,
	_
) {
	"use strict";

	/**
	* @class
	* @private
	*/
	function ShaderHandler() {
		ConfigHandler.apply(this, arguments);
	}

	ShaderHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('shader', ShaderHandler);

	ShaderHandler.prototype._create = function(/*ref*/) {};

	ShaderHandler.prototype.update = function(ref, config) {
		var shaderDefinition;

		// console.log("Updating shader " + ref);
		// Currently not possible to update a shader, so update = create

		if (config != null && config.attributes != null && config.uniforms != null) {
			shaderDefinition = {
				attributes: config.attributes,
				uniforms: config.uniforms
			};
			for (var key in shaderDefinition.uniforms) {
				var uniform = shaderDefinition.uniforms[key];
				if (typeof uniform === 'string') {
					var funcRegexp = /^function\s?\(([^\)]*)\)\s*\{(.*)\}$/;
					var test = uniform.match(funcRegexp);
					if ((test != null ? test.length : void 0) === 3) {
						var args = test[1].replace(' ', '').split(',');
						var body = test[2];

						/* jshint -W054 */
						shaderDefinition.uniforms[key] = new Function(args, body);
					}
				}
			}
			if (config.processors) {
				shaderDefinition.processors = [];
				for (var i = 0; i < config.processors.length; i++) {
					var processor = config.processors[i];
					if (ShaderBuilder[processor]) {
						shaderDefinition.processors.push(ShaderBuilder[processor].processor);
					} else {
						throw new Error("Unknown processor: " + processor);
					}
				}
			}
			if (config.defines) {
				shaderDefinition.defines = config.defines;
			}
		} else {
			shaderDefinition = this._getDefaultShaderDefinition();
		}
		var promises = [this.getConfig(config.vshaderRef), this.getConfig(config.fshaderRef)];
		return RSVP.all(promises).then(function(shaders) {
			var fshader, vshader;
			vshader = shaders[0], fshader = shaders[1];
			if (!vshader) {
				console.warn('Vertex shader', config.vshaderRef, 'in shader', ref, 'not found');
				return;
			}
			if (!fshader) {
				console.warn('Fragment shader', config.fshaderRef, 'in shader', ref, 'not found');
				return;
			}
			_.extend(shaderDefinition, {
				attributes: config.attributes || {},
				uniforms: config.uniforms || {},
				vshader: vshader,
				fshader: fshader
			});
			return Material.createShader(shaderDefinition, ref);
		});
	};

	ShaderHandler.prototype.remove = function(/*ref*/) {};

	ShaderHandler.prototype._getDefaultShaderDefinition = function() {
		return {
			attributes: {
				vertexPosition: MeshData.POSITION,
				vertexNormal: MeshData.NORMAL,
				vertexUV0: MeshData.TEXCOORD0
			},
			uniforms: {
				viewMatrix: Shader.VIEW_MATRIX,
				projectionMatrix: Shader.PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				cameraPosition: Shader.CAMERA,
				lightPosition: Shader.LIGHT0,
				diffuseMap: Shader.DIFFUSE_MAP,
				materialAmbient: Shader.AMBIENT,
				materialDiffuse: Shader.DIFFUSE,
				materialSpecular: Shader.SPECULAR,
				materialSpecularPower: Shader.SPECULAR_POWER
			}
		};
	};

	return ShaderHandler;
});
