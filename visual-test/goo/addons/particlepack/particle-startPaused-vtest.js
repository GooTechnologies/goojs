require([
	'goo/math/Vector3',
	'goo/addons/particlepack/components/ParticleSystemComponent',
	'goo/addons/particlepack/systems/ParticleSystemSystem',
	'lib/V'
], function (
	Vector3,
	ParticleSystemComponent,
	ParticleSystemSystem,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new ParticleSystemSystem());

	var entity = world.createEntity([0, 0, 0], new ParticleSystemComponent({
		paused: true
	})).addToWorld();

	setTimeout(function(){
		entity.particleSystemComponent.play();
	}, 2000);

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	V.goo.renderer.setClearColor(0, 0, 0, 1);
	V.process();
});
