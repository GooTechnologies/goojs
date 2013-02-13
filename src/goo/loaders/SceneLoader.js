/* jshint bitwise: false */
define([
		'goo/loaders/Loader',
		'goo/loaders/EntityLoader',

		'goo/util/Deferred',
		'goo/util/Ajax'
	],
/** @lends SceneLoader */
function(
		Loader,
		EntityLoader,

		Deferred,
		Ajax
	) {
	"use strict";



	// REVIEW: There's far too much copy/paste between the Loader classes.
	// Constructor, setRootUrl, setWorld, load...
	// Only the parse functions differ.
	//
	// Potential solution #1: Create a Loader superclass. Too complex solution.
	// Inheritance is for polymorphism, not code reuse.
	//
	// Potential solution #2: Put the common functionality into a Loader class
	// that takes the parse function as a constructor parameter. Better decoupling!


	/*
	 *
	 */
	function SceneLoader(parameters) {
		this._loader = new Loader(parameters);
		
		if(typeof parameters.world !== "undefined" && parameters.world !== null) {
			this._world;
		} else {
			throw new Error('SceneLoader(): Argument `parameters.world` was undefined/null');
		}
	}

	SceneLoader.prototype.load = function(scenePath) {
		var deferred = new Deferred();
		var that = this;
		
		this._loader.load(scenePath)
		.done(function(sceneSource) {

			that._parseScene(sceneSource, scenePath)
			.done(function(world) {
				deferred.resolve(world);
			})
			.fail(function(message) {
				deferred.reject(message);
			});

		})
		.fail(function(message) {
			deferred.reject(message);
		});

		return deferred.promise();
	};

	SceneLoader.prototype._parseScene = function(sceneSource, scenePath) {
		var deferred = new Deferred();
		var promises = [];
		var that = this;


		// If we got files, then let's do stuff with the files!
		if(sceneSource && sceneSource.files && sceneSource.files.length)
		{

			var entityLoader = new EntityLoader(this._world, this._rootUrl);

			for(var i in sceneSource.files)
			{
				// Check if they're entities
				var fileName = sceneSource.files[i];
				var match = fileName.match(/.ent.json$/);
				
				if(match !== null)
				{
					promises.push(entityLoader.load(scenePath + '/' + fileName));
				}
				
			}
		}
		else
		{
			deferred.reject('Couldn\'t load from source: ' + sceneSource);
			return deferred.promise();
		}


		// Create an deferred object that resolves when all promise-objects
		// in the `promise` array are resolved (or rejects when _any one_ is rejected) 
		new Deferred().when.apply(null, promises)
			.done(function(entities) {
				for(var i in entities) { entities[i].addToWorld(); }
				that._world.process();
				deferred.resolve(that._world);
			})
			.fail(function(data) {
				deferred.reject(data);
			});
		
		return deferred.promise();
	};


	return SceneLoader;
});