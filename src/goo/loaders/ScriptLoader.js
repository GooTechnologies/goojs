define([
		'goo/lib/rsvp.amd',
		'goo/loaders/Loader'
	],
	/** @lends */
	function(
		RSVP,
		Loader
	) {
	"use strict";

	/**
	 * @class Utility class for loading Scripts.
	 *
	 * @constructor
	 * @param {object} parameters
	 * @param {Loader} parameters.loader
	 */
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
	/**
	 * Loads the script at <code>scriptPath</code>
	 * @param {string} scriptPath
	 */
	ScriptLoader.prototype.load = function (scriptPath) {
		if (this._cache[scriptPath]) {
			return this._cache[scriptPath];
		}

		var promise = new RSVP.Promise();
		require([this._loader.rootPath + scriptPath],
			function(ScriptTemplate) {
				promise.resolve(ScriptTemplate);
			}
		);
		this._cache[scriptPath] = promise;
		return promise;
	};


	return ScriptLoader;
});