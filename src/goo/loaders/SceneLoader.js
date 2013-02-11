/* jshint bitwise: false */
define([
		'goo/loaders/EntityLoader',

		'goo/util/Promise',
		'goo/util/Ajax'
	],
/** @lends SceneLoader */
function(
		EntityLoader,

		Promise,
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
	function SceneLoader(world, rootUrl) {
		this._rootUrl = rootUrl || '';
		this._world = (typeof world !== "undefined" && world !== null) ? world : null;
	}

	SceneLoader.prototype.setRootUrl = function(rootUrl) {
		if(typeof rootUrl === 'undefined' || rootUrl === null) { return this; }
		this._rootUrl = rootUrl;

		return this;
	};

	SceneLoader.prototype.setWorld = function(world) {
		if(typeof world === "undefined" && world === null) { return this; }
		this._world = world;

		return this;
	};

	SceneLoader.prototype.load = function(sourcePath) {
		var promise = new Promise();
		if(this._world === null) { promise._reject('World was undefined/null'); }
		if(typeof sourcePath === 'undefined' || sourcePath === null) { promise._reject('URL not specified'); }

		var that = this;

		// REVIEW: Unclear. Why do we check the promise's state?
		if(promise._state === 'pending')
		{
			new Ajax({
				url: this._rootUrl + sourcePath // It's gotta be a json object!
			})
			.done(function(request) {
				that._parseScene(that._handleRequest(request), sourcePath)
					.done(function(data) {
						promise._resolve(data);
					})
					.fail(function(data) {
						promise._reject(data);
					});
			})
			.fail(function(data) {
				promise._reject(data.responseText);
			});
		}

		return promise;
	};

	// REVIEW: Can this method name be made clearer? Like `getContentFromRequest` or something?
	SceneLoader.prototype._handleRequest = function(request) {
		var json = null;

		// REVIEW: Why ignore the wrong content-type? Shouldn't that be an error?
		if(request && request.getResponseHeader('Content-Type') === 'application/json')
		{
			try
			{
				json = JSON.parse(request.responseText);
			}
			catch (e)
			{
				console.warn('Couldn\'t load following data to JSON:\n' + request.responseText);
			}
		}

		return json;
	};

	SceneLoader.prototype._parseScene = function(sceneSource, sceneUrl) {
		// REVIEW: One var statement per line. Yes, I know that's is against Crockford style, but this is ugly!
		var promise = new Promise(),
			promises = [],
			that = this;


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
					promises.push(entityLoader.load(sceneUrl + '/' + fileName));
				}
				
			}
		}
		else
		{
			promise._reject('Couldn\'t load from source: ' + sceneSource);
			// REVIEW: This falls through to the "when" below. Is this right?
		}


		// REVIEW: Why call apply with `this`? Is `this` a promise!?
		// Is it supposed to be `Promise.when.apply(promise, promises)`?
		Promise.when.apply(this, promises)
			.done(function(entities) {
				for(var i in entities) { entities[i].addToWorld(); }
				that._world.process();
				promise._resolve(that._world);
			})
			.fail(function(data) {
				promise._reject(data);
			});
		
		return promise;
	};


	return SceneLoader;
});