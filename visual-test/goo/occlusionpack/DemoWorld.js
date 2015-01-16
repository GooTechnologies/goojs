define([
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/Camera',
	'goo/scripts/Scripts',
	'goo/entities/components/ScriptComponent',

	'goo/occlusionpack/OccludeeComponent',
	'goo/occlusionpack/OccluderComponent'

], function(
	Box,
	Sphere,
	Material,
	ShaderLib,
	Vector3,
	DirectionalLight,
	Camera,
	Scripts,
	ScriptComponent,

	OccludeeComponent,
	OccluderComponent
) {

'use strict'

/**
* @param world (goo.world)
* 
*/

function DemoWorld(world) {

	var boxSize = 12
	var boxMesh = new Box(boxSize, boxSize * 2, boxSize);

	var sSamples = 32;
	var sRadius = boxSize * 0.2;
	var sphereMesh = new Sphere(sSamples, sSamples, sRadius, Sphere.TextureModes.Polar);

	var material = new Material(ShaderLib.simpleLit);

	var rotationScript = {
		run: function(entity, tpf, context, params) {
			entity.addRotation(0, tpf * 1.2, 0);
		}
	};

	var rows = 20;
	var cols = rows;
	var offset = boxSize * 2.3;
	for (var x = -rows; x < rows; x++) {
		for (var z = -cols; z < cols; z++) {
			var iterationPos = [x * offset, 0, z * offset];
			var box = world.createEntity(boxMesh, material, iterationPos);
			var boxMeshData = box.meshDataComponent.meshData;
			box.setComponent(new OccludeeComponent(boxMeshData, true));
			box.setComponent(new OccluderComponent(boxMeshData));
			box.addToWorld();

			var rotEnt = world.createEntity(iterationPos);

			var sMat = new Material(ShaderLib.simpleColored);
			sMat.uniforms.color = [Math.random(), Math.random(), Math.random()];
			var randR = Math.random() * Math.PI * 2
			var sphereOffset = [boxSize * Math.sin(randR), 0, boxSize * Math.cos(randR)];
			var sphere = world.createEntity(sphereMesh, sMat, sphereOffset);
			rotEnt.attachChild(sphere);
			sphere.setComponent(new OccludeeComponent(sphereMesh, true));
			rotEnt.addToWorld();
			rotEnt.setComponent(new ScriptComponent());
			rotEnt.scriptComponent.scripts.push(rotationScript);
		}
	}

	var sun = world.createEntity(new DirectionalLight(new Vector3(1, 1, 1)), [0, 100, 0]);
	sun.setRotation([-45, 45, 0]);
	sun.addToWorld();

	var camera = new Camera(90, 1, 0.1, 1000);
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	var camEntity = world.createEntity(camera, [0, 0, 10]);
	var scriptComponent = new ScriptComponent();
	
	scriptComponent.scripts.push(Scripts.create('MouseLookScript'));
	scriptComponent.scripts.push(Scripts.create('WASD', {'walkSpeed': 50}));
	camEntity.setComponent(scriptComponent);
	camEntity.addToWorld();

	this.camera = camera;
	this.material = material;

};

return DemoWorld;

});