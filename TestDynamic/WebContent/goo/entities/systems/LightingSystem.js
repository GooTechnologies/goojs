"use strict";

define([ 'goo/entities/systems/System' ], function(System) {
	function LightingSystem() {
		System.call(this, 'LightingSystem', [ 'LightComponent' ]);
	}

	LightingSystem.prototype = Object.create(System.prototype);

	LightingSystem.prototype.process = function(entities) {
		for ( var i in entities) {
		}
	};

	return LightingSystem;
});