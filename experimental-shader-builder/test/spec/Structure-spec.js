(function () {
	'use strict';

	var Context = shaderBits.Context;
	var Connection = shaderBits.Connection;

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
				i_i: {
					id: 'i_i',
					inputs: [{
						name: 'a',
						type: 'int'
					}],
					outputs: [{
						name: 'b',
						type: 'int'
					}],
					defines: {}
				},
				f_f: { // float -> float
					id: 'f_f',
					inputs: [{
						name: 'a',
						type: 'float'
					}],
					outputs: [{
						name: 'b',
						type: 'float'
					}],
					defines: {}
				},
				s_s: { // T -> T; s stands for * (star); this is a function like `sin`
					id: 's_s',
					inputs: [{
						name: 'a',
						type: 'T',
						generic: true
					}],
					outputs: [{
						name: 'b',
						type: 'T',
						generic: true
					}],
					defines: {}
				},
				s_f: { // T -> float; example function `length`
					id: 's_f',
					inputs: [{
						name: 'a',
						type: 'T',
						generic: true
					}],
					outputs: [{
						name: 'b',
						type: 'float'
					}],
					defines: {}
				},
				ss_s: { // T x T -> T; example function `+`
					id: 'ss_s',
					inputs: [{
						name: 'a',
						type: 'T',
						generic: true
					}, {
						name: 'b',
						type: 'T',
						generic: true
					}],
					outputs: [{
						name: 'c',
						type: 'T',
						generic: true
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

			it('cannot connect a node to itself', function () {
				var sin = context.createSin();

				expect(function () {
					sin.connect(sin);
				}).toThrow(new Error('could not connect i2[s] to i2[x]; cannot have cycles'));
			});

			it('cannot create cycles', function () {
				var sin1 = context.createSin();
				var sin2 = context.createSin();

				sin1.connect(sin2);

				expect(function () {
					sin2.connect(sin1);
				}).toThrow(new Error('could not connect i3[s] to i2[x]; cannot have cycles'));
			});

			describe('type checking', function () {
				describe('resolving types', function () {
					it('accepts a connection from a fixed type to a fixed type', function () {
						var f_f1 = context.createF_f();
						var f_f2 = context.createF_f();

						expect(function () {
							context.structure._reflowTypes(f_f1, new Connection('b', f_f2.id, 'a'));
						}).not.toThrow();
					});

					it('rejects a connection from a fixed type to a (wrong) fixed type', function () {
						var f_f = context.createF_f();
						var i_i = context.createI_i();

						expect(function () {
							context.structure._reflowTypes(f_f, new Connection('b', i_i.id, 'a'));
						}).toThrow(new Error('could not match type float with type int'));
					});

					it('accepts a connection from an unresolved generic type to a fixed type', function () {
						var s_s = context.createS_s();
						var f_f = context.createF_f();

						expect(function () {
							context.structure._reflowTypes(s_s, new Connection('b', f_f.id, 'a'));
						}).not.toThrow();
					});

					it('accepts a connection from an unresolved generic type to a generic type', function () {
						var s_s1 = context.createS_s();
						var s_s2 = context.createS_s();

						expect(function () {
							context.structure._reflowTypes(s_s1, new Connection('b', s_s2.id, 'a'));
						}).not.toThrow();
					});

					it('rejects a connection from a fixed type to a resolved non-matching generic type', function () {
						var f_f = context.createF_f();
						var i_i = context.createI_i();
						var ss_s = context.createSs_s();

						context.structure._reflowTypes(f_f, new Connection('b', ss_s.id, 'a'));

						expect(function () {
							context.structure._reflowTypes(i_i, new Connection('b', ss_s.id, 'b'));
						}).toThrow(new Error('could not match int with already resolved generic type T of float'));
					});

					it('propagates a type and rejects a connection when a mismatch is found', function () {
						var f_f = context.createF_f();
						var s_s = context.createS_s();
						var i_i = context.createI_i();

						var connection = new Connection('b', i_i.id, 'a');
						context.structure._reflowTypes(s_s, connection);

						// manually adding the connection
						s_s.outputsTo.push(connection);

						expect(function () {
							context.structure._reflowTypes(f_f, new Connection('b', s_s.id, 'a'));
						}).toThrow(new Error('could not match type float with type int'));
					});
				});

				describe('unresolving types', function () {
					it('unresolves a resolved type', function () {
						var f_f = context.createF_f();
						var s_f = context.createS_f();

						var connection = new Connection('b', s_f.id, 'a');
						context.structure._reflowTypes(f_f, connection);

						// manually adding the connection
						s_f.outputsTo.push(connection);

						context.structure._unflowTypes(f_f, new Connection('b', s_f.id, 'a'));

						expect(s_f.resolvedTypes.size).toEqual(0);
					});

					it('unresolves a resolved type and propagates', function () {
						var f_f = context.createF_f();
						var s_s = context.createS_s();
						var s_f = context.createS_f();

						// wire up everything
						var connection1 = new Connection('b', s_s.id, 'a');
						context.structure._reflowTypes(f_f, connection1);

						// manually adding the connection
						f_f.outputsTo.push(connection1);


						var connection2 = new Connection('b', s_f.id, 'a');
						context.structure._unflowTypes(s_s, connection2);

						// manually adding the connection
						s_s.outputsTo.push(connection2);


						// remove a "vital" connection
						context.structure._unflowTypes(f_f, connection1);

						expect(s_f.resolvedTypes.size).toEqual(0);
					});

					it('partially unresolves a resolved type and does not propagate', function () {
						var f_f1 = context.createF_f();
						var f_f2 = context.createF_f();
						var ss_s = context.createSs_s();
						var s_f = context.createS_f();

						// wire up everything
						var connection1 = new Connection('b', ss_s.id, 'a');
						context.structure._reflowTypes(f_f1, connection1);

						// manually adding the connection
						f_f1.outputsTo.push(connection1);


						var connection2 = new Connection('b', ss_s.id, 'b');
						context.structure._reflowTypes(f_f2, connection2);

						// manually adding the connection
						f_f2.outputsTo.push(connection1);


						var connection3 = new Connection('c', s_f.id, 'a');
						context.structure._reflowTypes(ss_s, connection3);

						// manually adding the connection
						ss_s.outputsTo.push(connection3);


						// remove a "vital" connection
						context.structure._unflowTypes(s_f, connection1);

						expect(s_f.resolvedTypes.size).toEqual(1);
					});
				});
			});
		});
	});
})();
