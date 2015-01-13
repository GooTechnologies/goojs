require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/TextureCreator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	MeshRendererComponent,
	TextureCreator,
	V
) {
	'use strict';

	V.describe('Cloning materials');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	V.addLights();


	var textureCreator = new TextureCreator();

	var texture = textureCreator.loadTexture2D('../../../resources/check.png', {}, createClones);
	var material = new Material(ShaderLib.uber);
	material.setTexture('DIFFUSE_MAP', texture);
	var originalMeshRendererComponent = new MeshRendererComponent(material);

	world.createEntity(new Box(), originalMeshRendererComponent, [0, 0, 0]).addToWorld();

	function createClones() {
		// cloning is delayed until the first texture loads
		// original texture gets updated by the texture creator but the clones don't
		// it's just a matter of cloning at the right moment

		var clonedMeshRendererComponent1 = originalMeshRendererComponent.clone();
		clonedMeshRendererComponent1.materials[0].uniforms.materialDiffuse = [1, 0, 0, 1];

		var clonedMeshRendererComponent2 = originalMeshRendererComponent.clone();
		clonedMeshRendererComponent2.materials[0].uniforms.materialDiffuse = [0, 0, 1, 1];

		world.createEntity(new Box(), clonedMeshRendererComponent1, [-2, 0, 0]).addToWorld();
		world.createEntity(new Box(), clonedMeshRendererComponent2, [ 2, 0, 0]).addToWorld();
	}


	V.process();
});