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
	'goo/loaders/MaterialLoader',
	'goo/loaders/AnimationTreeLoader',
	'goo/entities/EntityUtils',
	'goo/lib/rsvp.amd',
	'DemoWorld',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'goo/renderer/Material',
	'goo/loaders/JSONImporter',
	'goo/util/TangentGenerator'
], function(
	Vector3,
	Loader,
	BundleLoader,
	SceneLoader,
	MaterialLoader,
	AnimationTreeLoader,
	EntityUtils,
	RSVP,
	DemoWorld,
	ShaderLib,
	ShapeCreator,
	Material,
	JSONImporter,
	TangentGenerator

) {
	"use strict";
	var resourcePath = '../resources/new_format/skeleton/';
	var loader = new BundleLoader({ rootPath: resourcePath });

	function init() {
		var goo = DemoWorld.create(800);

		var managers = [];


		//var count = 0;

		var rows = 14;
		var cols = 30;
		var skeletonCount = 6;

		//var total = rows*cols;
		var positions = [];

		// Load the skeleton templates
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				var x = j-(cols-1)/2;
				var y = i-(rows-1)/2;
				var posX = x*50 + 10*(Math.random()-1) - cols/3*50;
				var posZ = y*50 + 40*(Math.random()-1);
				positions.push([posX, 0, posZ]);
			}
		}

		var skeletonTemplates = [];
		// For loop
		function innerLoop() {
			var p = new RSVP.Promise();
			makeSkeleton(goo.world, loader)
			.then(function(entity) {
				return setupAnimation(goo, loader, entity, managers);
			}).then(function(entity) {
				p.resolve(entity);
			});

			skeletonTemplates.push(p);
		}
		for(var i = 0; i < skeletonCount; i++) {
			innerLoop();
		}

		// Create a bunch of skeleton clones
		RSVP.all(skeletonTemplates)
		.then(function(topEntities) {
			function addEntity(entity) {
				entity.addToWorld();
			}

			for(var i = 0, max = positions.length; i < max; i++) {
				var newSkeleton = EntityUtils.clone(goo.world, topEntities[i%topEntities.length]);

				var randPos = Math.floor(Math.random()*positions.length);
				var newPos = positions.splice(randPos, 1)[0];

				newSkeleton.transformComponent.transform.translation.seta(newPos);

				EntityUtils.traverse(newSkeleton, addEntity);
			}

		});

		// Load skybox
		var sceneLoader = new SceneLoader({
			loader: new Loader({
				rootPath: '../resources/new_format/skybox/'
			}),
			world: goo.world
		});

		sceneLoader.load('skybox.scene.json').then(function(entities) {
			for(var i in entities) {
				entities[i].addToWorld();
			}
		});

		// Load floor
		var materialLoader = new MaterialLoader({
				loader: new Loader({
					rootPath: '../resources/new_format/floor/'
				}),
				world: goo.world
		});
		materialLoader.load('materials/floor.mat').then(function(material) {
			console.log(material);
			var meshData = ShapeCreator.createQuad(10000, 10000, 100, 100);
			TangentGenerator.addTangentBuffer(meshData, 0);
			var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
			entity.meshRendererComponent.materials.push(material);
			entity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
			entity.addToWorld();
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

	function setupAnimation(goo, loader, topEntity, managers) {
		var loaded = false;
		var animLoader = new AnimationTreeLoader({ loader: loader });
		var p = new RSVP.Promise();
		EntityUtils.traverse(topEntity, function(entity) {
			var pose;
			if(!loaded && (pose = getSkeletonPose(entity))) {
				loaded = true;

				setTimeout(function() {
					loadAnimation(animLoader, pose, goo)
					.then(function(animManager) {
						managers.push(animManager);
						p.resolve(topEntity);
					});
				}, Math.round(2000*Math.random()));
			}
		});
		if(!loaded) {
			p.resolve(topEntity);
		}
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
	function makeSkeleton(world, loader) {
		var sceneLoader = new SceneLoader({ loader: loader, world: world });
		var p = sceneLoader.load('skeleton.scene.json').then(function(entities) {
			console.log(entities);
			var topEntity = getTopEntity(entities);
			return topEntity;
		}).then(null,
		function(err) {
			console.log('Mainerror. \n'+err);
		});
		return p;
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
		else {
			return false;
		}
	}



	/*
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
	*/



	loader.loadBundle('skeleton.bundle.json').then(function() {
		init();
	});
});
