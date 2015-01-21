define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function (
	ConfigHandler,
	Material,
	MeshData,
	Shader,
	ShaderBuilder,
	RSVP,
	PromiseUtil
) {
	'use strict';

	/**
	 * Handler for loading shaders into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function ShaderHandler() {
		ConfigHandler.apply(this, arguments);
	}

	ShaderHandler.prototype = Object.create(ConfigHandler.prototype);
	ShaderHandler.prototype.constructor = ShaderHandler;
	ConfigHandler._registerClass('shader', ShaderHandler);

	/**
	 * Removes a shader
	 * @param {ref}
	 * @private
	 */
	ShaderHandler.prototype._remove = function (ref) {
		var shader = this._objects.get(ref);
		if (shader && this.world.gooRunner) {
			shader.destroy(this.world.gooRunner.renderer.context);
			this._objects.delete(ref);
		}
	};

	/**
	 * Adds/updates/removes a shader
	 * Currently it is not possible to update a shader, so we create a new one every time
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated shader or null if removed
	 */
	ShaderHandler.prototype._update = function (ref, config, options) {
		if (!config) {
			this._remove(ref);
			return PromiseUtil.resolve();
		}
		if (!config.vshaderRef) {
			return PromiseUtil.reject('Shader error, missing vertex shader ref');
		}
		if (!config.fshaderRef) {
			return PromiseUtil.reject('Shader error, missing fragment shader ref');
		}

		var promises = [
			this.loadObject(config.vshaderRef, options),
			this.loadObject(config.fshaderRef, options)
		];

		return RSVP.all(promises).then(function (shaders) {
			var vshader = shaders[0];
			var fshader = shaders[1];

			if (!vshader) {
				return PromiseUtil.reject('Vertex shader' + config.vshaderRef + 'in shader' + ref + 'not found');
			}
			if (!fshader) {
				return PromiseUtil.reject('Fragment shader' + config.fshaderRef + 'in shader' + ref + 'not found');
			}

			var shaderDefinition = {
				defines: config.defines || {},
				attributes: config.attributes || {},
				uniforms: config.uniforms || {},
				vshader: vshader,
				fshader: fshader
			};

			if (config.processors) {
				shaderDefinition.processors = [];
				for (var i = 0; i < config.processors.length; i++) {
					var processor = config.processors[i];
					if (ShaderBuilder[processor]) {
						shaderDefinition.processors.push(ShaderBuilder[processor].processor);
					} else {
						console.error('Unknown processor ' + processor);
					}
				}
			}

			var shader = Material.createShader(shaderDefinition, ref);

			this._objects.set(ref, shader);

			return shader;
		}.bind(this));
	};

	return ShaderHandler;
});
