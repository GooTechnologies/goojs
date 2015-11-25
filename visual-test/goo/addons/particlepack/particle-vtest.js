require([
	'goo/renderer/Material',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/Quad',
	'goo/shapes/Torus',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/addons/particlepack/systems/ParticleSystem',
	'goo/addons/particlepack/CurveSet',
	'goo/addons/particlepack/LinearCurve',
	'lib/V'
], function (
	Material,
	Sphere,
	Box,
	Cylinder,
	Quad,
	Torus,
	TextureCreator,
	ShaderLib,
	OrbitCamControlScript,
	Vector3,
	ParticleComponent,
	ParticleSystem,
	CurveSet,
	LinearCurve,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new ParticleSystem());
	var sphereEntity = world.createEntity([0, 0, 0], new Sphere(10, 10, 1), new Material(ShaderLib.uber)).addToWorld();

	new TextureCreator().loadTexture2D('../../../resources/check.png').then(function (texture) {
		setTimeout(function () {
			var max = 1000;

			// var debugs = [];
			// for (var i = 0; i < max; i++) {
			// 	debugs.push(world.createEntity([0, 0, 0], new Sphere(10, 10, 0.1), new Material(ShaderLib.uber)).addToWorld());
			// }

			var entity = world.createEntity([0, 0, 0], new ParticleComponent({
				billboard: true,
				startSize: 1,
				startLifeTime: 1,
				loop: true,
				preWarm: true,
				gravity: new Vector3(0, 0, 0),
				maxParticles: max,
				duration: 5,
				shapeType: 'sphere',
				coneAngle: 0,
				//blending: 'AdditiveBlending',
				//depthWrite: false,
				emitterRadius: 1,
				emissionRate: 10,
				startSpeed: 8,
				textureTilesX: 1,
				textureTilesY: 1,
				localSpace: true,
				//mesh: new Box(1, 1, 1, 1/2, 1/2),
				// sizeCurve: new CurveSet([
				// 	new LinearCurve({ k: 2, m: 0 }),
				// 	new LinearCurve({ k: -2, m: 2, timeOffset: 0.5 })
				// ]),
				rotationSpeedCurve: new CurveSet([
					new LinearCurve({ k: 0, m: 0 })
				]),
				startAngle: Math.PI / 4
				//sortMode: ParticleComponent.SORT_CAMERA_DISTANCE
			}), function (entity) {

				var angle = world.time * 2 * Math.PI / 2 * 0;
				var x = 10 * Math.cos(world.time * 2);
				var y = 0 * Math.sin(world.time * 2) * 0;
				entity.setTranslation(0, y, x);
				entity.setRotation(angle, 0, 0);
				sphereEntity.setTranslation(0, y, x);
				sphereEntity.setRotation(angle, 0, 0);

				// debugs.forEach(function (ent, i) {
				// 	entity.particleComponent.particles[i].getWorldPosition(ent.transformComponent.transform.translation);
				// 	ent.transformComponent.transform.update();
				// 	ent.transformComponent.setUpdated();
				// });

			}).addToWorld();

			// setTimeout(function(){
			// 	entity.clearComponent('ParticleComponent');
			// 	entity.clearComponent('ScriptComponent');
			// }, 2000);

			entity.particleComponent.texture = texture;
		}, 500);
	});
	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});
