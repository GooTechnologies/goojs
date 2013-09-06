define([
	'goo/statemachine/FSMComponent',
	'goo/statemachine/Machine',
	'goo/statemachine/State'
], function(
	FSMComponent,
	Machine,
	State
) {
	'use strict';

	describe('FSMComponent', function() {
		var fsmComponent;
		beforeEach(function() {
			fsmComponent = new FSMComponent();
		});

		it('can run onEnter on initialisation', function() {
			var gotData1, gotData2;

			// set up machine 1
			var state1 = new State('entry');
			state1.actions = [{
				onEnter: function() { gotData1 = 123; },
				onExit: function() {},
				onUpdate: function() {}
			}];

			var machine1 = new Machine();
			machine1.addState(state1);


			// set up machine 2
			var state2 = new State('entry');
			state2.actions = [{
				onEnter: function() { gotData2 = 321; },
				onExit: function() {},
				onUpdate: function() {}
			}];
			var machine2 = new Machine();
			machine2.addState(state2);

			fsmComponent.machines.push(machine1, machine2);

			// init
			fsmComponent.init();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(321);
		});

		it('can run onUpdate', function() {
			var gotData1, gotData2;

			// set up machine 1
			var state1 = new State('entry');
			state1.actions = [{
				onEnter: function() {},
				onExit: function() {},
				onUpdate: function() { gotData1 = 123; }
			}];

			var machine1 = new Machine();
			machine1.addState(state1);


			// set up machine 2
			var state2 = new State('entry');
			state2.actions = [{
				onEnter: function() {},
				onExit: function() {},
				onUpdate: function() { gotData2 = 321; }
			}];
			var machine2 = new Machine();
			machine2.addState(state2);

			fsmComponent.machines.push(machine1, machine2);

			// init
			fsmComponent.init();

			// do update
			fsmComponent.update();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(321);
		});

		it('can transition on the same level', function() {
			var gotData1, gotData2, gotData3;

			// set up machine 1
			var state1 = new State('entry');
			state1.actions = [{
				onEnter: function() {},
				onExit: function() { gotData1 = 123; },
				onUpdate: function() { return 'second'; }
			}];

			var state2 = new State('second');
			state2.actions = [{
				onEnter: function() { gotData2 = 234; },
				onExit: function() {},
				onUpdate: function() { gotData3 = 345; }
			}];

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.machines.push(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(234);
			expect(gotData3).toBe(345);
		});

		it('can transition down', function() {
			var gotData1, gotData2, gotData3, gotData4, gotData5;

			// set up machine 1
			var state1 = new State('entry');
			state1.actions = [{
				onEnter: function() {},
				onExit: function() { gotData1 = 123; },
				onUpdate: function() { return 'second'; }
			}];

			var state2 = new State('second');
			state2.actions = [{
				onEnter: function() { gotData2 = 234; },
				onExit: function() {},
				onUpdate: function() { gotData3 = 345; }
			}];


			var state2_1 = new State('third');
			state2_1.actions = [{
				onEnter: function() { gotData4 = 456; },
				onExit: function() {},
				onUpdate: function() { gotData5 = 567; }
			}];

			state2.machines = [state2_1];

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.machines.push(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(234);
			expect(gotData3).toBe(345);
			expect(gotData4).toBe(456);
			expect(gotData5).toBe(567);
		});

		it('can transition up', function() {
			var gotData1 = 0, gotData2 = 0, gotData3 = 0, gotData4 = 0;

			// set up machine 1
			var state1 = new State('entry');
			state1.actions = [{
				onEnter: function() { gotData1 += 123; },
				onExit: function() {},
				onUpdate: function() { return 'second'; }
			}];

			var state2 = new State('second');
			state2.actions = [{
				onEnter: function() {},
				onExit: function() { gotData2 += 234; },
				onUpdate: function() {}
			}];


			var state2_1 = new State('third');
			state2_1.actions = [{
				onEnter: function() { gotData3 += 345; },
				onExit: function() { gotData4 += 456; },
				onUpdate: function() { return 'entry'; }
			}];

			state2.machines = [state2_1];

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.machines.push(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData1).toBe(123 * 2);
			expect(gotData2).toBe(234);
			expect(gotData3).toBe(345);
			expect(gotData4).toBe(456);
		});
	});
});
