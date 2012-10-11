//require.config({
//	paths : {
//		"three" : "three.min"
//	}
//});

require([ 'entities/World', 'entities/Entity', 'entities/systems/System', 'entities/systems/TransformSystem',
		'entities/systems/RenderSystem', 'entities/components/TransformComponent' ], function(World, Entity, System,
		TransformSystem, RenderSystem, TransformComponent) {
	var world = new World();

	// world.setManager({
	// type : 'TestManager',
	// added : function(entity) {
	// console.log('TestManager Added: ' + entity.name);
	// },
	// changed : function(entity) {
	// console.log('TestManager Changed: ' + entity.name);
	// },
	// removed : function(entity) {
	// console.log('TestManager Removed: ' + entity.name);
	// }
	// });

	var TestSystem = function() {
		System.apply(this, arguments);
	};
	TestSystem.prototype = Object.create(System.prototype);
	TestSystem.prototype.process = function(entities) {
		console.log("TestSystem entitycount: " + entities.length);
	};
	var testSystem = new TestSystem('TestSystem', null);
	world.setSystem(testSystem);

	world.setSystem(new TransformSystem());

	var renderList = [];
	var partitioningSystem = new PartitioningSystem(renderList);
	world.setSystem(partitioningSystem);
	var renderSystem = new RenderSystem(renderList);
	world.setSystem(renderSystem);

	var entity1 = world.createEntity();
	entity1.addToWorld();
	var entity2 = world.createEntity();
	entity2.addToWorld();

	world.process();

	entity2.removeFromWorld();

	world.process();

	var entity3 = world.createEntity();
	entity3.addToWorld();

	var transformComponent = new TransformComponent();
	entity3.setComponent(transformComponent);
	entity3.TransformComponent.transform.translation.x = 5;

	world.process();

	entity3.clearComponent('TransformComponent');

	world.process();
});
