define([
	'goo/entities/components/Component',
	'goo/entities/components/MeshDataComponent',
	'goo/geometrypack/text/TextMeshGenerator'
], function (
	Component,
	MeshDataComponent,
	TextMeshGenerator
) {
	'use strict';

	function TextComponent(font, options) {
		Component.apply(this, arguments);

		this.type = 'TextComponent';

		this.font = font;

		this._entity = null;
	}

	TextComponent.prototype = Object.create(Component.prototype);
	TextComponent.prototype.constructor = TextComponent;

	TextComponent.type = 'TextComponent';

	TextComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	TextComponent.prototype.detached = function (entity) {
		this.entity = null;
	};

	TextComponent.prototype.setText = function (text) {
		this.entity.clearComponent('MeshDataComponent');

		// only short texts that can fit in one mesh for now
		var meshData = TextMeshGenerator.meshesForText(text, this.font)[0];

		var meshDataComponent = new MeshDataComponent(meshData);
		this.entity.setComponent(meshDataComponent);
	};

	return TextComponent;
});
