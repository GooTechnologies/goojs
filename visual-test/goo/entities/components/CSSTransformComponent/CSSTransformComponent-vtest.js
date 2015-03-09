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
	var spread = 8.0;
	// var size = 2.5;
	// var box = new Box(size*4, size, size*0.2);
	var size = 1;
	var box = new Box(size, size, size);
	var transform = new Transform();
	transform.translation.z = -box.zExtent;
	transform.update();
	box.applyTransform('POSITION', transform);
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var domElement = document.createElement('div');
				domElement.className = 'object';

				var width = (0.5+V.rng.nextFloat()*3);
				var height = (0.5+V.rng.nextFloat()*3);
				var htmlComponent = new CSSTransformComponent(domElement, {
					width: width,
					height: height
					// backfaceVisibility: 'visible'
				});

				// Make some elements use the faceCamera setting
				htmlComponent.faceCamera = V.rng.nextFloat() > 0.95;
				// htmlComponent.faceCamera = true;
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
				entity.setScale(width, height, 0.5+V.rng.nextFloat()*2);
				// entity.setScale(width, height, 1);
				entity.addToWorld();

				// var script = function (entity) {
					// entity.setScale(Math.sin(world.time)+1, 1, 1);
				// };
				// entity.set(script);

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
