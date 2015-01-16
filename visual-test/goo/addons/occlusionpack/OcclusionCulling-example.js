require([
	'goo/entities/GooRunner',
	'goo/occlusionpack/OcclusionPartitioner',
	'DemoWorld',
	'goo/scripts/ScriptUtils',
	'lib/V'
], function (
	GooRunner,
	OcclusionPartitioner,
	DemoWorld,
	ScriptUtils,
	V
	) {

	'use strict';

	V.describe('"C" toggles use of the Occlusion Culling, "Z" toggles wireframe on the ocluders.');

	var DEBUG = false;
	var DEBUG_CANVAS_ID = 'debugcanvas'

	var occlusionPartitioner, defaultPartitioner, occlusionCullingEnabled;

	var options = {
		logo: {
			position: 'bottomright',
			color: '#FFF'
		},
		manuallyStartGameLoop: true,
		showStats: true
	};
	var goo = new GooRunner(options);
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var demoWorld = new DemoWorld(goo.world);

	setupOcclusionCulling(goo, demoWorld.camera);

	goo.startGameLoop();

	window.addEventListener('keydown', function(e) {

		var material = demoWorld.material;

		
		if (e.keyCode === ScriptUtils._keys['z']) {
			// Toggle wireframe
			material.wireframe = !material.wireframe;
		} else if (e.keyCode === ScriptUtils._keys['c']) {
			// Switch occlusion partitioner on and off.
			if (occlusionCullingEnabled === true) {
				goo.renderSystem.partitioner = defaultPartitioner;
				occlusionCullingEnabled = false;
				console.debug('Occlusion Culling Disabled');
			} else {
				goo.renderSystem.partitioner = occlusionPartitioner;
				occlusionCullingEnabled = true;
				console.debug('Occlusion Culling Enabled');
			}
		}

	});

	/**
	* Sets up the occlusion culling, size decided from the debugcontext.
	*/
	function setupOcclusionCulling (goo, camera) {

		var SOFTWARE_BUFFER_WIDTH = 64;
		var SOFTWARE_BUFFER_HEIGHT = 32;

		var occlusionParameters = {
			'width': SOFTWARE_BUFFER_WIDTH,
			'height': SOFTWARE_BUFFER_HEIGHT,
			'camera': camera
		};

		if (DEBUG === true) {

			console.debug('Debug mode enabled!');

			var debugcanvas = document.createElement('canvas');
			document.body.appendChild(debugcanvas);
			debugcanvas.id = DEBUG_CANVAS_ID;
			debugcanvas.width = SOFTWARE_BUFFER_WIDTH;
			debugcanvas.height = SOFTWARE_BUFFER_HEIGHT;
			var debugContext = debugcanvas.getContext('2d');

			occlusionParameters['debugContext'] = debugContext
		}

		occlusionPartitioner = new OcclusionPartitioner(occlusionParameters)
		defaultPartitioner = goo.renderSystem.partitioner;
		goo.renderSystem.partitioner = occlusionPartitioner;
		occlusionCullingEnabled = true;
	};

});