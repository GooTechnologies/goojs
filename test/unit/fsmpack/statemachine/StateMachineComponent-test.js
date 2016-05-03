var Machine = require('../../../../src/goo/fsmpack/statemachine/Machine');
var State = require('../../../../src/goo/fsmpack/statemachine/State');
var StateMachineComponent = require('../../../../src/goo/fsmpack/statemachine/StateMachineComponent');
var Action = require('../../../../src/goo/fsmpack/statemachine/actions/Action');

describe('StateMachineComponent', function () {

	var component;
	beforeEach(function () {
		component = new StateMachineComponent();
	});

	it('can run enter on init on all machines', function () {
		var gotData1 = 0;
		var gotData2 = 0;

		// set up machine 1
		var machine1 = new Machine({
			asyncMode: true
		});
		component.addMachine(machine1);

		var state1 = new State({
			id: 'entry'
		});
		machine1.addState(state1);
		machine1.setInitialState(state1);

		state1.addAction({
			ready: function () {},
			enter: function () { gotData1 += 123; },
			exit: function () {},
			update: function () {}
		});


		// set up machine 2
		var machine2 = new Machine({
			asyncMode: true
		});
		component.addMachine(machine2);

		var state2 = new State({
			id: 'entry'
		});
		machine2.addState(state2);
		machine2.setInitialState(state2);

		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () {}
		});


		// init
		component.init();
		component.doEnter();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
	});

	it('can run enter on init only on the initial state', function () {
		var gotData1 = 0, gotData2 = 0;

		// set up machine 1
		var machine1 = new Machine({
			asyncMode: true
		});

		var state1 = new State({
			id: 'first'
		});
		state1.addAction({
			ready: function () {},
			enter: function () { gotData1 += 123; },
			exit: function () {},
			update: function () {}
		});

		var state2 = new State({
			id: 'second'
		});
		state2.addAction({
			ready: function () {},
			enter: function () { gotData2 += 234; },
			exit: function () {},
			update: function () {}
		});

		machine1.addState(state1);
		machine1.addState(state2);
		machine1.setInitialState(state1);

		component.addMachine(machine1);

		// init
		component.init();
		component.doEnter();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(0);
	});

	it('can run update', function () {
		var gotData1 = 0, gotData2 = 0;

		// set up machine 1
		var state1 = new State({ id: 'entry' });
		state1.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () { gotData1 += 123; }
		});

		var machine1 = new Machine({
			asyncMode: true
		});
		machine1.addState(state1);
		machine1.setInitialState(state1);


		// set up machine 2
		var state2 = new State({ id: 'entry' });
		state2.addAction({
			ready: function () {},
			enter: function () {},
			exit: function () {},
			update: function () { gotData2 += 234; }
		});
		var machine2 = new Machine({
			asyncMode: true
		});
		machine2.addState(state2);
		machine2.setInitialState(state2);

		component.addMachine(machine1);
		component.addMachine(machine2);

		// init
		component.init();
		component.doEnter();

		// do update
		component.update();

		expect(gotData1).toBe(123);
		expect(gotData2).toBe(234);
	});

	it('can transition on the same level', function () {
		var gotData1 = 0, gotData2 = 0, gotData3 = 0;

		// set up machine 1
		var machine1 = new Machine({
			id: 'machine1',
			asyncMode: true
		});
		var state1 = new State({
			id: 'entry'
		});
		machine1.addState(state1);
		machine1.setState(state1);
		machine1.setInitialState(state1);

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

		var state2 = new State({
			id: 'second'
		});
		machine1.addState(state2);
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

		component.addMachine(machine1);

		// init
		component.init();
		component.doEnter();

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
		component.doEnter();

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
