define([
	'goo/entities/EntitySelection',
	'goo/entities/World',
	'goo/entities/components/TransformComponent'
], function (
	EntitySelection,
	World,
	TransformComponent
) {
	'use strict';

	describe('EntitySelection', function () {
		var world;

		beforeEach(function () {
			world = new World();
			world.registerComponent(TransformComponent);
		});

		describe('constructor', function () {
//			it('constructs an empty selection if given no parameters', function() {
//
//			});
		});

		describe('children', function () {
			it('gets a selection of child entities of a one entity selection', function () {
				var parent = world.createEntity();
				var child1 = world.createEntity();
				var child2 = world.createEntity();

				parent.attachChild(child1);
				parent.attachChild(child2);

				var selection = new EntitySelection(parent);

				var children = selection.children();

				expect(children.contains(parent)).toBeFalsy();
				expect(children.contains(child1)).toBeTruthy();
				expect(children.contains(child2)).toBeTruthy();
			});

			it('gets a selection of child entities of a multiple entity selection', function () {
				var parent1 = world.createEntity();
				var parent2 = world.createEntity();
				var parent3 = world.createEntity();
				var child11 = world.createEntity();
				var child12 = world.createEntity();
				var child31 = world.createEntity();

				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent3.attachChild(child31);

				var selection = new EntitySelection(parent1, parent2, parent3);

				var children = selection.children();

				expect(children.contains(parent1)).toBeFalsy();
				expect(children.contains(parent2)).toBeFalsy();
				expect(children.contains(parent3)).toBeFalsy();
				expect(children.contains(child11)).toBeTruthy();
				expect(children.contains(child12)).toBeTruthy();
				expect(children.contains(child31)).toBeTruthy();
			});
		});

		describe('parent', function () {
			it('gets a list of child entities of a one entity selection', function () {
				var parent = world.createEntity();
				var child1 = world.createEntity();
				var child2 = world.createEntity();

				parent.attachChild(child1);
				parent.attachChild(child2);

				var selection = new EntitySelection(parent);

				var children = selection.children();

				expect(children.contains(parent)).toBeFalsy();
				expect(children.contains(child1)).toBeTruthy();
				expect(children.contains(child2)).toBeTruthy();
			});

			it('gets a list of child entities of a multiple entity selection', function () {
				var parent1 = world.createEntity();
				var parent2 = world.createEntity();
				var parent3 = world.createEntity();
				var child11 = world.createEntity();
				var child12 = world.createEntity();
				var child31 = world.createEntity();

				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent3.attachChild(child31);

				var selection = new EntitySelection(parent1, parent2, parent3);

				var children = selection.children();

				expect(children.contains(parent1)).toBeFalsy();
				expect(children.contains(parent2)).toBeFalsy();
				expect(children.contains(parent3)).toBeFalsy();
				expect(children.contains(child11)).toBeTruthy();
				expect(children.contains(child12)).toBeTruthy();
				expect(children.contains(child31)).toBeTruthy();
			});
		});
	});
});
