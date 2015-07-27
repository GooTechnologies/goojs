define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/entities/SystemBus',
	'goo/util/ArrayUtils',
	'goo/util/ObjectUtils',
	'goo/util/rsvp'
], function (
	ConfigHandler,
	SystemBus,
	ArrayUtils,
	_,
	RSVP
) {
	'use strict';

	/**
	 * Handler for loading scene into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function SceneHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SceneHandler.prototype = Object.create(ConfigHandler.prototype);
	SceneHandler.prototype.constructor = SceneHandler;
	ConfigHandler._registerClass('scene', SceneHandler);

	/**
	 * Removes the scene, i e removes all entities in scene from engine world
	 * @param {ref}
	 */
	SceneHandler.prototype._remove = function(ref) {
		//Todo Clear engine
		var scene = this._objects.get(ref);
		if (scene) {
			for (var i = 0; i < scene.entities.length; i++) {
				scene.entities[i].removeFromWorld();
			}
		}
		// Remove posteffects
		// Remove environment

		this._objects.delete(ref);
	};

	/**
	 * Creates an empty scene which will hold some scene data
	 * @returns {Entity}
	 * @private
	 */
	SceneHandler.prototype._create = function() {
		return {
			id: null,
			entities: {},
			posteffects: [],
			environment: null,
			initialCameraRef: null
		};
	};

	/**
	 * Creates/updates/removes a scene
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated scene or null if removed
	 */
	SceneHandler.prototype._update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(scene) {
			if (!scene) { return; }
			scene.id = ref;
			var promises = [];
			promises.push(that._handleEntities(config, scene, options));
			if (config.posteffectsRef) {
				promises.push(that._load(config.posteffectsRef, options));
			}
			if (config.environmentRef) {
				promises.push(that._load(config.environmentRef, options));
			}
			if (!options.scene || !options.scene.dontSetCamera) {
				if (config.initialCameraRef && config.initialCameraRef !== scene.initialCameraRef) {
					promises.push(that._load(config.initialCameraRef, options).then(function(cameraEntity) {
						if (cameraEntity && cameraEntity.cameraComponent) {
							SystemBus.emit('goo.setCurrentCamera', {
								camera: cameraEntity.cameraComponent.camera,
								entity: cameraEntity
							});
						}
						scene.initialCameraRef = config.initialCameraRef;
					}));
				}
			}
			return RSVP.all(promises).then(function() {
				return scene;
			});
		});
	};

	/**
	 * Adding and removing entities to the engine and thereby the scene
	 * @param {Object} config
	 * @param {Object} scene
	 * @param {Object} options
	 */
	SceneHandler.prototype._handleEntities = function(config, scene, options) {
		var that = this;
		var promises = [];

		var addedEntityIds = _.clone(config.entities);
		var removedEntityIds = [];

		for (var id in scene.entities) {
			//var engineEntity = scene.entities[id];
			if (addedEntityIds[id]) {
				delete addedEntityIds[id];
			}
			else {
				removedEntityIds[id] = id;
			}
		}

		_.forEach(config.entities, function(entityConfig) {
			promises.push(that._load(entityConfig.entityRef, options));
		}, null, 'sortValue');

		return RSVP.all(promises).then(function(entities) {
			// Adding new entities
			for (var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				if (addedEntityIds[entity.id]) {
					entity.addToWorld();
				}

				// readding back entities removed by the scripts/fsm
				if (!addedEntityIds[entity.id] &&
					!removedEntityIds[entity.id] &&
					!entity._world.entityManager.containsEntity(entity)) {
					entity.addToWorld();
				}

				scene.entities[entity.id] = entity;
			}

			// Removing old entities from the handler cache
			// Removing them from the world is handled by the EntityHandler
			for (var id in removedEntityIds) {
				delete scene.entities[id];
			}
		});
	};

	/**
	 * Handling posteffects
	 * @param {Object} config
	 * @param {Object} scene
	 * @param {Object} options
	 */
	SceneHandler.prototype._handlePosteffects = function(config, scene, options) {
		return this._load(config.posteffectsRef, options);
	};

	/**
	 * Handling environment, to be implemented
	 * @param {Object} config
	 * @param {Object} scene
	 * @param {Object} options
	 */
	SceneHandler.prototype._handleEnvironment = function(config, scene, options) {
		return this._load(config.environmentRef, options);
	};

	return SceneHandler;

});
