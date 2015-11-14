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
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new ParticleSystem());
	var sphereEntity = world.createEntity([0, 0, 0], new Box(2, 2, 2), new Material(ShaderLib.uber)).addToWorld();

	new TextureCreator().loadTexture2D('../../../resources/flare.png').then(function (texture) {
		setTimeout(function () {
			var entity = world.createEntity([0, 0, 0], new ParticleComponent({
				startSize: 1,
				startLifeTime: 1,
				loop: false,
				preWarm: true,
				gravity: new Vector3(0, 0, 0),
				maxParticles: 3000,
				duration: 1,
				shapeType: 'cube',
				coneAngle: 0,
				blending: 'AdditiveBlending',
				depthWrite: false,
				emitterRadius: 2,
				emissionRate: 1000,
				startSpeed: 10,
				textureTilesX: 1,
				textureTilesY: 1,
				localSpace: false
			}), function (entity) {
				var angle = world.time * 2 * Math.PI / 2;
				var x = 2 * Math.cos(world.time * 2);
				var y = 0 * Math.sin(world.time * 2);
				entity.setTranslation(0, y, x);
				entity.setRotation(angle, 0, 0);
				sphereEntity.setTranslation(0, y, x);
				sphereEntity.setRotation(angle, 0, 0);
			}).addToWorld();

			entity.particleComponent.texture = texture;
		}, 500);
	});
	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});
