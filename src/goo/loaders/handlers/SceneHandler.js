define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/ArrayUtil',
	'goo/util/rsvp'
], function(
	ConfigHandler,
	ArrayUtil,
	RSVP
) {
	"use strict";

	function SceneHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SceneHandler.prototype = Object.create(ConfigHandler.prototype);
	SceneHandler.prototype.constructor = SceneHandler;
	ConfigHandler._registerClass('scene', SceneHandler);

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
	 * @param {string} ref will be the entity's id
	 * @returns {Entity}
	 * @private
	 */
	SceneHandler.prototype._create = function() {
		return {
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
			var promises = [];
			promises.push(that._handleEntities(config, scene, options));
			if (config.posteffectsRef) {
				promises.push(that._handlePostEffects(config, scene, options));
			}
			if (config.environmentRef) {
				promises.push(that._handleEnvironment(config, scene, options));
			}
			return RSVP.all(promises).then(function() {
				return scene;
			});
		});
	};

	SceneHandler.prototype._handleEntities = function(config, scene, options) {
		var promises = [];

		for (var i = 0; i < config.entityRefs.length; i++) {
			promises.push(this._load(config.entityRefs[i], options));
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

	SceneHandler.prototype._handlePosteffects = function(config, scene, options) {
		var that = this;
		return this._load(config.posteffectsRef).then(function() {
			// Do stuff with the posteffects
		});
	};

	SceneHandler.prototype._handleEnvironment = function(config, scene, options) {
		var that = this;
		return this._load(config.environmentRef).then(function() {
			// Do stuff with environment;
		});
	};

	SceneHandler.prototype.remove = function(/*ref*/) {};

	return SceneHandler;

});
