require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/math/Vector2',
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
	Vector2,
	MeshData,
	TextureCreator,
	RaySystem,
	LineRenderSystem,
	V
	) {
	'use strict';

	V.describe('2 primitives and a long line, drawing a circle at each hit with the color of the meshs texture');

	var goo = V.initGoo();
	var world = goo.world;
	var raySystem = new RaySystem();
	var LRS = new LineRenderSystem(world);
	
	world.setSystem(raySystem);
	world.setSystem(LRS);

	var uvStore = new Vector2(0,0);
	var convertVertexWeightsToUV = function(vertexWeights, surfaceObject, store)
	{
		var meshData = surfaceObject.rayObject.entity.meshDataComponent.meshData;
		var indices = meshData.getIndexBuffer();
		var texCoordBuffer = meshData.getAttributeBuffer(MeshData.TEXCOORD0);

		var v0 = indices[surfaceObject.triangleIndex]*2;
		var v1 = indices[surfaceObject.triangleIndex+1]*2;
		var v2 = indices[surfaceObject.triangleIndex+2]*2;

		var v0s = texCoordBuffer[v0];
		var v0t = texCoordBuffer[v0+1];

		var v1s = texCoordBuffer[v1];
		var v1t = texCoordBuffer[v1+1];

		var v2s = texCoordBuffer[v2];
		var v2t = texCoordBuffer[v2+1];
		var u = vertexWeights[0] * v0t + vertexWeights[1] * v1t + vertexWeights[2] * v2t;
		var v = vertexWeights[0] * v0s + vertexWeights[1] * v1s + vertexWeights[2] * v2s;
		store.setDirect(v, 1-u);
	};


	var setupCanvasMaterial = function(texture) {
		var canvasElement = document.createElement("canvas");
		canvasElement.width = texture.image.width;
		canvasElement.height = texture.image.height;

		var canvasCtx = canvasElement.getContext('2d');

		if (texture.image) {
			canvasCtx.drawImage(texture.image, 0, 0, canvasElement.width, canvasElement.height);
		}
		else
		{
			console.error("missing texture image");
		}

		canvasCtx.globalCompositeOperation = 'source-over';

		return canvasCtx;
	};

	var getPixelColorFromCanvasCtx = function(canvasCtx, x, y) {
		var txColor = canvasCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
		return txColor;
	};


	var canvasCtx;
	var textureReadyCallback = function(texture) {
		canvasCtx = setupCanvasMaterial(texture);
	};

	var checkerTexture = new TextureCreator().loadTexture2D('../../../resources/check-alt.png', {}, textureReadyCallback);
	var setCheckerTexture = function(material) {
		material.setTexture('DIFFUSE_MAP', checkerTexture);
	};


	var material0 = new Material('Material1', ShaderLib.texturedLit);
	setCheckerTexture(material0);
	var sphere0 = new Sphere(50, 50);
	var sphereEntity0 = world.createEntity(sphere0, material0, [ -1.2, 0, 0]).addToWorld();
	raySystem.addEntity(sphereEntity0, 4);

	var material1 = new Material('Material2', ShaderLib.texturedLit);
	setCheckerTexture(material1);
	var sphere1 = new Sphere(4, 4);
	var sphereEntity1 = world.createEntity(sphere1, material1, [1.2, 0, 0]).addToWorld();
	raySystem.addEntity(sphereEntity1, 4);

	var penSphereMaterial0 = new Material('Material3', ShaderLib.simpleColored);
	penSphereMaterial0.uniforms.color = [1,1,1];
	var penSphere0 = new Sphere(20, 20);
	var penSphereEntity0 = world.createEntity(penSphere0, penSphereMaterial0, [ 0, 0, 0]).addToWorld();

	var penSphereMaterial1 = new Material('Material4',ShaderLib.simpleColored);
	penSphereMaterial1.uniforms.color = [1,1,1];
	var penSphere1 = new Sphere(20, 20);
	var penSphereEntity1 = world.createEntity(penSphere1, penSphereMaterial1, [ 0, 1, 0]).addToWorld();

	penSphereEntity0.transformComponent.transform.scale.mul(0.1);
	penSphereEntity1.transformComponent.transform.scale.mul(0.1);

	sphereEntity0.cursor = penSphereEntity0;
	sphereEntity1.cursor = penSphereEntity1;

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();

	var hitCallback = function(hitResult) {
		if(!canvasCtx) return true;

		var hitEntity = hitResult.surfaceObject.rayObject.entity;
		//set position of cursor to the world hit position of hitResult
		var cursor = hitEntity.cursor;
		hitResult.getWorldHitLocation(cursor.transformComponent.transform.translation);

		//get hit pixel color and set to material color
		convertVertexWeightsToUV(hitResult.vertexWeights, hitResult.surfaceObject, uvStore);

		var material = cursor.meshRendererComponent.materials[0];

		uvStore.x *= canvasCtx.canvas.width;
		uvStore.y *= canvasCtx.canvas.height;

		var color = getPixelColorFromCanvasCtx(canvasCtx, uvStore.x, uvStore.y);

		material.uniforms.color[0] = (color[0] / 255);
		material.uniforms.color[1] = (color[1] / 255);
		material.uniforms.color[2] = (color[2] / 255);

		cursor.show();
		cursor.transformComponent.setUpdated();

		return true;
	};
	
	var start = new Vector3(-10,-0.4,-1);
	var end = new Vector3(10,0.5,1);

	var update = function(){
		penSphereEntity0.hide();
		penSphereEntity1.hide();
		start.setDirect(Math.sin(world.time)*5-15, start.y, Math.sin(-world.time));
		end.setDirect(Math.cos(world.time*1.2)*5+15, end.y, Math.sin(world.time));
	
		var hit = raySystem.castCallback(start, end, false, hitCallback).hit;
		if(hit) LRS.drawLine(start, end, LRS.GREEN);
		else LRS.drawLine(start, end, LRS.RED);
	};
	
	goo.callbacks.push(update);

	V.addLights();

	V.addOrbitCamera(new Vector3(6, Math.PI / 1.3, 0.3));

	V.process();
});