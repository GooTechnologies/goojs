require([
	'goo/entities/GooRunner'
], function(
	GooRunner
) {
	'use strict';

	var goo = new GooRunner();

	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	// ---
	var world = goo.world;

	var bat = world.createEntity('Bat').setTag('flying').setTag('mammal').addToWorld();
	var seagull = world.createEntity('Seagull').setTag('flying').addToWorld();
	var bear = world.createEntity('Bear').setTag('mammal').addToWorld();

	world.process();

	var flyingEntities = world.by.tag('flying');
	var mammalEntities = world.by.tag('mammal');

	//! AT: all these ops mutate the selection
	var flyingMammals = flyingEntities.clone().intersects(mammalEntities);
	var flyingOrMammals = flyingEntities.clone().and(mammalEntities);
	var notMammals = flyingOrMammals.clone().without(mammalEntities);

	console.log('Flying mammals', flyingMammals.get().map(function (entity) { return entity.name; }));
	console.log('Flying or mammals', flyingOrMammals.get().map(function (entity) { return entity.name; }));
	console.log('!Mammals', notMammals.get().map(function (entity) { return entity.name; }));
});