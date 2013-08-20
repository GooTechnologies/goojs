require.config({
	baseUrl: "./",
	paths: {
		"goo": "/js/goo"
	}
});
require([
	'goo/loaders/DynamicLoader',
	'js/createWorld',
	'js/drawSkeleton'
], function(
	DynamicLoader,
	createWorld,
	drawSkeleton
) {
	"use strict";

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

			var func = function() {
				var state = this.options[this.selectedIndex].value;
				animComp.transitionTo(state);
				console.log(state);
			};
			for (var key in configs) {
				if (/\.entity$/.test(key)) {
					var entity = loader.getCachedObjectForRef(key);
					if (entity.meshDataComponent && entity.meshDataComponent.currentPose) {
						skinnedEntities.push(entity);
					}

					if (entity.animationComponent) {
						var animComp = entity.animationComponent;
						var choices = entity.animationComponent.getStates();
						fillOptions(choices);
						document.getElementById('animSelect').addEventListener('change', func);
					}
				}
			}
			goo.callbacks.push(function(/*tpf*/) {
				for (var i = 0; i < skinnedEntities.length; i++) {
					if(document.getElementById('drawSkeleton').checked) {
						drawSkeleton(skinnedEntities[i], goo.renderer);
					}
				}
			});

			goo.startGameLoop();
		});
	}

	function fillOptions(opts) {
		console.log(opts);
		var select = document.getElementById('animSelect');
		console.log(select);
		select.options.length = 0;
		for (var i = 0; i < opts.length; i++) {
			select.options[i] = new Option(opts[i], opts[i]);
		}
	}

	init();
});