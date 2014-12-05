define([
	'goo/entities/systems/System'
],
	/** @lends */
function (
	System
) {
	'use strict';

	function ModifierSystem() {
		System.call(this, 'ModifierSystem', ['TransformComponent', 'ModifierComponent']);
	}

	ModifierSystem.prototype = Object.create(System.prototype);
	ModifierSystem.prototype.constructor = ModifierSystem;

	ModifierSystem.prototype.process = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			var transformComponent = entity.transformComponent;
			var modifierComponent = entity.modifierComponent;

			if (transformComponent._updated) {
				modifierComponent.updateModifiers(entity);
				// modifierComponent.updateValues();
			}
		}
	};

	return ModifierSystem;
});