require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/entities/components/HtmlComponent',
	'goo/shapes/Box',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	HtmlComponent,
	Box,
	V
	) {
	'use strict';

	V.describe('Boxes with different depth functions');

	var goo = V.initGoo();
	var world = goo.world;

	var box = new Box(1, 1, 1);

	// Create background box
	var material = new Material(ShaderLib.simpleColored);
	material.uniforms.color = [0.5, 0.5, 0.5];
	material.renderQueue = 0;
	var backgroundBox = world.createEntity(box, material).addToWorld();
	backgroundBox.setScale(10, 10, 0.1);

	// Create boxes with various depth functions
	function addBox(depthFunc, pos) {
		var material = new Material(ShaderLib.simpleColored);
		material.uniforms.color = [Math.random(), Math.random(), Math.random()];
		material.depthState.write = false;
		material.depthState.depthFunc = depthFunc;

		var htmlElement = document.createElement('p');
		// htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.style.color = 'white';
		htmlElement.innerHTML = depthFunc;
		document.body.appendChild(htmlElement);
		var htmlComponent = new HtmlComponent(htmlElement);

		var entity = world.createEntity(box, material, pos, htmlComponent).addToWorld();

		var materialWire = new Material(ShaderLib.simpleColored);
		materialWire.depthState.write = false;
		materialWire.depthState.depthFunc = depthFunc;
		materialWire.wireframe = true;
		entity.meshRendererComponent.materials.push(materialWire);
	}

	addBox('Never', [-2, 2, 0]);
	addBox('Always', [0, 2, 0]);
	addBox('Less', [2, 2, 0]);
	addBox('LessEqual', [-2, 0, 0]);
	addBox('Equal', [0, 0, 0]);
	addBox('GreaterEqual', [2, 0, 0]);
	addBox('Greater', [-2, -2, 0]);
	addBox('NotEqual', [0, -2, 0]);

	var camEntity = V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0));

	V.process();
});
