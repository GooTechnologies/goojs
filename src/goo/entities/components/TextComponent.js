var Component = require('../../entities/components/Component');
var TextureGrid = require('../../shapes/TextureGrid');
var MeshDataComponent = require('../../entities/components/MeshDataComponent');

/**
 * Provides ways for the entity to display text
 * @extends Component
 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TextComponent/TextComponent-vtest.html Working example
 */
function TextComponent(text) {
	Component.apply(this, arguments);

	this.type = 'TextComponent';

	this.text = text || '';
	this.dirty = true;

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

TextComponent.type = 'TextComponent';

TextComponent.prototype = Object.create(Component.prototype);
TextComponent.prototype.constructor = TextComponent;

/**
 * Text to update to
 * @param {string} text
 * @returns {TextComponent} Self for chaining
 */
TextComponent.prototype.setText = function (text) {
	this.text = text;
	this.dirty = true;
	return this;
};

module.exports = TextComponent;