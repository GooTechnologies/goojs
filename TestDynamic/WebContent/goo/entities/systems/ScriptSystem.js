"use strict";

define([ 'goo/entities/systems/System' ], function(System) {
	function ScriptSystem() {
		System.call(this, 'ScriptSystem', [ 'ScriptComponent' ]);
	}

	ScriptSystem.prototype = Object.create(System.prototype);

	ScriptSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var scriptComponent = entities[i].ScriptComponent;
			scriptComponent.run(entities[i]);
		}
	};

	return ScriptSystem;
});