define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil
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
		if (config.entityRefs != null && config.entityRefs.length) {

			var handleEntityRef = function(entityRef) {
				return promises.push(that.getConfig(entityRef).then(function(entityConfig) {
					return that.updateObject(entityRef, entityConfig, that.options);
				}));
			};

			for (var i = 0; i < config.entityRefs.length; i++) {
				handleEntityRef(config.entityRefs[i]);
			}

			return RSVP.all(promises).then(function(entities) {
				for (var j = 0; j < entities.length; j++) {
					var entity = entities[j];
					if (that.options.beforeAdd == null || that.options.beforeAdd.apply == null || that.options.beforeAdd(entity)) {
						console.log("Adding " + entity.name + " to world");
						entity.addToWorld();
					}
				}
			}).then(null, function(err) {
				return console.error("Error updating entities: " + err);
			});
		} else {
			console.warn("No entity refs in project " + ref);
			return PromiseUtil.createDummyPromise(config);
		}
	};

	ProjectHandler.prototype.remove = function(/*ref*/) {};

	return ProjectHandler;

});
