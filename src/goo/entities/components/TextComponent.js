define([
	'goo/entities/components/Component',
	'goo/shapes/TextureGrid',
	'goo/entities/components/MeshDataComponent'],
/** @lends */
function(
	Component) {
	"use strict";

	function TextComponent(text) {
		Component.call( this );
		this.type = 'TextComponent';

		this.text = text || '';
		this.dirty = true;

		this.api = {
			'textComponent': this
		};
	}

	TextComponent.prototype = Object.create(Component.prototype);

	/**
	 * Text to update to
	 * @param {String} text
	 * @returns {TextComponent} Self for chaining
	 */
	TextComponent.prototype.setText = function(text) {
		this.text = text;
		this.dirty = true;
		return this;
	};

	return TextComponent;
});