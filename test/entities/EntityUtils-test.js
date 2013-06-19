define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/EntityUtils'
], function(
	World,
	Entity,
	EntityUtils
) {
	'use strict';

	describe('EntityUtils', function() {
		var world;
		beforeEach(function() {
			world = new World();
			Entity.entityCount = 0;
		});
		it('createTypicalEntity', function() {
			var entity1 = EntityUtils.createTypicalEntity(world);
			var entity2 = EntityUtils.createTypicalEntity(world, undefined, 'myEnt');
			var entity3 = EntityUtils.createTypicalEntity(world);
			expect(entity1.toString()).toBe('Entity_0');
			expect(entity2.toString()).toBe('myEnt');
			expect(entity3.toString()).toBe('Entity_2');
		});
	});
});
