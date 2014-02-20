define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp'
],
/** @lends */
function(
	ComponentHandler,
	ScriptComponent,
	RSVP
) {
	"use strict";

	/**
	* @class
	* @private
	*/
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
			if (!component) { return; }
			var promises = [];
			for(var key in config.scripts) {
				promises.push(that._load(config.scripts[key].scriptRef, options));
			}
			return RSVP.all(promises).then(function(scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	return ScriptComponentHandler;
});