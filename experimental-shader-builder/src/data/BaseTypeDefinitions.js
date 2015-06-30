(function () {
	'use strict';

	var BaseTypeDefinitions = {
		vertex: {
			position: {
				id: 'position',
				inputs: [{
					name: 'position',
					type: 'vec4'
				}],
				outputs: [],
				body: 'gl_Position = position;'
			},
			pointSize: {
				id: 'pointSize',
				inputs: [{
					name: 'size',
					type: 'float'
				}],
				outputs: [],
				body: 'gl_PointSize = size;'
			},
			'external-output': {
				id: 'external-output',
				inputs: [{
					name: 'value',
					type: 'T'
				}],
				outputs: []
			}
		},
		fragment: {
			fragColor: {
				id: 'fragColor',
				// should be one vec4
				inputs: [{
					name: 'color',
					type: 'vec4'
				}],
				outputs: [],
				body: 'gl_FragColor = color;'
			}
		},
		all: {
			const: {
				// float constant
				id: 'const',
				inputs: [],
				outputs: [{
					name: 'value',
					type: 'float'
				}],
				body: 'value = /*data.const*/;',
				defines: {
					value: {
						name: 'const',
						type: 'float',
						default: '1.0'
					}
				}
			},
			add: {
				// add 2 values of the same type
				id: 'add',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'sum',
					type: 'T',
					generic: true
				}],
				body: 'sum = x + y;'
			},
			sub: {
				// subtract 2 values of the same type
				id: 'sub',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'sum',
					type: 'T',
					generic: true
				}],
				body: 'sum = x - y;'
			},
			mul: {
				// multiply 2 values of the same type
				id: 'mul',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'product',
					type: 'T',
					generic: true
				}],
				body: 'product = x * y;'
			},
			scale: {
				// multiply anything with a scalar
				id: 'scale',
				inputs: [{
					name: 'data',
					type: 'T',
					generic: true
				}, {
					name: 'scalar',
					type: 'float'
				}],
				outputs: [{
					name: 'scaled',
					type: 'T',
					generic: true
				}],
				body: 'scaled = data * scalar;'
			},
			mulMV: {
				// multiply a matrix with a vector
				id: 'mulMV',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'U',
					generic: true
				}],
				outputs: [{
					name: 'product',
					type: 'U',
					generic: true
				}],
				body: 'product = x * y;'
			},
			dot: {
				id: 'dot',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'float'
				}],
				body: 'result = dot(x, y) * /*data.multiplier*/;',
				defines: {
					multiplier: {
						name: 'multiplier',
						type: 'float',
						default: '1.0'
					}
				}
			},
			cross: {
				id: 'cross',
				inputs: [{
					name: 'x',
					type: 'vec3'
				}, {
					name: 'y',
					type: 'vec3'
				}],
				outputs: [{
					name: 'result',
					type: 'vec3'
				}],
				body: 'result = cross(x, y);'
			},
			length: {
				id: 'length',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'float'
				}],
				body: 'result = length(x);'
			},
			distance: {
				id: 'distance',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'float'
				}],
				body: 'result = distance(x, y);'
			},
			min: {
				id: 'min',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'm',
					type: 'T',
					generic: true
				}],
				body: 'm = min(x, y);'
			},
			max: {
				id: 'max',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'm',
					type: 'T',
					generic: true
				}],
				body: 'm = max(x, y);'
			},
			clamp: {
				id: 'clamp',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'minVal',
					type: 'T',
					generic: true
				}, {
					name: 'maxVal',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'clamped',
					type: 'T',
					generic: true
				}],
				body: 'clamped = clamp(x, minVal, maxVal);'
			},
			mix: {
				id: 'mix',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}, {
					name: 'alpha',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'between',
					type: 'T',
					generic: true
				}],
				body: 'between = mix(x, y, alpha);'
			},
			sin: {
				id: 'sin',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'float'
				}],
				body: 'result = (sin(x) + 1.0) * 0.5 * (/*data.max*/ - /*data.min*/) + /*data.min*/;',
				defines: {
					min: {
						name: 'min',
						type: 'float',
						default: '-1.0'
					},
					max: {
						name: 'max',
						type: 'float',
						default: '1.0'
					}
				}
			},
			texture2D: {
				id: 'texture2D',
				inputs: [{
					name: 'sampler',
					type: 'sampler2D'
				}, {
					name: 'coords',
					type: 'vec2'
				}],
				outputs: [{
					name: 'result',
					type: 'vec4'
				}],
				body: 'result = texture2D(sampler, coords);'
			}
		}
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.BaseTypeDefinitions = BaseTypeDefinitions;
})();
