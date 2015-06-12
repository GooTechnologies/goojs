(function () {
	'use strict';

	var Context = shaderBits.Context;

	describe('Structure', function () {
		describe('Connections', function () {
			var context;

			beforeAll(function () {
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

			// cannot connect a node to itself
			// cannot connect an input node
			// cannot have a connection to a busy inPort
			// cannot connect to a node of a different type
		});
	});
})();
