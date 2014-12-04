require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Torus',
	'goo/math/Vector3'
], function (
	V,
	Material,
	ShaderLib,
	Box,
	Torus,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera(new Vector3(40, Math.PI / 3, Math.PI / 5));
	V.addLights();

	var material = new Material(ShaderLib.uber);

	var entity = world.createEntity([0, 0, 0], new Torus(40, 20, 2, 7), material).addToWorld();
	// var entity = world.createEntity([0, 0, 0], new Box(10, 1, 1), material).addToWorld();

	var gui = new window.dat.GUI();

	var data = {
		x: 0,
		y: 0,
		z: 0,
	};

	material.uniforms.mods = [0, 0, 0];

	var controller = gui.add(data, 'x', -1, 1);
	controller.onChange(function(val) {
		material.uniforms.mods[0] = val;
	});
	controller = gui.add(data, 'y', -1, 1);
	controller.onChange(function(val) {
		material.uniforms.mods[1] = val;
	});
	controller = gui.add(data, 'z', -1, 1);
	controller.onChange(function(val) {
		material.uniforms.mods[2] = val;
	});
});
