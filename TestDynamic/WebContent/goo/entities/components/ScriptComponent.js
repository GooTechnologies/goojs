"use strict";

define(function() {
	function ScriptComponent(script) {
		this.type = 'ScriptComponent';

		this.script = script || undefined;
	}

	ScriptComponent.prototype.run = function(entity) {
		if (this.script && this.script.run) {
			this.script.run(entity);
		}
	};

	return ScriptComponent;
});