require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
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
	DirectionalLight,
	MeshData,
	TextureCreator,
	RaySystem,
	LineRenderSystem,
	V
	) {
	'use strict';

	V.describe('16 primitives and a long line, drawing the closest hit triangle and the normal');

	var goo = V.initGoo();
	var world = goo.world;
	var raySystem = new RaySystem();
	var LRS = new LineRenderSystem(world);

	world.setSystem(raySystem);
	world.setSystem(LRS);

	var camera = V.addOrbitCamera(new Vector3(16, Math.PI / 1.5, 0.3));

	var addDirectionalLight = function(directionArr) {
		var directionalLight = new DirectionalLight();
		directionalLight.intensity = 0.5;
		directionalLight.specularIntensity = 1;
		var directionalLightEntity = world.createEntity(directionalLight, directionArr).addToWorld();
		directionalLightEntity.transformComponent.transform.lookAt(new Vector3(0,0,0), Vector3.UNIT_Y);
	};

	addDirectionalLight([1,1,-1]);
	addDirectionalLight([-1,-1,-1]);

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpVec3 = new Vector3();
	var tmpVec4 = new Vector3();

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
		var lineEnd = tmpVec3.setVector(normal).addVector(position);
		LRS.drawLine(position, lineEnd, LRS.AQUA);
	};

	var drawLineArrow = function (lineStart, lineEnd, frac, color) {
		var lineDir = tmpVec1.setVector(lineEnd).subVector(lineStart);
		var lineLen = lineDir.length();
		lineDir.normalize();

		var arrowStartPosition = tmpVec2.setVector(lineDir).mul(lineLen*frac).addVector(lineStart);
		var arrowEndPosition = tmpVec3.setVector(lineDir).mul(-0.1).addVector(arrowStartPosition);

		var arrowUpDir = tmpVec4.setVector(Vector3.UNIT_Y).mul(0.1);
		arrowUpDir.addVector(arrowEndPosition);

		LRS.drawLine(arrowStartPosition, arrowUpDir, color);

		var arrowDownDir = arrowUpDir.subVector(arrowEndPosition);
		arrowUpDir.mul(-1);
		arrowUpDir.addVector(arrowEndPosition);

		LRS.drawLine(arrowStartPosition, arrowDownDir, color);
	};

	var drawArrowedLine = function (start, end, time, color) {
		var fracAdd = (time * 0.1) % 0.1;
		for (var i = 0; i < 10; i++) {
			var frac = i * 0.1 + fracAdd;
			drawLineArrow(start, end, frac, color);
		}
		LRS.drawLine(start, end, color);
	};

	var material1 = new Material('Material1', ShaderLib.uber);
	material1.uniforms.materialAmbient = [0.0, 0.0, 1.0, 1.0];
	material1.uniforms.materialEmissive = [0.0, 0.0, 1.0, 1.0];

	for(var i=-8;i<8;i++)
	{
		var sphere0 = new Sphere(20, 20);
		var ent = world.createEntity(sphere0, material1, [1.2*i, (0.5-Math.random())*2, (0.5-Math.random())*2]).addToWorld();
		raySystem.addEntity(ent, 4);
	}

	var start = new Vector3(-10,-5,-1);
	var end = new Vector3(10,5.2,1);

	var hitCallback = function(hitResult){
		drawTriangle(hitResult.surfaceObject.triangle, hitResult.surfaceObject.rayObject.regularMatrix);

		var hitLocation = tmpVec1;
		hitResult.getWorldHitLocation(hitLocation);
		var hitNormal = tmpVec2;
		hitResult.surfaceObject.getNormal(hitNormal);

		drawNormal(hitLocation, hitNormal);

		return true;
	};

	var update = function() {

		var height = Math.cos(world.time)*0.5;
		start.setDirect(-15, height, Math.sin(-world.time) * 0.5);
		end.setDirect(15, height, Math.sin(world.time) * 0.5);

		var hitResult = raySystem.castClosest(start, end, false);

		var color = LRS.GREEN;
		if (hitResult.hit) {
			hitCallback(hitResult);
		}
		else
		{
			color = LRS.RED;
		}


		drawArrowedLine(start, end, world.time, color);
	};

	
	goo.callbacks.push(update);

	V.process();
});