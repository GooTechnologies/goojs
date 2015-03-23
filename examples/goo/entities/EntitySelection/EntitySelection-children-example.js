require([
	'goo/entities/GooRunner',
	'goo/entities/EntitySelection'
], function(
	GooRunner,
	EntitySelection
) {
	'use strict';

	var goo = new GooRunner({
		toolMode: true
	});
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	// ---
	var world = goo.world;

	var child11 = world.createEntity('child11').addToWorld();
	var child12 = world.createEntity('child12').addToWorld();

	var parent1 = world.createEntity('parent1').attachChild(child11).attachChild(child12);


	var child21 = world.createEntity('child21').addToWorld();
	var parent2 = world.createEntity('parent2').attachChild(child21);


	var children = new EntitySelection(parent1, parent2).children();

	console.log('Children', children.get().map(function (entity) { return entity.name; }));
});