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

	var entity = world.createEntity([0, 0, 0], new ParticleComponent({
		lifeTime: 3,
		loop: false,
		gravity: new Vector3(0, 0, 0),
		maxParticles: 500,
		duration: 2,
		shapeType: 'cone',
		coneAngle: 0,
		blending: 'AdditiveBlending',
		depthWrite: false,
		emitterRadius: 0,
		startSpeed: 7
	})).addToWorld();
	new TextureCreator().loadTexture2D('../../../resources/flare.png').then(function (texture) {
		entity.particleComponent.texture = texture;
	});
	V.addLights();
	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.process();
});
