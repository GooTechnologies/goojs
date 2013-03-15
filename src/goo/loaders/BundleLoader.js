define([
		'goo/loaders/Loader',
		'goo/lib/rsvp.amd',
		'goo/renderer/util'
	],
	/** @lends BundleLoader */
	function (
		Loader,
		RSVP,
		Util
	) {
	"use strict";
		/**
		 * Loads a bundle of assets at the same load time, and then do the loading from cached bundle
		 *
		 * @constructor
		 */
		function BundleLoader(parameters) {
			Loader.call(this, parameters);
			this._bundle = {};
		}

		BundleLoader.prototype = Object.create(Loader.prototype);

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