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
	var sphereEntity = world.createEntity([0, 0, 0], new Sphere(10, 10, 1), new Material(ShaderLib.uber)).addToWorld();

	new TextureCreator().loadTexture2D('../../../resources/flare.png').then(function (texture) {
		setTimeout(function () {
			var entity = world.createEntity([0, 0, 0], new ParticleComponent({
				startSize: 3,
				lifeTime: 1,
				loop: false,
				preWarm: true,
				gravity: new Vector3(0, -20, 0),
				maxParticles: 500,
				duration: 1,
				shapeType: 'sphere',
				coneAngle: 0,
				blending: 'AdditiveBlending',
				depthWrite: false,
				emitterRadius: 0,
				emissionRate: 10,
				startSpeed: 20,
				textureTilesX: 1,
				textureTilesY: 1,
				localSpace: false
			}), function (entity) {
				var x = 10 * Math.cos(world.time * 1);
				var y = 10 * Math.sin(world.time * 1);
				entity.setTranslation(0, y, x);
				sphereEntity.setTranslation(0, y, x);
			}).addToWorld();

			entity.particleComponent.texture = texture;
		}, 500);
	});
	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});
