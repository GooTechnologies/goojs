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

	V.describe('10 primitives and a long line, drawing the closest hit triangle and the normal');

	var goo = V.initGoo();
	var world = goo.world;
	var raySystem = new RaySystem();
	var LRS = new LineRenderSystem(world);

	world.setSystem(raySystem);
	world.setSystem(LRS);

	V.addOrbitCamera(new Vector3(8, Math.PI / 2, 0));
	//V.addLights();

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var drawTriangle = function(triangle, regularMatrix) {
		var lineStart = tmpVec1.setArray(triangle[0]);
		var lineEnd = tmpVec2.setArray(triangle[1]);
		regularMatrix.applyPostPoint(lineStart);
		regularMatrix.applyPostPoint(lineEnd);
		LRS.drawLine(lineStart, lineEnd, LRS.YELLOW);

		lineEnd = tmpVec2.setArray(triangle[2]);
		regularMatrix.applyPostPoint(lineEnd);
		LRS.drawLine(lineStart, lineEnd, LRS.YELLOW);

		lineStart = tmpVec1.setArray(triangle[1]);
		regularMatrix.applyPostPoint(lineStart);
		LRS.drawLine(lineStart, lineEnd, LRS.YELLOW);
	};

	var drawNormal = function(position, normal) {

	};

	var material1 = new Material('Material1', ShaderLib.uber);
	material1.uniforms.materialAmbient = [0.0, 0.0, 1.0, 1.0];

	for(var i=0;i<10;i++)
	{
		var sphere0 = new Sphere(20, 20);
		var ent = world.createEntity(sphere0, material1, [-1.2, 0, 0]).addToWorld();
		raySystem.addEntity(ent, 4);
	}

	var start = new Vector3(-10,-5,-1);
	var end = new Vector3(10,5.2,1);
	
	var update = function(){

		var height = Math.sin(world.time);
		start.setDirect(-15, height, Math.sin(-world.time));
		end.setDirect(15, height+0.3, Math.sin(world.time));
	
		var hitResult = raySystem.castClosest(start, end, false);

		if(hitResult.hit)
		{
			LRS.drawLine(start, end, LRS.GREEN);

			drawTriangle(hitResult.surfaceObject.triangle, hitResult.surfaceObject.rayObject.regularMatrix);

			var hitLocation = tmpVec1;
			hitResult.getWorldHitLocation(hitLocation);
			var hitNormal = tmpVec2;
			hitResult.surfaceObject.getNormal(hitNormal);

			drawNormal(hitLocation, hitNormal);
		}
		else LRS.drawLine(start, end, LRS.RED);
	};
	
	goo.callbacks.push(update);

	V.process();
});