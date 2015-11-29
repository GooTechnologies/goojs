	describe('EntitySelection', function () {
		function someEntity() {
			return world.createEntity();
		}

		function someEntities(n) {
			var entities = [];
			for (var i = 0; i < n; i++) {
				entities.push(someEntity());
			}
			return entities;
		}

		var world;

		beforeEach(function () {
			world = new World();
			world.registerComponent(TransformComponent);
		});

		describe('constructor', function () {
//			it('constructs an empty selection if given no parameters', function () {
//
//			});
		});

		describe('children', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.children(someEntity());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

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
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.parent(someEntity());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('does not allow duplicates entities when getting parents', function () {
				var parent = world.createEntity();
				var child1 = world.createEntity();
				var child2 = world.createEntity();

				parent.attachChild(child1);
				parent.attachChild(child2);

				var selection = new EntitySelection(child1, child2);

				var parents = selection.parent();

				expect(parents.contains(parent)).toBeTruthy();
				expect(parents.size()).toEqual(1);
			});

			it('gets a list of parent entities of a multiple entity selection', function () {
				var parent1 = world.createEntity();
				var parent2 = world.createEntity();
				var parent3 = world.createEntity();
				var child11 = world.createEntity();
				var child12 = world.createEntity();
				var child31 = world.createEntity();

				parent1.attachChild(child11);
				parent1.attachChild(child12);
				parent3.attachChild(child31);

				var selection = new EntitySelection(child11, child12, child31);

				var parents = selection.parent();

				expect(parents.contains(parent1)).toBeTruthy();
				expect(parents.contains(parent2)).toBeFalsy();
				expect(parents.contains(parent3)).toBeTruthy();
				expect(parents.contains(child11)).toBeFalsy();
				expect(parents.contains(child12)).toBeFalsy();
				expect(parents.contains(child31)).toBeFalsy();
			});
		});

		describe('and', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.and(someEntity());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('concatenates two selections with common elements', function () {
				var entities = someEntities(7);
				var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
				var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

				var selection = new EntitySelection(array1);
				selection.and(array2);

				array1.forEach(function (entity) {
					expect(selection.contains(entity)).toBeTruthy();
				});

				array2.forEach(function (entity) {
					expect(selection.contains(entity)).toBeTruthy();
				});

				expect(selection.size()).toEqual(7);
			});
		});

		describe('intersects', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.intersects(someEntity());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('intersects two selection with common entities', function () {
				var entities = someEntities(7);
				var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
				var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

				var selection = new EntitySelection(array1);
				selection.intersects(array2);

				expect(selection.contains(entities[2])).toBeTruthy();
				expect(selection.contains(entities[3])).toBeTruthy();
				expect(selection.contains(entities[4])).toBeTruthy();

				expect(selection.size()).toEqual(3);
			});
		});

		describe('without', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.without(someEntity());
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('subtracts a collection from another', function () {
				var entities = someEntities(7);
				var array1 = [entities[0], entities[1], entities[2], entities[3], entities[4]];
				var array2 = [entities[2], entities[3], entities[4], entities[5], entities[6]];

				var selection = new EntitySelection(array1);
				selection.without(array2);

				expect(selection.contains(entities[0])).toBeTruthy();
				expect(selection.contains(entities[1])).toBeTruthy();

				expect(selection.size()).toEqual(2);
			});
		});

		describe('andSelf', function () {
			it('returns itself when applied to an empty selection', function () {
				var selection = new EntitySelection();
				selection.andSelf();
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('returns itself when applied to an selection that has only one stack entry', function () {
				var selection = new EntitySelection(someEntities(5));
				selection.andSelf();
				expect(selection).toEqual(selection);
				expect(selection).toBe(selection);
			});

			it('add the previous selection to the current one', function () {
				var entities = someEntities(5);
				var children = [];

				var selection = new EntitySelection(entities);
				// attach some children
				selection.each(function (entity) {
					var child = someEntity();
					children.push(child);
					entity.attachChild(child);
				});

				// get those children // very artificial test
				selection.children();

				selection.andSelf();

				entities.forEach(function (entity) {
					expect(selection.contains(entity)).toBeTruthy();
					expect(selection.contains(entity.children().first())).toBeTruthy();
				});

				expect(selection.size()).toEqual(entities.length * 2);
			});
		});
	});
