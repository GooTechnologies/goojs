var InBoxAction = require('../../../../../src/goo/fsmpack/statemachine/actions/InBoxAction');
var Vector3 = require('../../../../../src/goo/math/Vector3');
var World = require('../../../../../src/goo/entities/World');
var State = require('../../../../../src/goo/fsmpack/statemachine/State');
var Machine = require('../../../../../src/goo/fsmpack/statemachine/Machine');
var StateMachineComponent = require('../../../../../src/goo/fsmpack/statemachine/StateMachineComponent');

describe('InBoxAction', function () {
	describe('Check pos against boxes', function () {

		var entity, world;
		beforeEach(function () {
			world = new World();
			entity = world.createEntity([0, 0, 0]);
		});

		it('box [0, 0, 0], [2, 2, 2] is inside at pos [1,1,1]', function () {
			var action = new InBoxAction({
				id: 'testId',
				settings: {
					point1: [0, 0, 0],
					point2: [2, 2, 2],
					transitions: {
						inside: 'toInsideTransition',
						outside: 'toOutsideTransition'
					}
				}
			});
			var state = new State({ id: 'state' });
			var machine = new Machine({ id: 'machine' });
			var component = new StateMachineComponent();
			entity.setComponent(component);
			component.addMachine(machine);
			state.addAction(action);
			machine.addState(state);

			entity.transformComponent.setTranslation(new Vector3(1, 1, 1));
			spyOn(action, 'sendEvent');

			action.update();

			expect(action.sendEvent).toHaveBeenCalledWith('inside');
		});

		it('box [0, 0, 0], [2, 2, 2] is outside at pos [3,3,3]', function () {
			var action = new InBoxAction({
				id: 'action',
				settings: {
					point1: [0, 0, 0],
					point2: [2, 2, 2],
					transitions: {
						inside: 'toInsideTransition',
						outside: 'toOutsideTransition'
					}
				}
			});
			var state = new State({ id: 'state' });
			var machine = new Machine({ id: 'machine' });
			var component = new StateMachineComponent();
			entity.setComponent(component);
			component.addMachine(machine);
			state.addAction(action);
			machine.addState(state);

			entity.transformComponent.setTranslation(new Vector3(3, 3, 3));
			spyOn(action, 'sendEvent');
			action.update();
			expect(action.sendEvent).toHaveBeenCalledWith('outside');
		});

		it('box [-90, -100, -100], [-110, 100, 100] is inside at pos [-100,0,0]', function () {
			var action = new InBoxAction({
				id: 'action',
				settings: {
					point1: [-90, -100, -100],
					point2: [-110, 100, 100],
					transitions: {
						inside: 'toInsideTransition',
						outside: 'toOutsideTransition'
					}
				}
			});
			var state = new State({ id: 'state' });
			var machine = new Machine({ id: 'machine' });
			var component = new StateMachineComponent();
			entity.setComponent(component);
			component.addMachine(machine);
			state.addAction(action);
			machine.addState(state);

			entity.transformComponent.setTranslation(new Vector3(-100, 0, 0));
			spyOn(action, 'sendEvent');
			action.update();
			expect(action.sendEvent).toHaveBeenCalledWith('inside');
		});
	});
});
