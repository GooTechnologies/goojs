define([
	'goo/entities/components/Component',
	'goo/shapes/TextureGrid',
	'goo/entities/components/MeshDataComponent'],
/** @lends */
function(
	Component,
	TextureGrid,
	MeshDataComponent) {
	"use strict";

	function TextComponent(text) {
		this.type = 'TextComponent';

		this._text = text || '';
		//REVIEW this._dirty
		this.dirty = true;
	}

	TextComponent.prototype = Object.create(Component.prototype);

	TextComponent.prototype.setText = function(text) {
		this._text = text;
		this.dirty = true;
		return this;
	};

	TextComponent.prototype.checkUpdate = function(entity) {
		if(this.dirty) {
			if(entity.hasComponent('MeshDataComponent')) {
				//REVIEW: What if meshData already is TextureGrid? Then you only need to call .setText()
				entity.getComponent('MeshDataComponent').meshData = TextureGrid.fromString(this._text);
			}
			else {
				var meshData = TextureGrid.fromString(this._text);
				var meshDataComponent = new MeshDataComponent(meshData);
				entity.setComponent(meshDataComponent);
			}
			this.dirty = false;
		}
	};

	return TextComponent;
});