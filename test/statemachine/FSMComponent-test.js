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

		it('can run onEnter on initialisation on all machines', function() {
			var gotData1 = 0, gotData2 = 0;

			// set up machine 1
			var machine1 = new Machine();
			fsmComponent.addMachine(machine1);

			var state1 = new State('entry');
			machine1.addState(state1);

			state1.addAction({
				onEnter: function() { gotData1 += 123; },
				onExit: function() {},
				onUpdate: function() {}
			});


			// set up machine 2
			var machine2 = new Machine();
			fsmComponent.addMachine(machine2);

			var state2 = new State('entry');
			machine2.addState(state2);

			state2.addAction({
				onEnter: function() { gotData2 += 234; },
				onExit: function() {},
				onUpdate: function() {}
			});


			// init
			fsmComponent.init();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(234);
		});

		it('can run onEnter on initialisation only on the initial state', function() {
			var gotData1 = 0, gotData2 = 0;

			// set up machine 1
			var machine1 = new Machine();

			var state1 = new State('first');
			state1.addAction({
				onEnter: function() { gotData1 += 123; },
				onExit: function() {},
				onUpdate: function() {}
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() { gotData2 += 234; },
				onExit: function() {},
				onUpdate: function() {}
			});

			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

			// init
			fsmComponent.init();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(0);
		});

		it('can run onUpdate', function() {
			var gotData1 = 0, gotData2 = 0;

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() {},
				onExit: function() {},
				onUpdate: function() { gotData1 += 123; }
			});

			var machine1 = new Machine();
			machine1.addState(state1);


			// set up machine 2
			var state2 = new State('entry');
			state2.addAction({
				onEnter: function() {},
				onExit: function() {},
				onUpdate: function() { gotData2 += 234; }
			});
			var machine2 = new Machine();
			machine2.addState(state2);

			fsmComponent.addMachine(machine1);
			fsmComponent.addMachine(machine2);

			// init
			fsmComponent.init();

			// do update
			fsmComponent.update();

			expect(gotData1).toBe(123);
			expect(gotData2).toBe(234);
		});

		it('can transition on the same level', function() {
			var gotData1 = 0, gotData2 = 0, gotData3 = 0;

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData1 += 123; },
				onUpdate: function(proxy) { proxy.send('transition', 'second'); }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() { gotData2 += 234; },
				onExit: function() {},
				onUpdate: function() { gotData3 += 345; }
			});

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

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
			var gotData1 = 0, gotData2 = 0, gotData3 = 0, gotData4 = 0, gotData5 = 0;

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData1 += 123; },
				onUpdate: function(proxy) { proxy.send('transition', 'second'); }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() { gotData2 += 234; },
				onExit: function() {},
				onUpdate: function() { gotData3 += 345; }
			});


			var state2_1 = new State('third');
			state2_1.addAction({
				onEnter: function() { gotData4 += 456; },
				onExit: function() {},
				onUpdate: function() { gotData5 += 567; }
			});

			var machine1_1 = new Machine();
			machine1_1.addState(state2_1);

			state2.addMachine(machine1_1);

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

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
			state1.addAction({
				onEnter: function() { gotData1 += 123; },
				onExit: function() {},
				onUpdate: function(proxy) { proxy.send('transition', 'second'); }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() {},
				onExit: function() { gotData2 += 234; },
				onUpdate: function() {}
			});


			var state2_1 = new State('third');
			state2_1.addAction({
				onEnter: function() { gotData3 += 345; },
				onExit: function() { gotData4 += 456; },
				onUpdate: function(proxy) {proxy.send('transition', 'entry'); }
			});

			state2.addMachine(state2_1);

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

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

		it('cancels execution of onUpdate on transition', function() {
			var gotData = [0, 0, 0, 0, 0, 0];

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData[0] += 123; },
				onUpdate: function() { gotData[1] += 234; }
			});
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData[2] += 345; },
				onUpdate: function(proxy) { gotData[3] += 456; proxy.send('transition', 'second'); }
			});
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData[4] += 567; },
				onUpdate: function() { gotData[5] += 678; }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() {},
				onExit: function() {},
				onUpdate: function() {}
			});

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData[0]).toBe(123);
			expect(gotData[1]).toBe(234);
			expect(gotData[2]).toBe(345);
			expect(gotData[3]).toBe(456);
			expect(gotData[4]).toBe(567);
			expect(gotData[5]).toBe(0);
		});

		it('can transition down 2 levels', function() {
			var gotData = [0, 0, 0, 0, 0, 0, 0];

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() {},
				onExit: function() { gotData[0] += 123; },
				onUpdate: function(proxy) { proxy.send('transition', 'second'); }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() { gotData[1] += 234; },
				onExit: function() {},
				onUpdate: function() { gotData[2] += 345; }
			});
			// {
				var state2_1 = new State('third');
				state2_1.addAction({
					onEnter: function() { gotData[3] += 456; },
					onExit: function() {},
					onUpdate: function() { gotData[4] += 567; }
				});
			    // {
					var state2_1_1 = new State('fourth');
					state2_1_1.addAction({
						onEnter: function() { gotData[5] += 678; },
						onExit: function() {},
						onUpdate: function() { gotData[6] += 789; }
					});

					var machine1_1_1 = new Machine();
					machine1_1_1.addState(state2_1_1);
					state2_1.addMachine(machine1_1_1);

				var machine1_1 = new Machine();
				machine1_1.addState(state2_1);
				state2.addMachine(machine1_1);

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData[0]).toBe(123);
			expect(gotData[1]).toBe(234);
			expect(gotData[2]).toBe(345);
			expect(gotData[3]).toBe(456);
			expect(gotData[4]).toBe(567);
			expect(gotData[5]).toBe(678);
			expect(gotData[6]).toBe(789);
		});

		it('can transition up 2 levels', function() {
			var gotData = [0, 0, 0, 0, 0, 0, 0];

			// set up machine 1
			var state1 = new State('entry');
			state1.addAction({
				onEnter: function() { gotData[0] += 123; },
				onExit: function() { gotData[1] += 234; },
				onUpdate: function(proxy) { proxy.send('transition', 'second'); }
			});

			var state2 = new State('second');
			state2.addAction({
				onEnter: function() {},
				onExit: function() { gotData[2] += 345; },
				onUpdate: function() { gotData[3] += 456; }
			});
			// {
				var state2_1 = new State('third');
				state2_1.addAction({
					onEnter: function() {},
					onExit: function() { gotData[4] += 567; },
					onUpdate: function() { gotData[5] += 678; }
				});
				// {
					var state2_1_1 = new State('fourth');
					state2_1_1.addAction({
						onEnter: function() {},
						onExit: function() { gotData[6] += 789; },
						onUpdate: function(proxy) { proxy.send('transition', 'entry'); }
					});

				var machine1_1_1 = new Machine();
				machine1_1_1.addState(state2_1_1);
				state2_1.addMachine(machine1_1_1);

				var machine1_1 = new Machine();
				machine1_1.addState(state2_1);
				state2.addMachine(machine1_1);

			var machine1 = new Machine();
			machine1.addState(state1);
			machine1.addState(state2);

			fsmComponent.addMachine(machine1);

			// init
			fsmComponent.init();

			// jump to second state
			fsmComponent.update();

			// second state update
			fsmComponent.update();

			expect(gotData[0]).toBe(123 * 2);
			expect(gotData[1]).toBe(234);
			expect(gotData[2]).toBe(345);
			expect(gotData[3]).toBe(456);
			expect(gotData[4]).toBe(567);
			expect(gotData[5]).toBe(678);
			expect(gotData[6]).toBe(789);
		});
	});
});
