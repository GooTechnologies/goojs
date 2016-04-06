	goo.V.attachToGlobal();

	var gooRunner = new GooRunner();

	gooRunner.renderer.domElement.id = 'goo';
	document.body.appendChild(gooRunner.renderer.domElement);

	// ---
	var world = gooRunner.world;

	// the very short story of a banana
	var banana = world.createEntity().setTag('fruit').setTag('green'); // initially bananas are green
	setTimeout(function() {
		// some time passes and it becomes yellow
		banana.clearTag('green').setTag('yellow');

		setTimeout(function() {
			// more time passes and it's staring to get spots
			banana.clearTag('yellow').setTag('spots');
		}, 5000);
	}, 5000);

	function messageIfTag(message, tag) {
		if (banana.hasTag(tag)) {
			console.log(message);
		}
	}

	// at any point in time a user may ask what the state of the banana is
	window.addEventListener('keydown', function () {
		messageIfTag('The banana is green', 'green');
		messageIfTag('The banana is yellow', 'yellow');
		messageIfTag('The banana is spotty', 'spots');
	});

	console.log('Hit any key to check the state of the banana');
