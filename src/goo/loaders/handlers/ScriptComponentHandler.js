define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/ScriptComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',

	'goo/scripts/ScriptUtils',
],
/** @lends */
function(
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_,

	ScriptUtils
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
		return ComponentHandler.prototype.update.call(this, entity, config, options)
		.then(function(component) {
			if (!component) { return; }

			var promises = [];
			_.forEach(config.scripts, function(scriptInstance) {
				promises.push(that._load(scriptInstance.scriptRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function(scripts) {
				component.scripts = scripts;

				// Set the parameters defined in the script instance config in
				// the actual script.
				_.forEach(scripts, function (script) {
					var scriptInstance = config.scripts[script.id];

					// Fill the options in the instance with default values.
					if (script.externals && script.externals.parameters) {
						ScriptUtils.fillDefaultValues(scriptInstance.options, script.externals.parameters);
					}

					_.extend(script.parameters, scriptInstance.options);

					if (scriptInstance.name) {
						script.name = scriptInstance.name;
					}
				});

				return component;
			});
		});
	};


	return ScriptComponentHandler;
});