require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',
	'fsmpack/statemachine/FSMSystem'
], function (
	GooRunner,
	DynamicLoader,
	FSMSystem
	) {
	'use strict';

	function fsmHandlerDemo(goo) {
		goo.world.setSystem(new FSMSystem(goo));

		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: './fsm2/'
		});

		loader.load('project.project').then(function(v) {
		//loader.load('scene.scene').then(function(v) {
			console.log('Success!');
			console.log(v);
			window.goo = goo;
		}).then(null, function(e) {
			console.error('Failed to load fsm: ' + e);
		});
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		fsmHandlerDemo(goo);
	}

	init();
});
