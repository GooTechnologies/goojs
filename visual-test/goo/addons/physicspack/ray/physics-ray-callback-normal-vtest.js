require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/addons/linerenderpack/LineRenderSystem',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Quad,
	Sphere,
	Vector3,
	MeshData,
	LineRenderSystem,
	PhysicsSystem,
	V
	) {
	'use strict';

	V.describe('3 primitives and a long line, drawing a blue normal line for each hit point');

	var goo = V.initGoo();
	var world = goo.world;
	var LRS = new LineRenderSystem(world);
	var physicsSystem = new PhysicsSystem();

	world.setSystem(LRS);
	world.setSystem(physicsSystem);

	V.addOrbitCamera(new Vector3(8, Math.PI / 2, 0));
	V.addLights();

	var material1 = new Material('Material1', ShaderLib.uber);
	var sphere0 = new Sphere(20, 20);
	world.createEntity(sphere0, material1, [ -1.2, 0, 0]).addToWorld();

	var material2 = new Material('Material2', ShaderLib.uber);
	var sphere1 = new Box(0.5, 0.5, 0.5);
	world.createEntity(sphere1, material2, [ 0, 0, 0]).addToWorld();

	var material3 = new Material('Material3', ShaderLib.uber);
	var sphere2 = new Sphere(20, 20);
	world.createEntity(sphere2, material3, [1.2, 0, 0]).addToWorld();

	material1.uniforms.materialAmbient = [1.0, 0.0, 0.0, 1.0];
	material2.uniforms.materialAmbient = [0.0, 1.0, 0.0, 1.0];
	material3.uniforms.materialAmbient = [0.0, 0.0, 1.0, 1.0];

	var start = new Vector3(-10,-5,-1);
	var end = new Vector3(10,5.2,1);
	
	var update = function(){
	
		start.setDirect(Math.sin(world.time)*3-15, start.y, Math.sin(-world.time));
		end.setDirect(Math.cos(world.time*1.2)*3+15, end.y, Math.sin(world.time));
	
		var hit = true;
		if(hit)
		{
			LRS.drawLine(start, end, LRS.GREEN);
		}
		else
		{
			LRS.drawLine(start, end, LRS.RED);
		}
	};
	
	goo.callbacks.push(update);

	V.process();
});