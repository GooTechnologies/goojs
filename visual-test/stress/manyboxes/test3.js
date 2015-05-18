require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util',
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
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/MathUtils',
	'goo/geometrypack/Surface',
	'goo/math/Vector3'
], function (
	V,
	Material,
	ShaderLib,
	Util,
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
	Sphere,
	Torus,
	MathUtils,
	Surface,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera(new Vector3(70, 1, 1.3));
	V.addLights();

	var material = new Material(ShaderLib.uber);
	var material2 = new Material(ShaderLib.uber);
	material2.uniforms.materialDiffuse = [1,0,0,1];

	var root = world.createEntity().addToWorld();
	var entity;

	var torus = new Torus(16, 12, 1, 6);
	entity = world.createEntity([0, 0, 0], torus, material).addToWorld();
	root.attachChild(entity);
	// entity = world.createEntity([0, 0, 5], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);
	// entity = world.createEntity([0, 0, 0], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);
	// entity = world.createEntity([0, 0, -5], new Torus(40, 20, 1, 6), material).addToWorld();
	// root.attachChild(entity);

	var box = new Box(5, 5, 5);
	entity = world.createEntity(
		[0,0,0], 
		box, material2).addToWorld();
	root.attachChild(entity);

	// function getHeightMap(nLin, nCol) {
	// 	var matrix = [];
	// 	for (var i = 0; i < nLin; i++) {
	// 		matrix.push([]);
	// 		for (var j = 0; j < nCol; j++) {
	// 			var value =
	// 				Math.sin(i * 0.3) +
	// 				Math.cos(j * 0.3) +
	// 				Math.sin(Math.sqrt(i*i + j*j) * 0.7) * 2;
	// 			matrix[i].push(value);
	// 		}
	// 	}
	// 	return matrix;
	// }

	// var heightMapSize = 64;

	// var matrix = getHeightMap(heightMapSize, heightMapSize);
	// var cool = Surface.createFromHeightMap(matrix);
	// var entity = world.createEntity([0, 0, 0], cool, material).addToWorld();

	var sphere = new Sphere(8, 8, 0.2);
	var box2 = new Box(0.2, 1, 0.2);

	// var positionStore = new Vector3();
	// var normalStore = new Vector3();
	// var vec = new Vector3();
	// for (var i = 0; i < 200; i++) {
	// 	Util.getRandomSurfacePosition(box, positionStore, normalStore);

	// 	var entity = world.createEntity([positionStore.x, positionStore.y, positionStore.z], box2, material).addToWorld();
	// 	vec.setVector(Vector3.ZERO);
	// 	while (vec.lengthSquared() < MathUtils.EPSILON) {
	// 		vec.setDirect(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).cross(normalStore);
	// 	}
	// 	entity.transformComponent.transform.rotation.lookAt(vec, normalStore);
	// 	entity.transformComponent.setUpdated();
	// }
	
	// for (var i = 0; i < 200; i++) {
	// 	Util.getRandomSurfacePosition(cool, positionStore, normalStore);

	// 	var entity = world.createEntity([positionStore.x, positionStore.y, positionStore.z], box2, material).addToWorld();
	// 	vec.setVector(Vector3.ZERO);
	// 	while (vec.lengthSquared() < MathUtils.EPSILON) {
	// 		vec.setDirect(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).cross(normalStore);
	// 	}
	// 	entity.transformComponent.transform.rotation.lookAt(vec, normalStore);
	// 	entity.transformComponent.setUpdated();
	// }
	// for (var i = 0; i < 200; i++) {
	// 	Util.getRandomSurfacePosition(torus, positionStore, normalStore);

	// 	var entity = world.createEntity([positionStore.x, positionStore.y, positionStore.z], box2, material).addToWorld();
	// 	vec.setVector(Vector3.ZERO);
	// 	while (vec.lengthSquared() < MathUtils.EPSILON) {
	// 		vec.setDirect(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).cross(normalStore);
	// 	}
	// 	entity.transformComponent.transform.rotation.lookAt(vec, normalStore);
	// 	entity.transformComponent.setUpdated();
	// }

	world.setSystem(new ModifierSystem());

	var modifierComponent = new ModifierComponent();

	modifierComponent.objectModifiers.push(new ObjectScaleModifier());
	modifierComponent.objectModifiers.push(new PlaceModifier());
	modifierComponent.objectModifiers.push(new AlignModifier());
	modifierComponent.objectModifiers.push(new ObjectScaleModifier());
	modifierComponent.objectModifiers.push(new ObjectSpinModifier());
	modifierComponent.objectModifiers.push(new ObjectBendModifier());
	modifierComponent.objectModifiers.push(new ObjectNoiseModifier());

	root.set(modifierComponent);


	var gui = new window.dat.GUI();

	var s = {
		clone: 1
	};
	var shit = gui.add(s, 'clone');
	shit.onChange(function(val) {
		modifierComponent.clone(root, val);
	});

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

	var obj = gui.addFolder('Object Modifiers');
	for (var i = 0; i < modifierComponent.objectModifiers.length; i++) {
		var mod = modifierComponent.objectModifiers[i];
		addGui(mod, obj);
	}
});
