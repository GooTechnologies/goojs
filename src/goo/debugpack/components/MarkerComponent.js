define([
	'goo/entities/components/Component',
	'goo/debugpack/BoundingVolumeMeshBuilder'],
/** @lends */
function(
	Component,
	BoundingVolumeMeshBuilder) {
	'use strict';

	/**
	 * @class Holds the necessary data for a marker
	 * @param {Entity} entity The entity this component is attached to
	 * @extends Component
	 */
	function MarkerComponent(hostEntity) {
		Component.apply(this, arguments);

		this.type = 'MarkerComponent';

		var hostModelBound = hostEntity.meshRendererComponent.worldBound;
		//this.meshData = ShapeCreator.createBox(hostModelBound.radius * 2, hostModelBound.radius * 2, hostModelBound.radius * 2);
		this.meshData = BoundingVolumeMeshBuilder.build(hostModelBound);
	}

	MarkerComponent.prototype = Object.create(Component.prototype);

	return MarkerComponent;
});