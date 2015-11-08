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

	new TextureCreator().loadTexture2D('../../../resources/flare.png').then(function (texture) {

		var entity = world.createEntity([0, 0, 0], new ParticleComponent({
			lifeTime: 3,
			loop: false,
			preWarm: false,
			gravity: new Vector3(0, 0, 0),
			maxParticles: 500,
			duration: 2,
			shapeType: 'cone',
			coneAngle: 0,
			blending: 'AdditiveBlending',
			depthWrite: false,
			emitterRadius: 0,
			emissionRate: 10,
			startSpeed: 7,
			textureTilesX: 1,
			textureTilesY: 1
		})).addToWorld();

		entity.particleComponent.texture = texture;
	});
	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});
