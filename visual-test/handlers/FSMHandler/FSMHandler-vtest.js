require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader'
], function (
	GooRunner,
	DynamicLoader
	) {
	'use strict';

	function fsmHandlerDemo(goo) {
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: './fsm/'
		});

		loader.load('scene.scene').then(function(v) {
		//loader.load('entity.entity').then(function(v) {
			console.log('Success!');
			console.log(v);
			window.goo = goo;
		}).then(null, function(e) {
				alert('Failed to load fsm: ' + e);
		});
		/*
		loader.load('m1_s1.state').then(function(v) {
			console.log('Success!');
			console.log(v);
		}).then(null, function(e) {
			alert('Failed to load fsm: ' + e);
		});
		*/
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		fsmHandlerDemo(goo);
	}

	init();
});
