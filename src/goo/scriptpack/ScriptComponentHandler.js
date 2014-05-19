define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_
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
			_.forEach(config.scripts, function(script) {
				promises.push(that._load(script.scriptRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function(scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	return ScriptComponentHandler;
});