define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with a text component
	 */
	function TextSystem() {
		System.call(this, 'TextSystem', ['TextComponent']);
	}

	TextSystem.prototype = Object.create(System.prototype);

	TextSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var textComponent = entities[i].textComponent;
			textComponent.checkUpdate(entities[i], tpf);
		}
	};

	return TextSystem;
});