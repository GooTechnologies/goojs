require([
	'goo/renderer/Material',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/Quad',
	'goo/shapes/Torus',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/RenderQueue',
	'goo/math/Vector3',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/addons/particlepack/components/ParticleSystemComponent',
	'goo/addons/particlepack/systems/ParticleSystemSystem',
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/addons/particlepack/curves/PolyCurve',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/Vector4Curve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/addons/particlepack/curves/LerpCurve',
	'lib/V'
], function (
	Material,
	Sphere,
	Box,
	Cylinder,
	Quad,
	Torus,
	TextureCreator,
	ShaderLib,
	OrbitCamControlScript,
	RenderQueue,
	Vector3,
	DebugRenderSystem,
	BoundingUpdateSystem,
	ParticleSystemComponent,
	ParticleSystemSystem,
	ConstantCurve,
	PolyCurve,
	LinearCurve,
	Vector4Curve,
	Vector3Curve,
	LerpCurve,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new ParticleSystemSystem());
	world.setSystem(new BoundingUpdateSystem());
	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.selectionActive = true;
	debugRenderSystem.doRender.MeshRendererComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	var entity = world.createEntity([0, 0, 0], new ParticleSystemComponent({
		boundsRadius: 2,
		localSpace: false
	}), function (entity) {
		var x = 5 * Math.cos(world.time * 2);
		entity.setTranslation(0, 0, x);

		var wb = entity.particleSystemComponent.meshEntity.meshRendererComponent.worldBound;
		if(wb){
			var transform = debugRenderSystem.selectionRenderable[0].transform;
			transform.scale.setDirect(wb.xExtent, wb.yExtent, wb.zExtent);
			transform.translation.set(wb.center);
			transform.update();
		}
	}).addToWorld();

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.goo.renderer.setClearColor(0, 0, 0, 1);
	V.process();
});
