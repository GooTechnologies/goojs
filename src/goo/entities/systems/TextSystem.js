define([
	'goo/entities/systems/System',
	'goo/shapes/TextureGrid',
	'goo/entities/components/MeshData'],
	/** @lends */
	function (
		System,
		TextureGrid,
		MeshDataComponent
	) {
	"use strict";

	/**
	 * @class Processes all entities with a text component
	 */
	function TextSystem() {
		System.call(this, 'TextSystem', ['TextComponent']);
	}

	TextSystem.prototype = Object.create(System.prototype);

	TextSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var textComponent = entity.textComponent;
			if(textComponent.dirty) {
				if(entity.hasComponent('MeshDataComponent')) {
					entity.getComponent('MeshDataComponent').meshData = TextureGrid.fromString(textComponent.text);
				}
				else {
					var meshData = TextureGrid.fromString(textComponent.text);
					var meshDataComponent = new MeshDataComponent(meshData);
					entity.setComponent(meshDataComponent);
				}
				this.dirty = false;
			}
		}
	};

	return TextSystem;
});