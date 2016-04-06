	goo.V.attachToGlobal();

	var gooRunner = new GooRunner();

	gooRunner.renderer.domElement.id = 'goo';
	document.body.appendChild(gooRunner.renderer.domElement);

	// ---
	var world = gooRunner.world;

	var child11 = world.createEntity('child11').addToWorld();
	var child12 = world.createEntity('child12').addToWorld();

	var parent1 = world.createEntity('parent1').attachChild(child11).attachChild(child12);


	var child21 = world.createEntity('child21').addToWorld();
	var parent2 = world.createEntity('parent2').attachChild(child21);

	console.log('Traversing up from', child11.name);
	child11.traverseUp(function (entity) {
		console.log(entity.name);
	});

	console.log('Traversing up from', child12.name);
	child12.traverseUp(function (entity) {
		console.log(entity.name);
	});

	console.log('Traversing up from', child21.name);
	child21.traverseUp(function (entity) {
		console.log(entity.name);
	});
