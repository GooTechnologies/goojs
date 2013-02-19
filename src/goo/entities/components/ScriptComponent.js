define(['goo/entities/components/Component'],
/** @lends ScriptComponent */
function(Component) {
	"use strict";

	/**
	 * @class Contains scripts to be executed each frame when set on an active entity
	 * @param {JS} script Script to contain in this script component
	 */
	function ScriptComponent(scripts) {
		this.type = 'ScriptComponent';

		if (scripts instanceof Array) {
			this.scripts = scripts;
		} else if (scripts) {
			this.scripts = [scripts];
		} else {
			this.scripts = [];
		}
	}

	ScriptComponent.prototype = Object.create(Component.prototype);

	ScriptComponent.prototype.run = function(entity) {
		var script;
		for ( var i = 0, max = this.scripts.length; i < max; i++) {
			script = this.scripts[i];
			if (script && script.run && (script.enabled === undefined || script.enabled)) {
				script.run(entity);
			}
		}
	};

	return ScriptComponent;
});