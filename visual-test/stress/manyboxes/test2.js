require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/systems/System',
	'goo/entities/components/ModifierComponent',
	'goo/entities/components/modifiers/vertex/SpinModifier',
	'goo/entities/components/modifiers/vertex/OffsetModifier',
	'goo/entities/components/modifiers/vertex/ScaleModifier',
	'goo/entities/components/modifiers/vertex/BendModifier',
	'goo/entities/components/modifiers/vertex/NoiseModifier',
	'goo/entities/components/modifiers/vertex/BulgeNoiseModifier',
	'goo/entities/components/modifiers/object/AlignModifier',
	'goo/entities/components/modifiers/object/ObjectBendModifier',
	'goo/entities/components/modifiers/object/ObjectSpinModifier',
	'goo/entities/components/modifiers/object/ObjectNoiseModifier',
	'goo/entities/components/modifiers/object/ObjectScaleModifier',
	'goo/entities/components/modifiers/object/PlaceModifier',
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
	ScaleModifier,
	BendModifier,
	NoiseModifier,
	BulgeNoiseModifier,
	AlignModifier,
	ObjectBendModifier,
	ObjectSpinModifier,
	ObjectNoiseModifier,
	ObjectScaleModifier,
	PlaceModifier,
	ModifierSystem,
	Box,
	Torus,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera(new Vector3(40, 1, 1.3));
	V.addLights();

	var material = new Material(ShaderLib.uber);
	var material2 = new Material(ShaderLib.uber);
	material2.uniforms.materialDiffuse = [1,0,0,1];

	var root = world.createEntity().addToWorld();
	var entity;

	entity = world.createEntity([0, 0, -1], new Torus(40, 20, 1, 6), material).addToWorld();
	root.attachChild(entity);
	entity = world.createEntity([0, 0, 1], new Torus(40, 20, 1, 6), material).addToWorld();
	root.attachChild(entity);
	// entity = world.createEntity([0, 0, 0], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);
	// entity = world.createEntity([0, 0, -5], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);

	var countX = 0;
	var countY = 0;
	var countZ = 0;

	var box = new Box(1, 1, 1);

	var spread = 1.1;
	for (var j = 0; j < 8; j++) {
	for (var i = 0; i < countX; i++) {
		entity = world.createEntity(
			[
				// Math.random()*5, 
				(i - countX/2) * spread, 
				Math.random()*5, 
				Math.random()*5
			], 
			box, Math.random() > 0.5 ? material : material2).addToWorld();
		root.attachChild(entity);
	}
	}
	for (var i = 0; i < countY; i++) {
		entity = world.createEntity(
			[
				0, 
				(i - countY/2) * spread, 
				0
			], 
			box, material).addToWorld();
		root.attachChild(entity);
	}
	for (var i = 0; i < countZ; i++) {
		entity = world.createEntity(
			[
				0, 
				0,
				(i - countZ/2) * spread
			], 
			box, material).addToWorld();
		root.attachChild(entity);
	}

	world.setSystem(new ModifierSystem());

	var modifierComponent = new ModifierComponent();

	modifierComponent.vertexModifiers.push(new ScaleModifier());
	modifierComponent.vertexModifiers.push(new SpinModifier());
	modifierComponent.vertexModifiers.push(new OffsetModifier());
	modifierComponent.vertexModifiers.push(new BendModifier());
	modifierComponent.vertexModifiers.push(new BendModifier());
	modifierComponent.vertexModifiers.push(new NoiseModifier());

	modifierComponent.objectModifiers.push(new PlaceModifier());
	modifierComponent.objectModifiers.push(new AlignModifier());
	modifierComponent.objectModifiers.push(new ObjectScaleModifier());
	modifierComponent.objectModifiers.push(new ObjectSpinModifier());
	modifierComponent.objectModifiers.push(new ObjectBendModifier());
	modifierComponent.objectModifiers.push(new ObjectNoiseModifier());

	root.set(modifierComponent);


	var gui = new window.dat.GUI();

	material.uniforms.mods = [0, 0, 0];
	var controller;

	var names = new Map();

	function addGui(mod, root) {
		var modgui = mod.gui;

		var nr = names.get(mod.name);
		if (nr === undefined) {
			nr = 0;
			names.set(mod.name, nr+1);
		}
		var f1 = root.addFolder(mod.name + '_' + nr);
		for (var j = 0; j < modgui.length; j++) {
			var guipart = modgui[j];

			var key = guipart.key;
			var name = guipart.name;
			var type = guipart.type;
			var limit = guipart.limit;
			var mult = guipart.mult || 1;

			var f2 = f1.addFolder(name);
			if (type === 'vec3') {
				var data = {
					x: mod[key].x, y: mod[key].y, z: mod[key].z
				};
				for (var d in data) {
					if (limit) {
						controller = f2.add(data, d, limit[0], limit[1]);
					} else {
						controller = f2.add(data, d);
					}
					(function(d, mod, key, modifierComponent, mult) {
						controller.onChange(function(val) {
							mod[key][d] = val * mult;
							modifierComponent.update(mod);
						});
					})(d, mod, key, modifierComponent, mult);
				}
			} else if (type === 'ivec3') {
				var data = {
					x: mod[key].x, y: mod[key].y, z: mod[key].z
				};
				for (var d in data) {
					if (limit) {
						controller = f2.add(data, d, limit[0], limit[1]);
					} else {
						controller = f2.add(data, d);
					}
					(function(d, mod, key, modifierComponent, mult) {
						controller.onChange(function(val) {
							mod[key][d] = val * mult;
							modifierComponent.update(mod);
						});
					})(d, mod, key, modifierComponent, mult);
				}
			} else  if (type === 'float') {
				var data = {
					val: mod[key]
				};
				if (limit) {
					controller = f2.add(data, 'val', limit[0], limit[1]);
				} else {
					controller = f2.add(data, 'val');
				}
				(function(mod, key, modifierComponent, mult) {
					controller.onChange(function(val) {
						mod[key] = val * mult;
						modifierComponent.update(mod);
					});
				})(mod, key, modifierComponent, mult);
			} else if (type === 'dropdown') {
				var data = {
					type: 'Y'
				};
				controller = f2.add(data, 'type', guipart.choices);
				(function(mod, key, modifierComponent) {
					controller.onChange(function(val) {
						mod[key] = val;
						modifierComponent.update(mod);
					});
				})(mod, key, modifierComponent);
			}
		}
	}

	var vert = gui.addFolder('Vertex Modifiers');
	for (var i = 0; i < modifierComponent.vertexModifiers.length; i++) {
		var mod = modifierComponent.vertexModifiers[i];
		addGui(mod, vert);
	}

	var obj = gui.addFolder('Object Modifiers');
	for (var i = 0; i < modifierComponent.objectModifiers.length; i++) {
		var mod = modifierComponent.objectModifiers[i];
		addGui(mod, obj);
	}
});
