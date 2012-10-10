//require.config({
//	paths : {
//		"three" : "three.min"
//	}
//});

require([ 'entities/World', 'entities/Entity' ], function(World, Entity) {
	var world = new World();

	world.setManager('TestManager', {
		added : function(entity) {
			console.log('Added: ' + entity.name);
		},
		removed : function(entity) {
			console.log('Removed: ' + entity.name);
		}
	});

	var entity1 = world.createEntity();
	entity1.addToWorld();
	var entity2 = world.createEntity();
	entity2.addToWorld();

	entity2.removeFromWorld();

	world.process();

	var entity3 = world.createEntity();
	entity3.addToWorld();

	world.process();

	console.log(world.getEntities());
});
