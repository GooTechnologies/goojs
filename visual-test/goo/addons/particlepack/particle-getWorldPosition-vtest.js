require([
	'goo/math/Vector3',
	'goo/shapes/Box',
	'lib/V',
	'goo/entities/SystemBus',
	'goo/entities/components/HtmlComponent',
	'goo/entities/systems/HtmlSystem',
	'goo/addons/particlepack/components/ParticleSystemComponent',
	'goo/addons/particlepack/systems/ParticleSystemSystem',
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/addons/linerenderpack/LineRenderSystem'
], function (
	Vector3,
	Box,
	V,
	SystemBus,
	HtmlComponent,
	HtmlSystem,
	ParticleSystemComponent,
	ParticleSystemSystem,
	ConstantCurve,
	LinearCurve,
	Vector3Curve,
	LineRenderSystem
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addLights();

	var lineRenderSystem = new LineRenderSystem(world);
	goo.setRenderSystem(lineRenderSystem);

	var colors = [
		new Vector3(1, 1, 1),
		new Vector3(1, 0, 0),
		new Vector3(0, 1, 0),
		new Vector3(0, 0, 1),
		new Vector3(0, 1, 1),
		new Vector3(1, 0, 1),
		new Vector3(1, 1, 0)
	];

	world.setSystem(new ParticleSystemSystem());
	world.setSystem(new HtmlSystem(goo.renderer));
	V.addOrbitCamera(new Vector3(40, Math.PI / 2, 0));
	
	var entities = [];

	for(var i=0; i<2; i++){
		var entity = world.createEntity([(i-1/2) * 10,-13,0], new ParticleSystemComponent({
			sortMode: ParticleSystemComponent.SORT_CAMERA_DISTANCE,
			seed: 123,
			loop: true,
			preWarm: false,
			//randomDirection: true,
			localSpace: i === 0,
			maxParticles: 15,
			//gravity: new Vector3(0,-10,0),
			startLifeTime: new ConstantCurve({ value: 5 }),
			emissionRate: new LinearCurve({ m: 5, k: 50 }),
			startSize: new ConstantCurve({ value: 1 }),
			startSpeed: new LinearCurve({ m: 5, k: 0 }),
			localVelocity: new Vector3Curve({
				x: new ConstantCurve({ value: 0 }),
				y: new ConstantCurve({ value: 0 }),
				z: new ConstantCurve({ value: 100 }) // <-- should point in +x after rotation, and cancel out worldVelocity
			}),
			worldVelocity: new Vector3Curve({
				x: new ConstantCurve({ value: -100 }), // <-- should cancel out
				y: new ConstantCurve({ value: 0 }),
				z: new ConstantCurve({ value: 0 })
			}),
			coneAngle: 0,
			coneRadius: 0
		})).addToWorld();
		entities.push(entity);
		entity.setRotation(0,Math.PI / 2,0.01);

		// HTML below
		var htmlElement = document.createElement('p');
		htmlElement.style.position = 'absolute';
		htmlElement.style['-webkit-user-select'] = 'none';
		htmlElement.style.color = 'white';
		htmlElement.innerHTML = i === 0 ? 'localSpace' : 'worldSpace';
		document.body.appendChild(htmlElement);
		var htmlComponent = new HtmlComponent(htmlElement);
		world.createEntity(entity.getTranslation()).addToWorld().set(htmlComponent);
	}
	var markerPosition = new Vector3();
	var color = new Vector3(1,0,0);
	goo.callbacksPreRender.push(function(){

		lineRenderSystem._lineRenderers.forEach(function(renderer){
			renderer._material.lineWidth = 10;
		});

		entities.forEach(function(entity){
			var particles = entity.particleSystemComponent.particles;
			var minSortValue = particles[0].sortValue;
			var maxSortValue = particles[0].sortValue;
			for(var i=0; i<particles.length; i++){
				var particle = particles[i];
				minSortValue = Math.min(particle.sortValue, minSortValue);
				maxSortValue = Math.max(particle.sortValue, maxSortValue);
			}

			for(var i=0; i<particles.length; i++){
				var particle = particles[i];
				if(particle.active){
					particle.getWorldPosition(markerPosition);
					var span = maxSortValue - minSortValue;
					if(!isNaN(span) && span){
						var normalizedSortValue = (particle.sortValue - minSortValue) / span;
						color.x = normalizedSortValue;
					}
					lineRenderSystem.drawCross(markerPosition, color, 1);
				}
			}
		});
	});

	V.goo.renderer.setClearColor(0, 0, 0, 1);
});