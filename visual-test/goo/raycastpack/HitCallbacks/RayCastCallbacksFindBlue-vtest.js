require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'goo/raycastpack/RaySystem',
	'goo/linerenderpack/LineRenderSystem',
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

	V.describe('3 primitives and a long line, recoloring the red sphere to green color when we hit it');

	var goo = V.initGoo();
	var world = goo.world;
	var raySystem = new RaySystem();
	var LRS = new LineRenderSystem(world);
	
	world.setSystem(raySystem);
	world.setSystem(LRS);

	V.addOrbitCamera(new Vector3(8, Math.PI / 2, 0));
	V.addLights();

	var material1 = new Material('Material1', ShaderLib.uber);
	var sphere0 = new Sphere(20, 20);
	var ent = world.createEntity(sphere0, material1, [ -1.2, 0, 0]).addToWorld();
	raySystem.addEntity(ent, 4);

	var material2 = new Material('Material2', ShaderLib.uber);
	var sphere1 = new Box(0.5, 0.5, 0.5);
	ent = world.createEntity(sphere1, material2, [ 0, 0, 0]).addToWorld();
	raySystem.addEntity(ent, 4);

	var targetSphereMaterial = new Material('Material3', ShaderLib.uber);
	var sphere2 = new Sphere(20, 20);
	var targetSphereEntity = world.createEntity(sphere2, targetSphereMaterial, [1.2, 0, 0]).addToWorld();
	raySystem.addEntity(targetSphereEntity, 4);
	
	material1.uniforms.materialAmbient = [0.0, 0.0, 1.0, 1.0];
	material2.uniforms.materialAmbient = [0.0, 0.0, 1.0, 1.0];
	
	targetSphereMaterial.uniforms.materialAmbient = [1.0, 0.0, 0.0, 1.0];

	
	var setGreenColor = function(material) {
			material.uniforms.materialAmbient[0] = 0;
			material.uniforms.materialAmbient[1] = 1;
			material.uniforms.materialAmbient[2] = 0;
	};
	
	var setRedColor = function(material) {
		material.uniforms.materialAmbient[0] = 1;
		material.uniforms.materialAmbient[1] = 0;
		material.uniforms.materialAmbient[2] = 0;
	};
	
	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	
	var hitCallback = function(hitResult) {
	
		var hitEntity = hitResult.surfaceObject.rayObject.entity;
		
		if(hitEntity.id === targetSphereEntity.id)
		{
			setGreenColor(targetSphereMaterial);
			
			//end the callback
			return false;
		}
	
		//continue traversing the hit entitys
		return true;
	};
	
	var start = new Vector3(-10,-5,-1);
	var end = new Vector3(10,5.2,1);
	
	var update = function(){
	
		setRedColor(targetSphereMaterial);
	
		start.setDirect(Math.sin(world.time)*3-15, start.y, Math.sin(-world.time));
		end.setDirect(Math.cos(world.time*1.2)*3+15, end.y, Math.sin(world.time));
	
		var hit = raySystem.castCallback(start, end, false,hitCallback).hit;
		if(hit) LRS.drawLine(start, end, LRS.GREEN);
		else LRS.drawLine(start, end, LRS.RED);
	};
	
	goo.callbacks.push(update);

	V.process();
});