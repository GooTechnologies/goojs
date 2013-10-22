define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function(
	ComponentHandler,
	ScriptComponent,
	RSVP,
	PromiseUtil
) {
	"use strict";

	function ScriptComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}
	ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
	ComponentHandler._registerClass('script', ScriptComponentHandler);

	ScriptComponentHandler.prototype._prepare = function(/*config*/) {};

	ScriptComponentHandler.prototype._create = function(entity/*, config*/) {
		var component = new ScriptComponent();
		entity.setComponent(component);
		return component;
	};


	ScriptComponentHandler.prototype.update = function(entity, config) {
		var that = this, promises = [];
		function update(ref) {
			return that.getConfig(ref).then(function(config) {
				return that.updateObject(ref,config);
			});
		}
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		if (config.scriptRefs && config.scriptRefs.length) {
			var refs = config.scriptRefs;
			for (var i = 0; i < refs.length; i++) {
				promises.push(update(refs[i]));
			}
		}

		if (promises.length > 0) {
			return RSVP.all(promises).then(function(scripts) {
				if(!scripts[0]) {
					component.scripts = [];
				} else {
					component.scripts = scripts;
				}
			});
		}
		else {
			return PromiseUtil.createDummyPromise(component);
		}
	};

	return ScriptComponentHandler;
});