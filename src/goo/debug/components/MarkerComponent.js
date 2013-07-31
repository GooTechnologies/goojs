define([
	'goo/entities/components/Component',
	'goo/shapes/ShapeCreator'],
/** @lends */
function(
	Component,
	ShapeCreator) {
	"use strict";

	function MarkerComponent(hostEntity) {
		this.type = 'MarkerComponent';

		var hostModelBound = hostEntity.meshDataComponent.modelBound;
		this.meshData = ShapeCreator.createBox(hostModelBound.radius * 2, hostModelBound.radius * 2, hostModelBound.radius * 2);
	}

	MarkerComponent.prototype = Object.create(Component.prototype);

	return MarkerComponent;
});