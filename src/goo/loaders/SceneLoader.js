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
	}

	/**
	 * Loads the scene at <code>scenePath</code>.
	 * @example
	 * sceneLoader.load('room.scene').then(function(entities) {
	 *   // handle the {@link Entity|Entity[]} entities
	 * });
	 * @param {string} scenePath Relative path to the scene.
	 * @returns {RSVP.Promise} The promise is resolved with an array of {@link Entity|entities}.
	 */
	SceneLoader.prototype.load = function (scenePath) {
		var that = this;
		return this._loader.load(scenePath, function (data) {
			return that._parse(data, scenePath);
		});
	};

	SceneLoader.prototype._parse = function (sceneSource, scenePath) {
		if (typeof sceneSource === 'string') {
			sceneSource = JSON.parse(sceneSource);
		}
		var promises = [];
		// If we got files, then let's do stuff with the files!
		if (sceneSource && sceneSource.entityRefs && sceneSource.entityRefs.length) {
			var entityLoader = new EntityLoader({
				world: this._world,
				loader: this._loader
			});

			for (var i in sceneSource.entityRefs) {
				// Check if they're entities
				var fileName = sceneSource.entityRefs[i];

				var p = entityLoader.load(fileName);
				promises.push(p);
			}
		}

		if (promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Can\'t find anything to load at ' + scenePath);
			return p;
		}

		this.globals = sceneSource.globals;

		// Create a promise that resolves when all promise-objects
		return RSVP.all(promises)
			.then(function (entities) {
				return entities;
			});
	};

	SceneLoader.prototype._buildWorld = function (entities) {
		for (var i in entities) {
			entities[i].addToWorld();
		}
		this._world.process();
		return this._world;
	};

	return SceneLoader;
});