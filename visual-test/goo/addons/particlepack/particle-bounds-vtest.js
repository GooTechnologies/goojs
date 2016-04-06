goo.V.attachToGlobal();

var gooRunner = V.initGoo();
var world = gooRunner.world;

world.setSystem(new ParticleSystemSystem());
world.setSystem(new BoundingUpdateSystem());
var debugRenderSystem = new DebugRenderSystem();
debugRenderSystem.selectionActive = true;
debugRenderSystem.doRender.MeshRendererComponent = true;
gooRunner.renderSystems.push(debugRenderSystem);
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
gooRunner.renderer.setClearColor(0, 0, 0, 1);
V.process();
