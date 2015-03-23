define([
	'goo/math/Vector3',
	'goo/math/splines/Spline',
	'goo/entities/systems/System',
	'goo/geometrypack/PolyLine'
], function (
	Vector3,
	Spline,
	System,
	PolyLine
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

			var controlEntities = [];
			var that = this;
			entity.traverse(function (child) {
				if (child.splineControlComponent) {
					controlEntities.push(child);
				}
			});

			var controlPoints = this.getControlPoints(controlEntities);
			if (controlPoints.length > 2) {
				var spline = new Spline(controlPoints);
				splineComponent.spline = spline;
				splineComponent.meshData = this.getSplineMesh(spline, 10 * controlPoints.length);
			} else {
				splineComponent.spline = null;
				splineComponent.meshData = null;
			}

			splineComponent.dirty = false;
		}
	};

	SplineSystem.prototype.getControlPoints = function (controlEntities) {
		// Sort the entities by the index of their spline control components.
		controlEntities.sort(function (a, b) {
			return a.splineControlComponent.index - b.splineControlComponent.index;
		});

		var points = [];
		var lastIndex = controlEntities.length -1;
		for (var i = 0; i <= lastIndex; ++i) {
			var entity = controlEntities[i];

			var isFirst = i === 0;
			var isLast = i === lastIndex;

			// Update the control points for the spline control entity.
			this.updateControlPoints(entity, isFirst, isLast);

			var component = entity.splineControlComponent;
			if (!isFirst) { points.push(component.beforePoint); }
			points.push(component.centerPoint);
			if (!isLast) { points.push(component.afterPoint); }
		}

		return points;
	};

	SplineSystem.prototype.updateControlPoints = function (entity, isFirst, isLast) {
		var component = entity.splineControlComponent;
		var transform = entity.transformComponent.worldTransform;
		transform.update();

		component.centerPoint = transform.translation.clone();

		var beforePoint = new Vector3(1, 0, 0);
		transform.applyForward(beforePoint, beforePoint);

		var afterPoint = new Vector3(-1, 0, 0);
		transform.applyForward(afterPoint, afterPoint);

		component.beforePoint = isFirst ? null : beforePoint;
		component.afterPoint = isLast ? null : afterPoint;
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