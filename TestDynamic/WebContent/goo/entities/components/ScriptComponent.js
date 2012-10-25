define(function() {
	"use strict";

	function ScriptComponent(script) {
		this.type = 'ScriptComponent';

		this.script = script;
	}

	ScriptComponent.prototype.run = function(entity) {
		if (this.script && this.script.run) {
			this.script.run(entity);
		}
	};

	return ScriptComponent;
});