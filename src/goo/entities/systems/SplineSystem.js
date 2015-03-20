define([
	'goo/entities/systems/System',
	'goo/math/splines/Spline'
], function (
	System,
	Spline
) {
	'use strict';

	/**
	 * Processes all entities with a spline component<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TextComponent/TextComponent-vtest.html Working example
	 * @extends System
	 */
	function SplineSystem() {
		System.call(this, 'SplineSystem', ['SplineComponent']);
	}

	SplineSystem.prototype = Object.create(System.prototype);
	SplineSystem.prototype.constructor = SplineSystem;

	SplineSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; ++i) {
			var entity = entities[i];
			var splineComponent = entity.splineComponent;
			//if (!splineComponent.dirty) { return; }

			var controlPoints = [];
			entity.traverse(function (child) {
				if (!child.splineControlComponent) { return; }

				controlPoints.push(child.transformComponent.getTranslation().clone());
			});

			spline = new Spline(controlPoints)
			splineComponent.spline = spline;
			splineComponent.meshData = this.getSplineMesh(spline);

			splineComponent.dirty = false;
		}
	};

	SplineSystem.prototype.getSplineMesh = function (spline, numSteps) {
		var cursor = new Vector3();
		var points = [];

		var stepLength = 1 / numSteps;
		for (var i = 0, t = 0; i <= numSteps; ++i, t += stepLength) {
			spline.getPoint(t, cursor);
			points.push(cursor.x, cursor.y, cursor.z);
		}

		return new PolyLine(points);
	};

	return SplineSystem;
});