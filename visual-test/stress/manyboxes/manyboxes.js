require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/systems/System',
	'goo/entities/components/ModifierComponent',
	'goo/entities/components/modifiers/SpinModifier',
	'goo/entities/components/modifiers/OffsetModifier',
	'goo/entities/components/modifiers/BendModifier',
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
	SpinModifier,
	OffsetModifier,
	BendModifier,
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

	entity = world.createEntity([0, 0, 10], new Torus(40, 20, 1, 6), material).addToWorld();
	root.attachChild(entity);

	var count = 30;
	var spread = 1.1;
	for (var i = 0; i < count; i++) {
		entity = world.createEntity(
			[
				(i - count/2) * spread, 
				0, 
				0
			], 
			new Box(1, 1, 1), material).addToWorld();
		root.attachChild(entity);
	}
	for (var i = 0; i < count; i++) {
		entity = world.createEntity(
			[
				0, 
				(i - count/2) * spread, 
				0
			], 
			new Box(1, 1, 1), material).addToWorld();
		root.attachChild(entity);
	}
	for (var i = 0; i < count; i++) {
		entity = world.createEntity(
			[
				0, 
				0,
				(i - count/2) * spread
			], 
			new Box(1, 1, 1), material).addToWorld();
		root.attachChild(entity);
	}

	world.setSystem(new ModifierSystem());

	var spinModifier = new SpinModifier();
	var bendModifier = new BendModifier();
	var offsetModifier = new OffsetModifier();

	var modifierComponent = new ModifierComponent();
	modifierComponent.vertexModifiers.push(spinModifier);
	modifierComponent.vertexModifiers.push(offsetModifier);
	modifierComponent.vertexModifiers.push(bendModifier);

	root.set(modifierComponent);


	var gui = new window.dat.GUI();

	material.uniforms.mods = [0, 0, 0];
	var controller;

	for (var i = 0; i < modifierComponent.vertexModifiers.length; i++) {
		var mod = modifierComponent.vertexModifiers[i];
		var modgui = mod.gui;
		var f1 = gui.addFolder(mod.name);
		for (var j = 0; j < modgui.length; j++) {
			var guipart = modgui[j];

			var key = guipart.key;
			var name = guipart.name;
			var type = guipart.type;
			var limit = guipart.limit;

			var f2 = f1.addFolder(name);
			if (type === 'vec3') {
				var data = {
					x: 0, y: 0, z: 0
				};
				for (var d in data) {
					if (limit) {
						controller = f2.add(data, d, limit[0], limit[1]);
					} else {
						controller = f2.add(data, d);
					}
					(function(d, mod, key, modifierComponent) {
						controller.onChange(function(val) {
							mod[key][d] = val;
							modifierComponent.updateVertexModifiers();
						});
					})(d, mod, key, modifierComponent);
				}
			} else  if (type === 'float') {
				var data = {
					val: 0
				};
				if (limit) {
					controller = f2.add(data, 'val', limit[0], limit[1]);
				} else {
					controller = f2.add(data, 'val');
				}
				(function(mod, key, modifierComponent) {
					controller.onChange(function(val) {
						mod[key] = val;
						modifierComponent.updateVertexModifiers();
					});
				})(mod, key, modifierComponent);
			} else if (type === 'dropdown') {
				var data = {
					type: 'Y'
				};
				controller = f2.add(data, 'type', guipart.choices);
				(function(mod, key, modifierComponent) {
					controller.onChange(function(val) {
						mod[key] = val;
						modifierComponent.updateVertexModifiers();
					});
				})(mod, key, modifierComponent);
			}
		}
	}
});
