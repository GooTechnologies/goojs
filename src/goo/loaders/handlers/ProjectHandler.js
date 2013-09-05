define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp'
], function(
	ConfigHandler,
	RSVP
) {
	/*jshint eqeqeq: false, -W041 */
	/**
	 * @class
	 * @constructor
	 */
	function ProjectHandler() {
		ConfigHandler.apply(this, arguments);
	}

	ProjectHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('project', ProjectHandler);

	ProjectHandler.prototype._prepare = function(/*config*/) {};

	ProjectHandler.prototype._create = function(/*ref*/) {};

	// Returns a promise which resolves when updating is done
	ProjectHandler.prototype.update = function(ref, config) {
		var that = this;
		var promises = [];
		if (config.sceneRefs != null && config.sceneRefs.length) {

			var handleSceneRef = function(sceneRef) {
				return promises.push(that.getConfig(sceneRef).then(function(sceneConfig) {
					return that.updateObject(sceneRef, sceneConfig, that.options);
				}));
			};

			for (var i = 0; i < config.sceneRefs.length; i++) {
				handleSceneRef(config.sceneRefs[i]);
			}

			return RSVP.all(promises).then(function(scenes) {
				console.log("Loaded " + scenes.length + " scene(s)");
			}).then(null, function(err) {
				return console.error("Error updating scenes: " + err);
			});
		} else {
			console.warn("No scene refs in project " + ref);
			return config;
		}
	};

	ProjectHandler.prototype.remove = function(/*ref*/) {};

	return ProjectHandler;

});
