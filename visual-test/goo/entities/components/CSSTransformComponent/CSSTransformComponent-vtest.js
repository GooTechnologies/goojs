require([
	'goo/renderer/Camera',
	'goo/entities/components/CSSTransformComponent',
	'goo/entities/systems/CSSTransformSystem',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/Transform',
	'lib/V'
], function (
	Camera,
	CSSTransformComponent,
	CSSTransformSystem,
	Material,
	ShaderLib,
	Box,
	Vector3,
	Transform,
	V
	) {
	'use strict';

	V.describe('Testing the matching of CSS3D transformed DOM elements to our entities');

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera(new Vector3(100, Math.PI/1.5, Math.PI/8));

	world.setSystem(new CSSTransformSystem(goo.renderer));

	var material = new Material(ShaderLib.uber);

	var numBoxes = 5;
	var size = 2.5;
	var spread = 8.0;
	var box = new Box(size*4, size, size*0.2);
	var transform = new Transform();
	transform.translation.z = -box.zExtent;
	transform.update();
	box.applyTransform('POSITION', transform);
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var domElement = document.createElement('div');
				domElement.className = 'object';

				var htmlComponent = new CSSTransformComponent(domElement);
				htmlComponent.scale = 0.1;
				htmlComponent.faceCamera = V.rng.nextFloat() > 0.95;

				if (htmlComponent.faceCamera) {
					domElement.innerHTML = '<div>Goo_FaceCam</div>';
				} else {
					domElement.innerHTML = '<div>Goo_'+i+'_'+j+'_'+k+'</div>';
				}

				var position = [
					size * (i - numBoxes / 2) * spread,
					size * (j - numBoxes / 2) * spread,
					size * (k - numBoxes / 2) * spread
				];
				var entity = world.createEntity(position, box, material, htmlComponent);
				entity.addToWorld();

				if (V.rng.nextFloat() > 0.7) {
					var r1 = V.rng.nextFloat();
					var r2 = V.rng.nextFloat();
					(function(r1, r2) {
						var script = function (entity) {
							entity.setRotation(world.time * r1, world.time * r2, 0);
						};
						entity.set(script);
					})(r1, r2);
				}
			}
		}
	}

	V.process();
});
