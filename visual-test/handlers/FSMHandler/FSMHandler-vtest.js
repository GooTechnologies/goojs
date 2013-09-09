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

		loader.load('fsm.fsmComponent').then(function(v) {
			console.log('Success!');
			console.log(v);
		}).then(null, function(e) {
			alert('Failed to load fsm: ' + e);
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
