
	goo.V.attachToGlobal();

	V.describe('The colored spheres change colors when clicked on or when the mouse exits/enters their projected image.');

	function swapChannels(colors) {
		var tmp;
		tmp = colors[0]; colors[0] = colors[1];	colors[1] = colors[2]; colors[2] = tmp;
	}

	var gooRunner = V.initGoo();
	V.addColoredSpheres();
	V.addLights();
	V.addOrbitCamera();

	var lastEntity;
	var lastDepth;

	gooRunner.addEventListener('mousemove', function(evt) {
		if(evt.entity && lastEntity !== evt.entity) {
			console.log('Entity is ' + evt.entity + ' at ' + evt.depth);
			var color = evt.entity.meshRendererComponent.materials[0].uniforms.color;
			swapChannels(color);
			if(lastEntity && lastDepth) {
				console.log('Last entity was ' + lastEntity + ' at ' + lastDepth);
			}
		}
		lastEntity = evt.entity;
		lastDepth = evt.depth;
	});

	var onPick = function(evt) {
		console.log('Entity is ' + evt.entity + ' at ' + evt.depth);
		if(evt.entity) {
			var color = evt.entity.meshRendererComponent.materials[0].uniforms.color;
			swapChannels(color);
		}
	};

	gooRunner.addEventListener('click', onPick);
	gooRunner.addEventListener('touchstart', onPick);

	V.process();
