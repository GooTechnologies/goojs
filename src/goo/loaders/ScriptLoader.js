define([
		'goo/lib/rsvp.amd',
		'goo/loaders/Loader'
	],
	/** @lends ScriptLoader */
	function(
		RSVP,
		Loader
	) {
	"use strict";

	function ScriptLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('ScriptLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('ScriptLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
		this._cache = {};
	}

	ScriptLoader.prototype.load = function (scriptPath, params) {
		if (this._cache[scriptPath]) {
			return this._cache[scriptPath];
		}

		var promise = new RSVP.Promise();
		require([this._loader.rootPath + scriptPath],
			function(ScriptTemplate) {
				var scriptInstance = new ScriptTemplate(params);
				promise.resolve(scriptInstance);
			}
		);
		this._cache[scriptPath] = promise;
		return promise;
	};


	return ScriptLoader;
});