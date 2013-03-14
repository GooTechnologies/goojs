/* jshint bitwise: false */
define([
		'goo/loaders/Loader',
		'goo/loaders/EntityLoader',

		'goo/lib/rsvp.amd'
	],
/** @lends SceneLoader */
function(
		Loader,
		EntityLoader,
		RSVP
	) {
	"use strict";


	/**
	 * Utility class for loading scenes into a World.
	 *
	 * @constructor
	 * @param {World} parameters.world The target World object.
	 * @param {Loader} parameters.loader
	 */
	function SceneLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('SceneLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('SceneLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		if(typeof parameters.world === "undefined" || parameters.world === null) {
			throw new Error('SceneLoader(): Argument `parameters.world` was undefined/null');
		}

		this._loader = parameters.loader;
		this._world = parameters.world;
	}

	/**
	 * Loads the scene at <code>scenePath</code>.
	 *
	 * @param {string} scenePath Relative path to the scene.
	 * @return {Promise} The promise is resolved with the target World object.
	 */
	SceneLoader.prototype.load = function(scenePath) {
		var that = this;
		return this._loader.load(scenePath, function(data) {
			return that._parse(data, scenePath);
		});
	};

	SceneLoader.prototype._parse = function(sceneSource, scenePath) {
		var promises = [];

		// If we got files, then let's do stuff with the files!
		if(sceneSource && sceneSource.files && sceneSource.files.length)
		{
			var entityLoader = new EntityLoader({
				world: this._world,
				loader: this._loader
			});

			for(var i in sceneSource.files) {
				// Check if they're entities
				var fileName = sceneSource.files[i];

				if(/\.ent$/.test(fileName)) {
					var p = entityLoader.load(fileName);
					promises.push(p);
				}
			}
		}

		if(promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Can\'t find anything to load at ' + scenePath);
			return p;
		}

		// Create a promise that resolves when all promise-objects
		return RSVP.all(promises)
		.then(function(entities) {
			return entities;
		});
	};

	SceneLoader.prototype._buildWorld = function(entities) {
		for(var i in entities) {
			entities[i].addToWorld();
		}
		this._world.process();
		return this._world;
	};

	return SceneLoader;
});