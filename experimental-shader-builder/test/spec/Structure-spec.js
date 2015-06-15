(function () {
	'use strict';

	var Context = shaderBits.Context;

	describe('Structure', function () {
		describe('Connections', function () {
			var context;
			var typeDefinitions = {
				const: {
					id: 'const',
					inputs: [],
					outputs: [{
						name: 'value',
						type: 'float'
					}],
					defines: {}
				},
				sin: {
					id: 'sin',
					inputs: [{
						name: 'x',
						type: 'float'
					}],
					outputs: [{
						name: 's',
						type: 'float'
					}],
					defines: {}
				},
				out: {
					id: 'out',
					inputs: [{
						name: 'x',
						type: 'float'
					}],
					outputs: [],
					defines: {}
				}
			};

			beforeEach(function () {
				context = new Context(typeDefinitions);
			});

			it('can connect 2 nodes', function () {
				var konst = context.createConst();
				var sin = context.createSin();

				konst.connect(sin);

				var structure = context.structureToJSON();
				expect(structure[1].outputsTo).toEqual([{
					output: 'value',
					to: sin.id,
					input: 'x'
				}]);
			});

			it('cannot connect an input node', function () {
				var sin1 = context.createSin();
				var sin2 = context.createSin();

				expect(function () {
					sin1.x.connect(sin2);
				}).toThrow();
			});

			it('cannot connect to an output node', function () {
				var konst = context.createConst();
				var sin = context.createSin();

				expect(function () {
					sin.connect(konst);
				}).toThrow();
			});

			it('cannot have a connection to a busy InPort', function () {
				var konst1 = context.createConst();
				var konst2 = context.createConst();
				var sin = context.createSin();

				konst1.connect(sin);

				expect(function () {
					konst2.connect(sin);
				}).toThrow(new Error('could not connect i3[value] to i4[x]; input x is already occupied'));
			});

			// cannot connect a node to itself
			// cannot connect an input node
			// cannot have a connection to a busy inPort
			// cannot connect to a node of a different type
			// cannot create a cycle
		});
	});
})();
