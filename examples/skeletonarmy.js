require.config({
	baseUrl: "./",
	paths: {
		'goo': '../src/goo',
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader',
	'goo/loaders/AnimationTreeLoader',
	'goo/lib/rsvp.amd'
], function(
	GooRunner,
	Vector3,
	Camera,
	CameraComponent,
	PointLight,
	LightComponent,
	ScriptComponent,
	OrbitCamControlScript,
	Loader,
	SceneLoader,
	AnimationTreeLoader,
	RSVP

) {
	"use strict";
	var resourcePath = "../converter/skeleton/";

	function init() {
		// GooRunner
		var goo = new GooRunner({
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Camera
		var camera = new Camera(45, 1, 1, 10000);
		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.transformComponent.transform.translation.set(500, 0, 0);
		cameraEntity.transformComponent.transform.lookAt(
			new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.addToWorld();
		cameraEntity.setComponent(new CameraComponent(camera));

		// Camera control
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			baseDistance : 150,
			spherical : new Vector3(500, -Math.PI/12, Math.PI/12)
		}));
		cameraEntity.setComponent(scripts);

		// Light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light');
		entity.setComponent(new LightComponent(light));
		entity.transformComponent.transform.translation.set(80, 50, 80);
		entity.addToWorld();

		var loaders = [];
		var managers = [];
		var loader = new Loader({ rootPath: resourcePath });

		// Load a bunch of skeletons
		// skeletonCount needs to be a squared odd number
		var skeletonCount = 9*9;
		var param = Math.round((Math.sqrt(skeletonCount)/2)-1);
		for (var i = -param; i <= param; i++) {
			for (var j = -param; j <= param; j++) {
				var posX = j*50 + 5*(Math.random()-1);
				var posZ = i*50 + 10*(Math.random()-1);
				loaders.push(makeSkeleton(goo.world, loader, posZ, posX));
			}
		}

		// When skeletons are loaded, load animations
		RSVP.all(loaders).then(function(scenes) {
			var timers = [];
			var entities = [];
			for (var i = 0; i < scenes.length; i++) {
				var animLoader = new AnimationTreeLoader({ loader: loader });
				for (var j = 0; j < scenes[i].length; j++) {
					var entity = scenes[i][j];
					entities.push(entity);
					if (hasSkeletonPose(entity)) {
						var p = delayAnimation(
							animLoader,
							entity.meshDataComponent.meshData.currentPose,
							goo
						);
						timers.push(p);
					}
				}
			}
			RSVP.all(timers)
			.then(function(animations) {
				return RSVP.all(animations);
			})
			// When animations are loaded, add all entities to world to make them visible
			.then(function(animManagers) {
				managers = animManagers;
				for(var i = 0; i < entities.length; i++) {
					entities[i].addToWorld();
				}
			});
		});

		// Add user interaction
		var walking = true;
		document.addEventListener('keydown', function (e) {
			e = window.event || e;
			var code = e.charCode || e.keyCode;
			if (code === 32) { // space bar
				for (var i = 0; i < managers.length; i++) {
					var animationManager = managers[i];
					delayTransition(animationManager, walking ? "run" : "walk");
				}
				walking = !walking;
			} else if (code === 13) { // enter
				for (var i = 0; i < managers.length; i++) {
					var animationManager = managers[i];
					animationManager.findAnimationLayer("punchLayer").setCurrentStateByName("punch_right", true);
				}
			}
		}, false);

	}

	// Delaying animation start so characters march out of sync
	function delayAnimation(animLoader, pose, goo) {
		var p = new RSVP.Promise();
		setTimeout(function() {
			p.resolve(loadAnimation(animLoader, pose, goo));
		},Math.round(3000*Math.random()));
		return p;

	}

	// Loading animations
	function loadAnimation(animLoader, pose, goo) {
		var p = animLoader.load('animations/skeleton.anim', pose, "walk_anim")
		.then(function(manager) {
			goo.callbacks.push(function () {
				manager.update();
			});
			return manager;
		});
		return p;
	}


	// Delaying animation transition
	function delayTransition(manager, anim) {
		setTimeout(function() {
			manager.getBaseAnimationLayer().doTransition(anim);
		}, Math.round(1000*Math.random()));
	}

	// Load the character
	function makeSkeleton(world, loader, posZ, posX) {
		var sceneLoader = new SceneLoader({ loader: loader, world: world });
		var p = sceneLoader.load('skeleton.scene.json').then(function(entities) {

			var topEntity = getTopEntity(entities);
			topEntity.transformComponent.transform.translation.set(posX,0,posZ);
			return entities;
		}).then(null,
		function(err) {
			console.log('Mainerror. \n'+err);
		});
		return p;
	}

	function getTopEntity(entities) {
		var topEntities = [];
		for(var i = 0, max = entities.length; i < max; i++) {
			if(!entities[i].transformComponent.parent) {
				topEntities.push(entities[i]);
			}
		}
		if(topEntities.length === 1) {
			return topEntities[0];
		}
		else {
			return null;
		}
	}
	function hasSkeletonPose(entity) {
		return entity.meshDataComponent && entity.meshDataComponent.meshData.currentPose;
	}
	init();
});