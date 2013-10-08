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
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/shapes/FilledPolygon',
	'goo/renderer/TextureCreator',
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
	SpotLight,
	LightComponent,
	FilledPolygon,
	TextureCreator,
	V
	) {
	'use strict';

	function filledPolygonDemo(goo) {
		var verts = [
			0, 0, 0,
			1, 0, 0,
			1+0.1, 1-0.1, 0,
			2, 1, 0,
			2, 2, 0,
			0, 2, 0];
		var meshData = new FilledPolygon(verts);

		var material = Material.createMaterial(ShaderLib.texturedLit, '');
		var texture = new TextureCreator().loadTexture2D('../../resources/check.png');
		material.setTexture('DIFFUSE_MAP', texture);
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, meshData, material, '');
		boxEntity.addToWorld();

		var light1 = new PointLight();
		//light1.color = [1.0, 0.3, 0.0];
		var light1Entity = goo.world.createEntity('light');
		light1Entity.setComponent(new LightComponent(light1));
		light1Entity.transformComponent.transform.translation.set(10, 10, 10);
		light1Entity.addToWorld();

		// camera
		V.addOrbitCamera(goo, new Vector3(10, Math.PI / 2, 0));
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		filledPolygonDemo(goo);
	}

	init();
});
