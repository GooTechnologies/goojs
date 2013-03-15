require.config({
	baseUrl: "./",
	paths: {
		'goo': '../src/goo',
		'goo/lib': '../lib'
	}
});
require([
	'goo/math/Vector3',
	'goo/loaders/Loader',
	'goo/loaders/BundleLoader',
	'goo/loaders/SceneLoader',
	'goo/loaders/AnimationTreeLoader',
	'goo/lib/rsvp.amd',
	'DemoWorld'
], function(
	Vector3,
	Loader,
	BundleLoader,
	SceneLoader,
	AnimationTreeLoader,
	RSVP,
	DemoWorld

) {
	"use strict";
	var resourcePath = '../resources/new_format/skeleton/';
	var loader = new BundleLoader({ rootPath: resourcePath });


	function init() {
		// GooRunner
		var glass = createGlass();
		var goo = DemoWorld.create(500);

		var loaders = [];
		var managers = [];

		var rows = 8;
		var cols = 10;
		var total = rows*cols;
		var count = 0;
		// Load a bunch of skeletons
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				var x = j-(cols-1)/2;
				var y = i-(rows-1)/2;
				var posX = x*50 + 5*(Math.random()-1);
				var posZ = y*50 + 10*(Math.random()-1);
				loaders.push(makeSkeleton(goo.world, loader, posZ, posX));
			}
		}
		function progress() {
			updateProgress(glass, Math.floor(++count/2), total);
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
						p.then(progress);
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
		},Math.round(1000*Math.random()));
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

	function createGlass() {
		var glass = document.createElement('div');
		glass.innerHTML = 'Loading ...';
		glass.style.zIndex = 1000;
		glass.style.position = 'absolute';
		glass.style.top = '50%';
		glass.style.left = '50%';
		glass.style.marginLeft = '-120px';
		glass.style.marginTop = '-40px';
		glass.style.lineHeight = '80px';
		glass.style.width = '240px';
		glass.style.textAlign = 'center';
		glass.style.backgroundColor = 'rgba(230,230,230,0.4)';
		glass.style.fontFamily = 'Helvetica';

		document.body.appendChild(glass);
		return glass;
	}

	function updateProgress(glass, count, total) {
		if (count === total) {
			glass.parentNode.removeChild(glass);
		}
		else {
			glass.innerHTML = 'Loading '+count+'/'+total;
		}
	}



	loader.loadBundle('skeleton.bundle.json').then(function() {
		init();
	});
});