define([
		'goo/util/rsvp',
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
	 * @example
	 * scriptLoader.load('scripts/OrbitCamControlScript.script').then(function(ScriptTemplate) {
	 *   var scriptComponent = new {@link ScriptComponent}();
	 *   var script = new ScriptTemplate();
	 *   scriptComponent.scripts.push(script);
	 * });
	 * @param {string} scriptPath
	 * @param {object} params To pass in to the script
	 * @returns {RSVP.Promise} The promise is resolved with the loaded Script instance.
	 */
	ScriptLoader.prototype.load = function (scriptPath, params) {
		if (this._cache[scriptPath]) {
			return this._cache[scriptPath].then(function(Script) {
				return new Script(params);
			});
		}

		var parse = this._parse.bind(this);
		var promise = this._loader.load(scriptPath, function(data) {
			return parse(data);
		});

		this._cache[scriptPath] = promise;
		return promise.then(function(Script) {
			return new Script(params);
		});
	};

	ScriptLoader.prototype._parse = function (data) {
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		return this._loadScript(data.jsRef);
	};

	ScriptLoader.prototype._loadScript = function (sourcePath) {
		var p = new RSVP.Promise();
		require([this._loader.rootPath + sourcePath],
			function(Script) {
				p.resolve(Script);
			}
		);
		return p;
	};


	return ScriptLoader;
});