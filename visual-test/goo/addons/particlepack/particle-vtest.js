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

	V.describe('The entities in the scene hold a rigidBody component which updates their transform.');

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new ParticleSystem());

	world.createEntity([0,0,0], new ParticleComponent()).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

	V.process();
});
