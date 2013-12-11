define([
	'goo/entities/World',
	'goo/entities/systems/System',
	'goo/entities/components/Component'
], function(
	World,
	System,
	Component
) {
	'use strict';

	describe('systems', function() {
		var world;
		beforeEach(function() {
			world = new World();
		});

		it ('adds a system with default priority to the world', function() {
			var systemA = { type: 'A', priority: 0 };
			var systemB = { type: 'B', priority: 0 };

			world.setSystem(systemA);
			world.setSystem(systemB);

			expect(world._systems).toEqual([systemA, systemB]);
		});
		it ('adds a system with high priority to the world', function() {
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
			var systemA = { type: 'A', priority: 3 };
			var systemB = { type: 'B', priority: 1 };
			var systemC = { type: 'C', priority: 2 };

			world.setSystem(systemA);
			world.setSystem(systemB);
			world.setSystem(systemC);

			expect(world._systems).toEqual([systemB, systemC, systemA]);
		});

		it('clears a nonexistent component and notifies other systems of the change', function() {
			var called = 0;

			// Cucumber system
			function CucumberSystem() {
				System.call(this, 'CucumberSystem', ['CucumberComponent']);
			}

			CucumberSystem.prototype = Object.create(System.prototype);

			CucumberSystem.prototype.updated = function(entity, component) {
				called += 1;
			};

			// Cucumber component
			function CucumberComponent() {
				this.type = 'CucumberComponent';
			}

			CucumberComponent.prototype = Object.create(Component.prototype);


			var cucumberSystem = new CucumberSystem();
			var cucumberComponent = new CucumberComponent();
			var entity = world.createEntity();
			world.setSystem(cucumberSystem);
			entity.setComponent(cucumberComponent);
			world.process();
			entity.clearComponent('PickleComponent');
			world.process();
			expect(called).toBe(0);
		});
	});
});