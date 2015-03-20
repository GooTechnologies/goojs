define([
	'goo/entities/components/Component'
], function (
	Component
) {
	'use strict';

	/**
	 * Makes an entity act as a control point for a spline. This component
	 * should be added to children of entities that contain the SplinComponent.
	 *
	 * @extends Component
	 */
	function SplineControlComponent(text) {
		Component.apply(this, arguments);

		this.type = 'SplineControlComponent';
		this.dirty = true;
		this.index = 0;
		this.beforePoint = null;
		this.centerPoint = null;
		this.afterPoint = null;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	SplineControlComponent.type = 'SplineControlComponent';

	SplineControlComponent.prototype = Object.create(Component.prototype);
	SplineControlComponent.prototype.constructor = SplineControlComponent;

	return SplineControlComponent;
});