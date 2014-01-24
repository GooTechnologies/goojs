require([
	'goo/loaders/DynamicLoader',
	'js/createWorld',
	'js/drawSkeleton',
	'goo/entities/EntityUtils'
], function(
	DynamicLoader,
	createWorld,
	drawSkeleton,
	EntityUtils
) {
	'use strict';

	function init() {
		var goo = createWorld();
		loadScene(goo);
	}

	// Load the character
	function loadScene(goo) {
		var loader = new DynamicLoader({
			rootPath: './zombie/',
			world: goo.world
		});

		loader.load('test.scene').then(function (configs) {
			var skinnedEntities = [];

			var rootEntity, animationComponent2;

			var changeState1 = function() {
				var state = this.options[this.selectedIndex].value;
				animationComponent1.transitionTo(state);
				console.log('Transitioning original model to', state);
			};

			var changeState2 = function() {
				var state = this.options[this.selectedIndex].value;
				animationComponent2.transitionTo(state);
				console.log('Transitioning cloned model to', state);
			};

			for (var key in configs) {
				if (/\.entity$/.test(key)) {
					var entity = loader.getCachedObjectForRef(key);
					if (entity.meshDataComponent && entity.meshDataComponent.currentPose) {
						skinnedEntities.push(entity);
					}

					if (entity.animationComponent) {
						var animationComponent1 = entity.animationComponent;
						var choices = entity.animationComponent.getStates();
						fillOptions(choices);
						document.getElementById('animSelect1').addEventListener('change', changeState1);
						document.getElementById('animSelect2').addEventListener('change', changeState2);
					}
					if (key === 'entities/RootNode.entity') {
						rootEntity = loader.getCachedObjectForRef(key);
					}
				}
			}

			// offsetting the original model
			rootEntity.transformComponent.transform.translation.setd(-50, 0, 0);
			rootEntity.transformComponent.setUpdated();

			// cloning the original model
			function callback(entity) {
				console.log('Adding cloned model to world');
				if (entity.animationComponent) {
					animationComponent2 = entity.animationComponent;
				}
				entity.transformComponent.transform.translation.setd(50, 0, 0);
				entity.addToWorld();
			}
			var clonedEntity = EntityUtils.clone(goo.world, rootEntity, { callback: callback });

			// set callbacks to draw the skeleton of the original model
			goo.callbacks.push(function(/*tpf*/) {
				for (var i = 0; i < skinnedEntities.length; i++) {
					if(document.getElementById('drawSkeleton').checked) {
						drawSkeleton(skinnedEntities[i], goo.renderer);
					}
				}
			});

			goo.startGameLoop();
		}).then(null, function(e) {
			console.log(e, e.message);
		});
	}

	function fillOptions(opts) {
		console.log(opts);

		var select1 = document.getElementById('animSelect1');
		var select2 = document.getElementById('animSelect2');

		select1.options.length = 0;
		select2.options.length = 0;

		for (var i = 0; i < opts.length; i++) {
			select1.options[i] = new Option(opts[i], opts[i]);
			select2.options[i] = new Option(opts[i], opts[i]);
		}
	}

	init();
});