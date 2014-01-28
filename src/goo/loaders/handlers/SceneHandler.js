define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/ArrayUtil',
	'goo/util/rsvp',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util'
], function(
	ConfigHandler,
	ArrayUtil,
	RSVP,
	Composer,
	RenderPass,
	FullscreenPass,
	ShaderLib,
	Util
) {
	"use strict";

	/*
	 * @class Handler for loading scene into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function SceneHandler() {
		ConfigHandler.apply(this, arguments);
		this._composer = new Composer();
		var renderSystem = this.world.getSystem('RenderSystem');
		this._renderPass = new RenderPass(renderSystem.renderList),
		this._outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
		this._outPass.renderToScreen = true;
	}

	SceneHandler.prototype = Object.create(ConfigHandler.prototype);
	SceneHandler.prototype.constructor = SceneHandler;
	ConfigHandler._registerClass('scene', SceneHandler);

	/*
	 * Removes the scene, i e removes all entities in scene from engine world
	 * @param {ref}
	 */
	SceneHandler.prototype._remove = function(ref) {
		//Todo Clear engine
		var scene = this._objects[ref];
		if (scene) {
			for (var i = 0; i < scene.entities.length; i++) {
				scene.entities[i].removeFromWorld();
			}
		}
		// Remove posteffects
		// Remove environment

		delete this._objects[ref];
	};

	/*
	 * Creates an empty scene which will hold some scene data
	 * @returns {Entity}
	 * @private
	 */
	SceneHandler.prototype._create = function() {
		return {
			id: null,
			entities: [],
			posteffects: [],
			environment: null
		};
	};

	/*
	 * Creates/updates/removes a scene
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated scene or null if removed
	 */
	SceneHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(scene) {
			scene.id = ref;
			var promises = [];
			promises.push(that._handleEntities(config, scene, options));
			if (config.posteffectsRef) {
				promises.push(that._handlePosteffects(config, scene, options));
			}
			/*if (config.environmentRef) {
				promises.push(that._handleEnvironment(config, scene, options));
			}*/
			return RSVP.all(promises).then(function() {
				return scene;
			});
		});
	};

	/*
	 * Adding and removing entities to the engine and thereby the scene
	 * @param {object} config
	 * @param {object} scene
	 * @param {object} options
	 */
	SceneHandler.prototype._handleEntities = function(config, scene, options) {
		var promises = [];

		for (var key in config.entityRefs) {
			promises.push(this._load(config.entityRefs[key], options));
		}
		return RSVP.all(promises).then(function(entities) {
			// Adding new entities
			for (var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				if (scene.entities.indexOf(entity) === -1) {
					entity.addToWorld();
					scene.entities.push(entity);
				}
			}
			// Removing old entities
			for (var i = 0; i < scene.entities.length; i++) {
				var entity = scene.entities[i];
				if (entities.indexOf(entity) === -1) {
					entity.removeFromWorld();
					ArrayUtil.remove(scene.entities, entity);
				}
			}
		});
	};

	/*
	 * Handling posteffects, to be implemented
	 * @param {object} config
	 * @param {object} scene
	 * @param {object} options
	 */
	SceneHandler.prototype._handlePosteffects = function(config, scene, options) {
		var that = this;
		return this._load(config.posteffectsRef, options).then(function(posteffects) {
			var enabled = posteffects.some(function(effect) { return effect.enabled; });
			var renderSystem = that.world.getSystem('RenderSystem');
			var composer = that._composer;
			// If there are any enabled, add them
			if (enabled) {
				composer.passes = [];
				composer.addPass(that._renderPass);
				for(var i = 0; i < posteffects.length; i++) {
					var posteffect = posteffects[i];
					if (posteffect && posteffect.enabled) {
						composer.addPass(posteffects[i]);
					}
				}
				composer.addPass(that._outPass);
				if (renderSystem.composers.indexOf(composer) === -1) {
					renderSystem.composers.push(composer);
				}
			} else {
				// No posteffects, remove composer
				ArrayUtil.remove(renderSystem.composers, that._composer);
			}
		});
	};

	/*
	 * Handling environment, to be implemented
	 * @param {object} config
	 * @param {object} scene
	 * @param {object} options
	 */
	SceneHandler.prototype._handleEnvironment = function(config, scene, options) {
		return this._load(config.environmentRef, options);
	};

	return SceneHandler;

});
