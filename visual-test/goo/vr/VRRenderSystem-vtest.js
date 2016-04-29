goo.V.attachToGlobal();

V.describe('VRRenderSystem Test');

var gooRunner = V.initGoo();
var world = gooRunner.world;

var vrRenderSystem = new VRRenderSystem(gooRunner.renderer);
gooRunner.setRenderSystem(vrRenderSystem, 0);


V.addLights();

document.body.addEventListener('keypress', function (e) {
	switch (e.keyCode) {
		case 49:
			vrRenderSystem.setFullScreen(true);
			break;
		case 50:
			GameUtils.toggleFullScreen();
			break;
		case 51:
			break;
	}
});

// camera 1 - spinning
// var cameraEntity = V.addOrbitCamera(new Vector3(25, 0, 0));
// cameraEntity.cameraComponent.camera.setFrustumPerspective(null, null, 1, 10000);

// add camera
var camera = new Camera(undefined, undefined, 1, 1000);
var cameraEntity = world.createEntity(camera, 'CameraEntity').addToWorld();

// camera control set up
var scripts = new ScriptComponent();
var wasdScript = Scripts.create('VRControllerScript', {
});
scripts.scripts.push(wasdScript);
cameraEntity.setComponent(scripts);

var entity = world.createEntity('ParentEntity').addToWorld();
entity.attachChild(cameraEntity);
entity.setTranslation(0, 2, 10);

world.createEntity('Box', new Box(20, 0.1, 20), new Material(ShaderLib.simpleLit)).addToWorld();
world.createEntity('Sphere', new Sphere(8, 8, 1), new Material(ShaderLib.simpleLit)).addToWorld();

V.process();