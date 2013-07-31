define([
	'goo/entities/components/Component',
	'goo/shapes/ShapeCreator'],
/** @lends */
function(
	Component,
	ShapeCreator) {
	"use strict";

	/**
	 * @class Holds the necessary data for a marker
	 * @param {Entity} entity The entity this component is attached to
	 */
	function MarkerComponent(hostEntity) {
		this.type = 'MarkerComponent';

		var hostModelBound = hostEntity.meshDataComponent.modelBound;
		this.meshData = ShapeCreator.createBox(hostModelBound.radius * 2, hostModelBound.radius * 2, hostModelBound.radius * 2);
	}

	MarkerComponent.prototype = Object.create(Component.prototype);

	return MarkerComponent;
});