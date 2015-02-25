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

	function TextComponent() {
		Component.apply(this, arguments);

		this.type = 'TextComponent';

		this.font = null;
		this.options = {};

		this._entity = null;
	}

	TextComponent.prototype = Object.create(Component.prototype);
	TextComponent.prototype.constructor = TextComponent;

	TextComponent.type = 'TextComponent';

	TextComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	TextComponent.prototype.detached = function (entity) {
		this.entity.clearComponent('MeshDataComponent');
		this.entity = null;
	};

	TextComponent.prototype.setFont = function (font) {
		this.font = font;
	};

	TextComponent.prototype.setText = function (text, options) {
		this.entity.clearComponent('MeshDataComponent');

		// only short texts that can fit in one mesh for now
		var meshData = TextMeshGenerator.meshesForText(text, this.font, options)[0];

		var meshDataComponent = new MeshDataComponent(meshData);
		this.entity.setComponent(meshDataComponent);
	};

	return TextComponent;
});
