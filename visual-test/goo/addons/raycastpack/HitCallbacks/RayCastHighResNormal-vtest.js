require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'goo/addons/raycastpack/RaySystem',
	'goo/addons/linerenderpack/LineRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Quad,
	Sphere,
	Vector3,
	MeshData,
	TextureCreator,
	RaySystem,
	LineRenderSystem,
	V
	) {
	'use strict';

	var sphereCount = 50;

	V.describe(sphereCount+' spheres and a long line, drawing a blue normal line for each hit point');

	var goo = V.initGoo();
	var world = goo.world;
	var raySystem = new RaySystem();
	var LRS = new LineRenderSystem(world);
	
	world.setSystem(raySystem);
	world.setSystem(LRS);

	V.addOrbitCamera(new Vector3(8, Math.PI / 2, 0));
	V.addLights();

	var sphereMesh = new Sphere(10, 10);
	var material = new Material('Material', ShaderLib.uber);

	var addSphere = function(nr, total) {
		var ent = world.createEntity(sphereMesh, material, [(nr - total / 2) / (total*0.15), 0, 0]).addToWorld();
		console.log("Add: ", nr);
		raySystem.addEntity(ent, 4);
	};


	for (var i = 0; i < sphereCount; i++) {
		addSphere(i, sphereCount);
	}

	material.uniforms.materialAmbient = [1.0, 0.0, 0.0, 1.0];

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	
	var hitCallback = function(hitResult) {
		var normalEnd = tmpVec1;
		hitResult.surfaceObject.getNormal(normalEnd);

		var hitLocation = hitResult.getWorldHitLocation();
		normalEnd.addVector(hitLocation);
		
		LRS.drawLine(hitLocation, normalEnd, LRS.BLUE);
		
		return true;
	};
	
	var start = new Vector3(-10,-5,-1);
	var end = new Vector3(10,5.2,1);
	
	var update = function(){
	
		start.setDirect(Math.sin(world.time)*3-15, start.y, Math.sin(-world.time));
		end.setDirect(Math.cos(world.time*1.2)*3+15, end.y, Math.sin(world.time));
	
		var hit = raySystem.castCallback(start, end, false,hitCallback).hit;
		if(hit) {
			LRS.drawLine(start, end, LRS.GREEN);
		} else {
			LRS.drawLine(start, end, LRS.RED);
		}
	};
	
	goo.callbacks.push(update);

	V.process();
});