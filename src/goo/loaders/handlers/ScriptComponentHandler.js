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
		this._type = 'ScriptComponent';
	}
	ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
	ComponentHandler._registerClass('script', ScriptComponentHandler);

	ScriptComponentHandler.prototype._prepare = function(/*config*/) {};

	ScriptComponentHandler.prototype._create = function() {
		return new ScriptComponent();
	};

	ScriptComponentHandler.prototype.update = function(entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			var promises = [];
			for(var key in config.scriptRefs) {
				promises.push(that._load(config.scriptRefs[key], options));
			}
			return RSVP.all(promises).then(function(scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	return ScriptComponentHandler;
});