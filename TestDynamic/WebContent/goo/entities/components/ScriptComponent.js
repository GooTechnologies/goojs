define(['goo/entities/components/Component'], function(Component) {
	"use strict";

	function ScriptComponent(script) {
		this.type = 'ScriptComponent';

		this.script = script;
	}

	ScriptComponent.prototype = Object.create(Component.prototype);

	ScriptComponent.prototype.run = function(entity) {
		if (this.script && this.script.run) {
			this.script.run(entity);
		}
	};

	return ScriptComponent;
});