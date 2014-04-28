require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/shapes/Quad',
	'lib/V',
	'goo/renderer/Camera',
	'goo/scripts/Scripts',
	'goo/entities/SystemBus',
	'goo/entities/components/HtmlComponent',
	'goo/entities/systems/HtmlSystem'
], function (
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	MeshRendererComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	Quad,
	V,
	Camera,
	Scripts,
	SystemBus,
	HtmlComponent,
	HtmlSystem
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new HtmlSystem(goo.renderer));

	V.addLights();
	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	var map = {
		mousedown: null,
		mouseup: null,
		click: null,
		dblclick: null
	};

	var i = 0;
	var dist = 2;
	var N = 4;
	for (var event in map) {
		// Create clickable cube
		var position = [i * dist - dist * (N - 1) / 2, 0, 0];
		var material = V.getColoredMaterial(1, 1, 1);
		var script = Scripts.create('ButtonScript');
		var entity = world.createEntity(new Box(), material, position, script).addToWorld();
		map[event] = entity;
		i++;

		// HTML sign below
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.innerHTML = event;
		document.body.appendChild(htmlElement);
		var htmlComponent = new HtmlComponent(htmlElement);
		position[1] -= 1;
		world.createEntity(position).addToWorld().set(htmlComponent);
	}

	SystemBus.addListener('goo.scriptError', function (event) {
		console.log("Script error!", event);
	});

	function swapColor(entity) {
		var uniforms = entity.meshRendererComponent.materials[0].uniforms;
		if (uniforms.materialDiffuse[1] === 1) {
			uniforms.materialDiffuse = [1, 0, 0, 1];
		} else {
			uniforms.materialDiffuse = [1, 1, 1, 1];
		}
	}

	SystemBus.addListener('goo.buttonScriptEvent', function (event) {
		var entity = event.entity;
		var eventEntity = map[event.type];
		if (entity === eventEntity) {
			swapColor(entity);
		}
	});

});