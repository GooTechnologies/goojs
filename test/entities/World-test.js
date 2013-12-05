define([
	'goo/entities/World'
], function(
	World
) {
	'use strict';

	describe('systems', function() {
		it ('adds a system with default priority to the world', function() {
			var world = new World();

			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };

			world.setSystem(systemA);
			world.setSystem(systemB);

			expect(world._systems).toEqual([systemA, systemB]);
		});
		it ('adds a system with high priority to the world', function() {
			var world = new World();

			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };
			var systemC = { type: 'B', priority: -1 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemC, systemA, systemB]);
		});
		it ('adds a system with low priority to the world', function() {
			var world = new World();

			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };
			var systemC = { type: 'C', priority: 5 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemA, systemB, systemC]);
		});
		it ('adds a system with medium priority to the world', function() {
			var world = new World();

			var systemA = { type: 'A', priority: 3 };
			var systemB = { type: 'B', priority: 1 };
			var systemC = { type: 'C', priority: 2 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemB, systemC, systemA]);
		});
	});
});