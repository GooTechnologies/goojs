require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/systems/System',
	'goo/entities/components/ModifierComponent',
	'goo/entities/systems/ModifierSystem',
	'goo/shapes/Box',
	'goo/shapes/Torus',
	'goo/math/Vector3'
], function (
	V,
	Material,
	ShaderLib,
	System,
	ModifierComponent,
	ModifierSystem,
	Box,
	Torus,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera(new Vector3(70, 1, 1.3));
	V.addLights();

	var material = new Material(ShaderLib.uber);

	var root = world.createEntity().addToWorld();
	var entity;

	// entity = world.createEntity([0, 0, 2], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);

	var count = 20;
	var spread = 1.1;
	for (var i = 0; i < count; i++) {
		entity = world.createEntity([(i - count/2) * spread, 0, 0], new Box(1, 1, 1), material).addToWorld();
		root.attachChild(entity);

		// for (var j = 0; j < 6; j++) {
		// 	var childentity = world.createEntity([0, (j - 3) * spread * 2, -5], new Box(0.5, 0.5, 1), material).addToWorld();
		// 	entity.attachChild(childentity);
		// }
	}

	world.setSystem(new ModifierSystem());

	var modifierComponent = new ModifierComponent();
	root.set(modifierComponent);


	var gui = new window.dat.GUI();

	var data = {
		modifierType: 'Y',
		bend: 0,
		spinx: 0,
		spiny: 0,
		spinz: 0,
		offsetx: 0,
		offsety: 0,
		offsetz: 0,
	};

	material.uniforms.mods = [0, 0, 0];
	var controller;

	controller = gui.add(data, 'modifierType', [ 'X', 'Y', 'Z' ] );
	controller.onChange(function(val) {
		modifierComponent.modifierType = val;
		modifierComponent.updateValues();
	});

	controller = gui.add(data, 'bend', -1, 1);
	controller.onChange(function(val) {
		modifierComponent.bend = val;
		modifierComponent.updateValues();
	});

	controller = gui.add(data, 'spinx', -1, 1);
	controller.onChange(function(val) {
		modifierComponent.spin.x = val;
		modifierComponent.updateValues();
	});
	controller = gui.add(data, 'spiny', -1, 1);
	controller.onChange(function(val) {
		modifierComponent.spin.y = val;
		modifierComponent.updateValues();
	});
	controller = gui.add(data, 'spinz', -1, 1);
	controller.onChange(function(val) {
		modifierComponent.spin.z = val;
		modifierComponent.updateValues();
	});

	controller = gui.add(data, 'offsetx', -10, 10);
	controller.onChange(function(val) {
		modifierComponent.offset.x = val;
		modifierComponent.updateValues();
	});
	controller = gui.add(data, 'offsety', -10, 10);
	controller.onChange(function(val) {
		modifierComponent.offset.y = val;
		modifierComponent.updateValues();
	});
	controller = gui.add(data, 'offsetz', -10, 10);
	controller.onChange(function(val) {
		modifierComponent.offset.z = val;
		modifierComponent.updateValues();
	});

});
