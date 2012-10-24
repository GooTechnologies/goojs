"use strict";

define(function() {
	function ScriptComponent(script) {
		this.type = 'ScriptComponent';

		// REVIEW: No need for the "|| undefined" part.
		this.script = script || undefined;
	}

	ScriptComponent.prototype.run = function(entity) {
		if (this.script && this.script.run) {
			this.script.run(entity);
		}
	};

	return ScriptComponent;
});