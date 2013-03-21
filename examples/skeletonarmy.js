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
	'goo/loaders/BundleLoader',
	'goo/loaders/SceneLoader',
	'goo/loaders/MaterialLoader',
	'goo/loaders/AnimationTreeLoader',

	'goo/entities/EntityUtils',
	'goo/lib/rsvp.amd',
	'goo/shapes/ShapeCreator',
	'goo/util/TangentGenerator'
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
	BundleLoader,
	SceneLoader,
	MaterialLoader,
	AnimationTreeLoader,

	EntityUtils,
	RSVP,
	ShapeCreator,
	TangentGenerator

) {
	"use strict";
	var resourcePath = '../resources/new_format/skeleton/';
	var loader = new BundleLoader({ rootPath: resourcePath });

	function init() {
		var goo = createWorld();
		var managers = [];

		var rows = 10;
		var cols = 20;
		var skeletonCount = 6;
		var positions = [];

		// Skeletonpositions
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
		// Load the skeleton templates and animations
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
					rootPath: '../resources/new_format/desert/'
				}),
				world: goo.world
		});
		materialLoader.load('materials/desert.mat').then(function(material) {
			var meshData = ShapeCreator.createQuad(10000, 10000, 100, 100);

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
			goo.callbacks.push(function (tpf) {
				manager.update(tpf);
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

	function createWorld() {
		var goo = new GooRunner({
			//showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		goo.renderer.setClearColor(0, 0, 0, 1);
		document.body.appendChild(goo.renderer.domElement);

		// Camera
		var camera = new Camera(45, 1, 1, 5000);
		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.addToWorld();
		cameraEntity.setComponent(new CameraComponent(camera));

		// Camera control
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			baseDistance : 800/4,
			spherical : new Vector3(600, -Math.PI/3 , Math.PI/12)
		}));
		cameraEntity.setComponent(scripts);

		// Light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light');
		//light.translation.setd(-1000,10,0);
		entity.setComponent(new LightComponent(light));
		entity.transformComponent.transform.translation.set(0, 0, 100000);
		entity.addToWorld();

		return goo;
	}


	loader.loadBundle('skeleton.bundle.json').then(function() {
		init();
	});
});
