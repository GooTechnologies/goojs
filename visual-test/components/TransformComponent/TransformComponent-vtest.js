require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/entities/components/LightComponent',
	'goo/addons/box2d/systems/Box2DSystem',
	'goo/addons/box2d/components/Box2DComponent',
	'goo/math/MathUtils',
	'goo/shapes/FilledPolygon',
	'goo/debug/Debugger',
	'../../lib/V'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	LightComponent,
	Box2DSystem,
	Box2DComponent,
	MathUtils,
	FilledPolygon,
	Debugger,
	V
	) {
	'use strict';

	function getColoredMaterial(r, g, b) {
		var material = Material.createMaterial(ShaderLib.simpleLit, 'Floormaterial');
		material.materialState.diffuse = [r, g, b, 1];
		return material;
	}

	function addLight(goo) {
		var light = new PointLight();
		var lightEntity = EntityUtils.createTypicalEntity(goo.world, light);
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.setd(40, 40, 40);
		lightEntity.addToWorld();
	}

	function addOriginShape(goo) {
		var world = goo.world;
		var boxMeshData = ShapeCreator.createBox();
		var box;

		box = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(1.5, 0.1, 0.1);
		box.addToWorld();

		box = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(0.1, 1.5, 0.1);
		box.addToWorld();

		box = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(0.1, 0.1, 1.5);
		box.addToWorld();
	}

	function transformComponentDemo(goo) {
		var world = goo.world;
		var boxMeshData = ShapeCreator.createBox();

		var box1, box2, box3, box4, box5;

		// marking the origin
		addOriginShape(goo);

		// keepTransform = false; --------------------
		box1 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 0, 0), [-2, 0, 0]);
		box1.addToWorld();

		box2 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 0.5, 0), [-2, 1, 0]);
		box2.addToWorld();
		box1.transformComponent.attachChild(box2.transformComponent);

		box3 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 1, 0), [-2, 2, 0]);
		box3.addToWorld();
		box2.transformComponent.attachChild(box3.transformComponent);

		box4 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 1, 0), [-2, 3, 0]);
		box4.addToWorld();
		box3.transformComponent.attachChild(box4.transformComponent);

		box5 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 0, 1), [-2, 4, 0]);
		box5.addToWorld();
		box4.transformComponent.attachChild(box5.transformComponent);

		// keepTransform = true; ---------------------
		box1 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 0, 0), [2, 0, 0]);
		box1.addToWorld();

		box2 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 0.5, 0), [2, 1, 0]);
		box2.addToWorld();
		box1.transformComponent.attachChild(box2.transformComponent, true);

		box3 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(1, 1, 0), [2, 2, 0]);
		box3.addToWorld();
		box2.transformComponent.attachChild(box3.transformComponent, true);

		box4 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 1, 0), [2, 3, 0]);
		box4.addToWorld();
		box3.transformComponent.attachChild(box4.transformComponent, true);

		box5 = EntityUtils.createTypicalEntity(world, boxMeshData, getColoredMaterial(0, 0, 1), [2, 4, 0]);
		box5.addToWorld();
		box4.transformComponent.attachChild(box5.transformComponent, true);

		// add light
		addLight(goo);

		// add camera
		V.addOrbitCamera(goo, new Vector3(20, Math.PI / 2, 0.3), new Vector3(0, 7.5, 0));

		new Debugger(true, true).inject(goo);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		transformComponentDemo(goo);
	}

	init();
});
