/* global goo */

goo.V.describe('All entities in the scene have an ammo component which updates their transform. Press any key to add entities.');

var resourcePath = '../../../resources';

var Material = goo.Material;
var TextureCreator = goo.TextureCreator;
var AmmoComponent = goo.AmmoComponent;
var AmmoSystem = goo.AmmoSystem;
var Box = goo.Box;
var Quad = goo.Quad;
var Sphere = goo.Sphere;
var PointLight = goo.PointLight;
var Vector3 = goo.Vector3;
var ShaderLib = goo.ShaderLib;

function createEntity(meshData, ammoSettings, pos) {
	var material = new Material(ShaderLib.texturedLit, 'BoxMaterial');
	new TextureCreator().loadTexture2D(resourcePath + '/goo.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});
	return world.createEntity(meshData, material, pos)
		.set(new AmmoComponent(ammoSettings))
		.addToWorld();
}

function addPrimitives() {
	for (var i = 0; i < 20; i++) {
		var x = goo.V.rng.nextFloat() * 16 - 8;
		var y = goo.V.rng.nextFloat() * 16 + 8;
		var z = goo.V.rng.nextFloat() * 16 - 8;
		if (goo.V.rng.nextFloat() < 0.5) {
			createEntity(
				new Box(1 + goo.V.rng.nextFloat() * 2, 1 + goo.V.rng.nextFloat() * 2, 1 + goo.V.rng.nextFloat() * 2),
				{ mass: 1 },
				[x, y, z]
			);
		} else {
			createEntity(
				new Sphere(10, 10, 1 + goo.V.rng.nextFloat()),
				{ mass: 1 },
				[x, y, z]
			);
		}
	}
}

var gooRunner = goo.V.initGoo();
var world = gooRunner.world;
world.setSystem(new AmmoSystem());

goo.V.button('Add Entities', addPrimitives);

addPrimitives();
document.addEventListener('keypress', addPrimitives, false);

createEntity(new Box(5, 5, 5), { mass: 0 }, [0, -7.5, 0]);
createEntity(new Box(20, 10, 1), { mass: 0 }, [0, -5, 10]);
createEntity(new Box(20, 10, 1), { mass: 0 }, [0, -5, -10]);
createEntity(new Box(1, 10, 20), { mass: 0 }, [10, -5, 0]);
createEntity(new Box(1, 10, 20), { mass: 0 }, [-10, -5, 0]);

var planeEntity = createEntity(new Quad(1000, 1000, 100, 100), { mass: 0 }, [0, -10, 0]);
planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);

world.createEntity(new PointLight(), [0, 100, -10], 'light').addToWorld();

goo.V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));

goo.V.process();
