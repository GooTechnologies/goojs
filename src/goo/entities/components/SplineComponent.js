define([
	'goo/entities/components/Component',
	'goo/math/splines/Spline'
], function (
	Component,
	Spline
) {
	'use strict';

	/**
	 * Provides ways for the entity to represent a spline in 3D space.
	 * @extends Component
	 */
	function SplineComponent(text) {
		Component.apply(this, arguments);

		this.spline = new Spline([]);
		this.type = 'SplineComponent';
		this.dirty = true;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	SplineComponent.type = 'SplineComponent';

	SplineComponent.prototype = Object.create(Component.prototype);
	SplineComponent.prototype.constructor = SplineComponent;

	return SplineComponent;
});