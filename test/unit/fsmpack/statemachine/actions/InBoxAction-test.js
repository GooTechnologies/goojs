var InBoxAction = require('../../../../../src/goo/fsmpack/statemachine/actions/InBoxAction');
var Vector3 = require('../../../../../src/goo/math/Vector3');
var World = require('../../../../../src/goo/entities/World');

describe('InBoxAction', function () {
	describe('Check pos against boxes', function () {
		var inBoxAction;
		var fakeFunc = function () {};

		var mockFsm = {
			send: fakeFunc
		};

		var entity, world;

		beforeEach(function () {
			world = new World();
			entity = world.createEntity([0,0,0]);
			mockFsm.entity = entity;
			mockFsm.getOwnerEntity = function () {
				return entity;
			};
		});

		it('box [0, 0, 0], [2, 2, 2] is inside at pos [1,1,1]', function () {
			var settings = {
				point1: [0, 0, 0],
				point2: [2, 2, 2],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}

			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(1, 1, 1));
			spyOn(mockFsm, 'send');

			inBoxAction.update(mockFsm);

			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.inside);
		});

		it('box [0, 0, 0], [2, 2, 2] is outside at pos [3,3,3]', function () {
			var settings = {
				point1: [0, 0, 0],
				point2: [2, 2, 2],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}
			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(3, 3, 3));
			spyOn(mockFsm, 'send');
			inBoxAction.update(mockFsm);
			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.outside);
		});

		it('box [-90, -100, -100], [-110, 100, 100] is inside at pos [-100,0,0]', function () {
			var settings = {
				point1: [-90, -100, -100],
				point2: [-110, 100, 100],
				transitions: {
					inside: 'toInsideTransition',
					outside: 'toOutsideTransition'
				}
			};

			inBoxAction = new InBoxAction('testId', settings);

			entity.transformComponent.setTranslation(new Vector3(-100, 0, 0));
			spyOn(mockFsm, 'send');
			inBoxAction.update(mockFsm);
			expect(mockFsm.send).toHaveBeenCalledWith(settings.transitions.inside);
		});
	});
});
