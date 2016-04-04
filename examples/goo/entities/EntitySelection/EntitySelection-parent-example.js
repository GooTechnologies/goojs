	goo.V.attachToGlobal();

	var gooRunner = new GooRunner();

	gooRunner.renderer.domElement.id = 'goo';
	document.body.appendChild(gooRunner.renderer.domElement);

	// ---
	var world = gooRunner.world;

	var child11 = world.createEntity('child11');
	var child12 = world.createEntity('child12');

	var parent1 = world.createEntity('parent1').attachChild(child11).attachChild(child12);


	var child21 = world.createEntity('child21');
	var parent2 = world.createEntity('parent2').attachChild(child21);


	var parents = new EntitySelection(child11, child12, child21).parent();

	console.log('Parents', parents.get().map(function (entity) { return entity.name; }));
