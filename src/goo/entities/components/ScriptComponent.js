define(['goo/entities/components/Component'],
	/** @lends ScriptComponent */
	function (Component) {
	"use strict";

	/**
	 * @class Contains scripts to be executed each frame when set on an active entity
	 * @param {JS} script Script to contain in this script component
	 */
	function ScriptComponent(script) {
		this.type = 'ScriptComponent';

		this.script = script;
	}

	ScriptComponent.prototype = Object.create(Component.prototype);

	ScriptComponent.prototype.run = function (entity) {
		if (this.script && this.script.run) {
			this.script.run(entity);
		}
	};

	return ScriptComponent;
});