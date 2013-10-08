define([
	'goo/entities/components/Component',
	'goo/shapes/TextureGrid',
	'goo/entities/components/MeshData'],
/** @lends */
function(
	Component) {
	"use strict";

	function TextComponent(text) {
		Component.call(this, 'TextComponent', false);

		this.text = text || '';
		this.dirty = true;
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