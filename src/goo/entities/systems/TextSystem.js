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
			//REVIEW: Do the dirty check first is faster i think
			/*
			 * if(textComponent.dirty) {
			 *  textComponent.update(entities[i], tpf);
			 * }
			 */
			textComponent.checkUpdate(entities[i], tpf);
		}
	};

	return TextSystem;
});