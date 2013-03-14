require.config({
	baseUrl: "./",
	paths: {
		'goo': '../src/goo',
		'goo/lib': '../lib'
	}
});
require([
	'DemoWorld',
	'goo/math/Vector3',
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader',
	'goo/loaders/AnimationTreeLoader',
	'goo/loaders/AnimationLoader',
	'goo/lib/rsvp.amd'
], function(
	DemoWorld,
	Vector3,
	Loader,
	SceneLoader,
	AnimationTreeLoader,
	AnimationLoader,
	RSVP

) {
	"use strict";
	var resourcePath = "../converter/";

	function init() {
		var goo = DemoWorld.create(200);

		var managers = [];
		var loader = new Loader({ rootPath: resourcePath + 'skeleton/' });


		var sceneLoader = new SceneLoader({ loader: loader, world: goo.world });

		// Load the scene!
		sceneLoader.load('skeleton.scene.json').then(function(entities) {
			// Move the root entity and the rest will follow
			var topEntity = getTopEntity(entities);
			topEntity.transformComponent.transform.translation.set(0, -30, -30);

			// Load animations for entities with skeletonposes
			var promises = [];
			for (var i = 0; i < entities.length; i++) {
				var pose;
				if (pose = getSkeletonPose(entities[i])) {
					var animationTreeLoader = new AnimationTreeLoader({ loader: loader });
					var p = animationTreeLoader.load('animations/skeleton.anim', pose, 'walk_anim');
					promises.push(p);
				}
			}

			// When animations are loaded, start them and add the entities to the visible world
			RSVP.all(promises).then(function(animationManagers) {
				managers = animationManagers;
				goo.callbacks.push(function() {
					for (var i = 0; i < animationManagers.length; i++) {
						animationManagers[i].update();
					}
				});
			}).then(function() {
				for (var i = 0; i < entities.length; i++) {
					entities[i].addToWorld();
				}
			});
		});

		var otherLoader = new Loader({ rootPath: resourcePath + 'runman/' });
		var otherSceneLoader = new SceneLoader({ loader: otherLoader, world: goo.world });

		otherSceneLoader.load('runman.scene.json').then(function(entities) {
			var topEntity = getTopEntity(entities);
			topEntity.transformComponent.transform.scale.set(0.5,0.5,0.5);
			topEntity.transformComponent.transform.translation.set(0, -30, 30);
			topEntity.transformComponent.transform.rotation.fromAngles(0,Math.PI/2,0);
			var promises = [];
			for (var i = 0; i < entities.length; i++) {
				var pose;
				if (pose = getSkeletonPose(entities[i])) {
					var animationLoader = new AnimationLoader({ loader: otherLoader });
					var p = animationLoader.load('animations/run.anim', pose, 'run');
					promises.push(p);
				}
			}
			RSVP.all(promises).then(function(animationManagers) {
				goo.callbacks.push(function() {
					for (var i = 0; i < animationManagers.length; i++) {
						animationManagers[i].update();
					}
				});
			}).then(function() {
				for (var i = 0; i < entities.length; i++) {
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
					animationManager.getBaseAnimationLayer().doTransition(walking ? "run" : "walk");
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

	// Helpers
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
	function getSkeletonPose(entity) {
		if (entity.meshDataComponent && entity.meshDataComponent.meshData.currentPose) {
			return entity.meshDataComponent.meshData.currentPose;
		}
		return null;
	}


	init();
});