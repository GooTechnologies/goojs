var Machine = require('../../../../src/goo/fsmpack/statemachine/Machine');
var State = require('../../../../src/goo/fsmpack/statemachine/State');
var StateMachineComponent = require('../../../../src/goo/fsmpack/statemachine/StateMachineComponent');
var Action = require('../../../../src/goo/fsmpack/statemachine/actions/Action');

describe('StateMachineComponent', function () {

	var component;
	beforeEach(function () {
		component = new StateMachineComponent();
	});

	function createAction(methods, id) {
		function TestAction() {
			Action.apply(this, arguments);
		}
		TestAction.prototype = Object.create(Action.prototype);
		TestAction.prototype.constructor = TestAction;
		TestAction.external = {
			key: 'TestAction',
			name: 'TestAction',
			type: 'test',
			description: '',
			parameters: [],
			transitions: []
		};
		for (var key in methods) {
			TestAction.prototype[key] = methods[key];
		}
		return new TestAction({ id: id||'testActionId' });
	}

	it('enters, updates and exits all actions in all machines', function () {
		var action1enter = 0;
		var action2enter = 0;
		var action3enter = 0;
		var action1update = 0;
		var action2update = 0;
		var action3update = 0;
		var action1exit = 0;
		var action2exit = 0;
		var action3exit = 0;

		// set up machine 1
		var action1 = createAction({
			enter: function () { action1enter++; },
			update: function () { action1update++; },
			exit: function () { action1exit++; }
		});
		var state1 = new State({
			actions: [action1]
		});
		var machine1 = new Machine({
			asyncMode: true,
			states: [state1],
			initialState: state1
		});
		component.addMachine(machine1);


		// set up machine 2
		var action2 = createAction({
			enter: function () { action2enter++; },
			update: function () { action2update++; },
			exit: function () { action2exit++; }
		});
		var action3 = createAction({
			enter: function () { action3enter++; },
			update: function () { action3update++; },
			exit: function () { action3exit++; }
		});
		var state2 = new State({
			actions: [action2, action3]
		});
		var machine2 = new Machine({
			asyncMode: true,
			states: [state2],
			initialState: state2
		});
		component.addMachine(machine2);


		component.init();
		component.enter();

		expect(action1enter).toBe(1);
		expect(action2enter).toBe(1);
		expect(action3enter).toBe(1);
		expect(action1update).toBe(0);
		expect(action2update).toBe(0);
		expect(action3update).toBe(0);
		expect(action1exit).toBe(0);
		expect(action2exit).toBe(0);
		expect(action3exit).toBe(0);

		component.update();

		expect(action1enter).toBe(1);
		expect(action2enter).toBe(1);
		expect(action3enter).toBe(1);
		expect(action1update).toBe(1);
		expect(action2update).toBe(1);
		expect(action3update).toBe(1);
		expect(action1exit).toBe(0);
		expect(action2exit).toBe(0);
		expect(action3exit).toBe(0);

		component.exit();

		expect(action1enter).toBe(1);
		expect(action2enter).toBe(1);
		expect(action3enter).toBe(1);
		expect(action1update).toBe(1);
		expect(action2update).toBe(1);
		expect(action3update).toBe(1);
		expect(action1exit).toBe(1);
		expect(action2exit).toBe(1);
		expect(action3exit).toBe(1);
	});

	it('runs enter on the initial state only', function () {
		var gotData1 = 0;
		var gotData2 = 0;

		var action1 = createAction({
			enter: function () { gotData1 += 123; }
		});
		var state1 = new State({
			actions: [action1]
		});
		var action2 = createAction({
			enter: function () { gotData2 += 234; }
		});
		var state2 = new State({
			actions: [action2]
		});

		var machine1 = new Machine({
			asyncMode: true,
			states: [state1, state2],
			initialState: state1
		});

		component.addMachine(machine1);

		component.init();
		component.enter();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(0);
	});

	it('can transition on the same level', function () {
		var gotData1 = 0;
		var gotData2 = 0;
		var gotData3 = 0;

		// set up machine 1
		var machine = new Machine({
			asyncMode: true
		});
		var state1 = new State({
			id: 'entry'
		});
		machine.addState(state1);
		machine.setState(state1);
		machine.setInitialState(state1);

		var action = new Action({
			transitions: {
				toSecondEvent: 'toSecond'
			}
		});
		action.update = function () {
			this.sendEvent('toSecondEvent');
		};
		action.exit = function () {
			gotData1 += 123;
		};
		state1.addAction(action);

		var state2 = new State({ id: 'second' });
		machine.addState(state2);
		state2.addAction({
			ready: function () {},
			enter: function () {
				gotData2 += 234;
			},
			exit: function () {},
			update: function () {
				gotData3 += 345;
			}
		});

		state1.setTransition('toSecond', state2);

		component.addMachine(machine);

		// init
		component.init();
		component.enter();

		// jump to second state
		component.update();

		// second state update
		component.update();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
		expect(gotData3).toBe(345);
	});

	it('cancels execution of update on transition', function () {
		var gotData = [0, 0, 0, 0, 0, 0];

		// set up machine 1
		var state1 = new State({
			id: 'entry'
		});
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[0] += 123; },
			update: function () { gotData[1] += 234; }
		});
		var action = new Action({
			transitions: {
				toSecondEvent: 'toSecond'
			}
		});
		action.exit = function () {
			gotData[2] += 345;
		};
		action.update = function () {
			gotData[3] += 456;
			this.sendEvent('toSecondEvent');
		}
		state1.addAction(action);
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () { gotData[4] += 567; },
			update: function () { gotData[5] += 678; }
		});

		var state2 = new State({
			id: 'second'
		});
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () {}
		});

		var machine1 = new Machine({
			asyncMode: true
		});
		machine1.addState(state1);
		machine1.setInitialState(state1);
		machine1.addState(state2);

		state1.setTransition('toSecond', state2);

		component.addMachine(machine1);

		// init
		component.init();
		component.enter();

		// jump to second state
		component.update();

		// second state update
		component.update();

		expect(gotData[0]).toBe(123);
		expect(gotData[1]).toBe(234);
		expect(gotData[2]).toBe(345);
		expect(gotData[3]).toBe(456);
		expect(gotData[4]).toBe(567);
		expect(gotData[5]).toBe(0);
	});
});
