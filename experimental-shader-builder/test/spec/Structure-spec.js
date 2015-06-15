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
				add: {
					id: 'add',
					inputs: [{
						name: 'x',
						type: 'float'
					}, {
						name: 'y',
						type: 'float'
					}],
					outputs: [{
						name: 'sum',
						type: 'float'
					}],
					defines: {}
				},
				div: {
					id: 'div',
					inputs: [{
						name: 'x',
						type: 'float'
					}, {
						name: 'y',
						type: 'float'
					}],
					outputs: [{
						name: 'quot',
						type: 'float'
					}, {
						name: 'rem',
						type: 'float'
					}],
					defines: {}
				},
				vec2: {
					id: 'vec2',
					inputs: [{
						name: 'x',
						type: 'float'
					}, {
						name: 'y',
						type: 'float'
					}],
					outputs: [{
						name: 'vector',
						type: 'vec2'
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

			it('cannot have a connection to a busy input', function () {
				var konst1 = context.createConst();
				var konst2 = context.createConst();
				var sin = context.createSin();

				konst1.connect(sin);

				expect(function () {
					konst2.connect(sin);
				}).toThrow(new Error('could not connect i3[value] to i4[x]; input "x" is already occupied'));
			});

			it('cannot call .connect on a node with multiple outputs', function () {
				var div = context.createDiv();
				var sin = context.createSin();

				expect(function () {
					div.connect(sin);
				}).toThrow();
			});

			it('cannot connect to a node with multiple inputs', function () {
				var sin = context.createSin();
				var add = context.createAdd();

				expect(function () {
					sin.connect(add);
				}).toThrow();
			});

			it('cannot connect inputs of different types', function () {
				var vec2 = context.createVec2();
				var sin = context.createSin();

				expect(function () {
					vec2.connect(sin);
				}).toThrow(new Error('could not connect i2[vector] to i3[x]; could not match output "vector" of type vec2 with input "x" of type float'));
			});

			// cannot connect a node to itself
			// cannot create a cycle
		});
	});
})();
