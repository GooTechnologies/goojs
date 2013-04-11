define([
		'goo/loaders/Loader',
		'goo/lib/rsvp.amd',
		'goo/renderer/Util'
	],
	/** @lends */
	function (
		Loader,
		RSVP,
		Util
	) {
	"use strict";
		/**
		 * @class Loads a bundle of assets from a bundle-file, and then does the loading from cached bundle.
		 * The {@link BundleLoader} is then passed into the other loaders as parameters.loader
		 * @extends Loader
		 *
		 * @constructor
		 * @desc Creates an instance of {@link BundleLoader}
		 * @param {object} parameters The path of the project root.
		 * Ex. <code>/project/root/</code>.
		 * @param {string} [parameters.rootPath='']
		 * @param {string} [parameters.crossOrigin='anonymous'] Sets the Image.crossOrigin 
		 * of any loaded Image objects.
		 * @param {Ajax} [parameters.xhr]
		 */
		function BundleLoader(parameters) {
			Loader.call(this, parameters);
			this._bundle = {};
		}

		BundleLoader.prototype = Object.create(Loader.prototype);

		/**
		 * Loads a file of asset-bundle. If the file is not in the bundle, it is loaded regularly with ajax
		 * calls. This is used internally in the other loaders.
		 *
		 * @param {string} path The path, to the ref, either url path or defined path in bundle-file
		 * @param {function(object)} parser A parser function to parse the returned json-data 
		 * before promise is resolved.
		 * @param {string} [mode] Currently only supports {@link Loader.ARRAY_BUFFER}, otherwise skip.
		 *
		 * @returns {RSVP.Promise} The promise is resolved with the data loaded. If a parser is specified
		 * the data will be of the type resolved by the parser promise.
		 */
		BundleLoader.prototype.load = function (path, parser, mode) {
			var ref = path.replace('.json','');
			if (this._bundle[ref]) {
				var promise = new RSVP.Promise();
				var data = Util.clone(this._bundle[ref]);
				var p = promise.then(function(data) {
					return (typeof parser === 'function') ? parser(data) : data;
				});
				promise.resolve(data);
				return p;
			}
			return Loader.prototype.load.call(this, path, parser, mode);
		};

		/**
		 * Loads a bundle file of assets. This is later passed as parameter.loader in 
		 * It also start a default animation
		 * @example
		 * bundleLoader.loadBundle('resources/res.bundle').then(function() {
		 *   var sceneLoader = new {@link SceneLoader}({ loader: bundleLoader });
		 *   sceneLoader.load('main.scene').then(function(entities) {
		 *     // handle the entities
		 *   });
		 * });
		 * @param {string} bundlePath The path, relative to loaders root path, where the bundle file is stored
		 */
		BundleLoader.prototype.loadBundle = function (bundlePath) {
			var parse = BundleLoader.prototype._parse.bind(this);
			var promise = Loader.prototype.load.call(this, bundlePath, parse);
			return promise;
		};


		BundleLoader.prototype._parse = function (bundle) {
			this._bundle = bundle;
		};

		return BundleLoader;
	}
);