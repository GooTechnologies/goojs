goo.V.attachToGlobal();

V.describe([
	'All entities in the scene hold a p2Component',
	'',
	'Controls:',
	'anykey: add more objects'
].join('\n'));

V.button('anykey', addPrimitives);

function createEntity(meshData, p2Settings, pos, material) {
	material = material || V.getColoredMaterial();

	return world.createEntity(meshData, material, pos)
		.set(new goo.P2Component(p2Settings))
		.addToWorld();
}

var gooRunner = V.initGoo();
var world = gooRunner.world;

var p2System = new goo.P2System();
world.setSystem(p2System);
p2System.physicsWorld.gravity[1] = -20;

function addPrimitives() {
	for (var i = 0; i < 40; i++) {
		var x = V.rng.nextFloat() * 16 - 8;
		var y = V.rng.nextFloat() * 16 + 8;
		var z = V.rng.nextFloat() * 16 - 8;
		if (V.rng.nextFloat() < 0.5) {
			var w = 1 + V.rng.nextFloat() * 2,
				h = 1 + V.rng.nextFloat() * 2;
			createEntity(new goo.Box(w, h, 1 + V.rng.nextFloat() * 2), {
				mass: 1,
				shapes: [{
					type: 'box',
					width: w,
					height: h
				}]
			}, [x, y, z]);
		} else {
			var radius = 1 + V.rng.nextFloat();
			createEntity(new goo.Sphere(10, 10, radius), {
				mass: 1,
				shapes: [{
					type: 'circle',
					radius: radius
				}]
			}, [x, y, z]);
		}
	}
}

addPrimitives();
document.addEventListener('keypress', addPrimitives, false);

createEntity(new goo.Quad(1000, 1000, 100, 100), {
	mass: 0,
	offsetAngleX: -Math.PI / 2,
	shapes: [{
		type: 'plane'
	}]
}, [0, -10, 0], V.getColoredMaterial(0.05, 0.1, 0.2));

V.addLights();

V.addOrbitCamera(new goo.Vector3(40, Math.PI / 2, Math.PI / 4));

V.process();
