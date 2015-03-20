require([
	'goo/math/Vector3',
	'goo/entities/components/SplineComponent',
	'goo/entities/components/SplineControlComponent',
	'goo/entities/systems/SplineSystem',
	'goo/entities/systems/SplineDebugRenderSystem',
	'lib/V'
], function (
	Vector3,
	SplineComponent,
	SplineControlComponent,
	SplineSystem,
	SplineDebugRenderSystem,
	V
) {
	'use strict';

	V.describe('Spline component');

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new SplineSystem());
	goo.setRenderSystem(new SplineDebugRenderSystem());

	var splineComponent = new SplineComponent();
	var splineEntity = world.createEntity(splineComponent).addToWorld();

	var splineControlPoints = [
		{
			pos: new Vector3(0, -1, 0),
			rotation: new Vector3(0, 0, 0),
			scale: new Vector3(1, 1, 1)
		},
		{
			pos: new Vector3(0, 0, 0),
			rotation: new Vector3(0, 0, 0),
			scale: new Vector3(1, 1, 1)
		},
		{
			pos: new Vector3(0, 1, 0),
			rotation: new Vector3(0, 0, 0),
			scale: new Vector3(2, 1, 1)
		}
	];

	for (var i = 0; i < splineControlPoints.length; ++i) {
		var controlPoint = splineControlPoints[i];

		var splineControlComponent = new SplineControlComponent();
		splineControlComponent.index = i;

		var splineControlEntity = world.createEntity(splineControlComponent).addToWorld();
		splineControlEntity.setTranslation(controlPoint.pos);
		splineControlEntity.setRotation(controlPoint.rotation);
		splineControlEntity.setScale(controlPoint.scale);

		splineEntity.attachChild(splineControlEntity);
	}

	V.addOrbitCamera(new Vector3(7, Math.PI / 2, 0));
	V.addLights();

	V.process();
});