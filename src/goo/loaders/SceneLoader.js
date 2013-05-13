/* jshint bitwise: false */
define([
	'goo/loaders/Loader',
	'goo/loaders/EntityLoader',
	'goo/util/rsvp'
],
/** @lends */
function (
	Loader,
	EntityLoader,
	RSVP
) {
	"use strict";

	/**
	 * @class Utility class for loading scenes into a World.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {World} parameters.world The target World object.
	 * @param {Loader} parameters.loader
	 * @param {boolean} parameters.cacheShader Uses same instance of shader for equal shaderRefs. Doesn't work for animated meshes
	 */
	function SceneLoader(parameters) {
		if (typeof parameters === "undefined" || parameters === null) {
			throw new Error('SceneLoader(): Argument `parameters` was undefined/null');
		}

		if (typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('SceneLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		if (typeof parameters.world === "undefined" || parameters.world === null) {
			throw new Error('SceneLoader(): Argument `parameters.world` was undefined/null');
		}

		this._loader = parameters.loader;
		this._world = parameters.world;
		this._cacheShader = parameters.cacheShader;
	}

	/**
	 * Loads the scene with a given ref.
	 * @example
	 * sceneLoader.load('room.scene').then(function(entities) {
	 *   // handle the {@link Entity|Entity[]} entities
	 * });
	 * @param {string} sceneRef Ref of scene to load.
	 * @returns {RSVP.Promise} The promise is resolved with an array of {@link Entity|entities}.
	 */
	SceneLoader.prototype.load = function (sceneRef) {
		var that = this;
		return this._loader.load(sceneRef, function (data) {
			return that._parse(data, sceneRef);
		});
	};

	SceneLoader.prototype._parse = function (sceneConfig) {
		if (typeof sceneConfig === 'string') {
			sceneConfig = JSON.parse(sceneConfig);
		}
		var promises = [];

		if (sceneConfig && sceneConfig.entityRefs && sceneConfig.entityRefs.length) {
			var entityLoader = new EntityLoader({
				world: this._world,
				loader: this._loader,
				cacheShader: this._cacheShader
			});

			for (var i = 0; i < sceneConfig.entityRefs.length; ++i) {
				var entityRef = sceneConfig.entityRefs[i];
				promises.push(entityLoader.load(entityRef));
			}
		}

		// TODO: Create a Scene instance or something instead of changing the SceneLoader
		this.globals = sceneConfig.globals;

		return RSVP.all(promises)
			.then(function (entities) {
				return entities;
			});
	};

	SceneLoader.prototype._buildWorld = function (entities) {
		for (var i = 0; i < entities.length; ++i) {
			entities[i].addToWorld();
		}
		this._world.process();
		return this._world;
	};

	return SceneLoader;
});