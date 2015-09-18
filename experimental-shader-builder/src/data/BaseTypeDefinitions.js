define(function () {
	'use strict';

	/**
	 * Node types covering GLSL functions and operators
	 */

	return {
		vertex: {
			position: {
				description: '',
				id: 'position',
				inputs: [{
					name: 'position',
					type: 'vec4'
				}],
				outputs: [],
				body: 'gl_Position = position;'
			},
			pointSize: {
				description: '',
				id: 'pointSize',
				inputs: [{
					name: 'size',
					type: 'float'
				}],
				outputs: [],
				body: 'gl_PointSize = size;'
			},
			'external-output': {
				description: '',
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
				description: 'should be one vec4',
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
				id: 'const',
				description: 'float constant',
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
			vector2: {
				description: '',
				id: 'vector2',
				inputs: [],
				outputs: [{
					name: 'value',
					type: 'vec2'
				}],
				body: 'value = /*data.val*/;',
				defines: {
					value: {
						name: 'val',
						type: 'vec2',
						default: 'vec2(0.0)'
					}
				}
			},
			vector3: {
				description: '',
				id: 'vector3',
				inputs: [],
				outputs: [{
					name: 'value',
					type: 'vec3'
				}],
				body: 'value = /*data.val*/;',
				defines: {
					value: {
						name: 'val',
						type: 'vec3',
						default: 'vec3(0.0)'
					}
				}
			},
			vector4: {
				description: '',
				id: 'vector4',
				inputs: [],
				outputs: [{
					name: 'value',
					type: 'vec4'
				}],
				body: 'value = /*data.val*/;',
				defines: {
					value: {
						name: 'val',
						type: 'vec4',
						default: 'vec4(0.0)'
					}
				}
			},
			add: {
				id: 'add',
				description: 'Outputs the sum of x and y.',
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
				description: 'Outputs the difference of x and y: result = x - y',
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
				description: 'Outputs the product of x and y: product = x * y',
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
			scale: {  // schteppe: probably not going to be used - consts connected to multiply nodes is the thing
				description: 'multiply anything with a scalar',
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
				description: 'multiply a matrix with a vector',
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
			div: {
				description: 'divide 2 values of the same type',
				id: 'div',
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
				body: 'product = x / y;'
			},
			pow: {
				description: 'Outputs the power x ^ y.',
				id: 'pow',
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
					type: 'T',
					generic: true
				}],
				body: 'result = pow(x, y);'
			},
			normalize: {
				id: 'normalize',
				description: 'Normalizes the input vector so it gets length 1.',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = normalize(x);'
			},
			sqrt: {
				description: 'compute the square root',
				id: 'sqrt',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = sqrt(x);'
			},
			fract: {
				description: 'compute the fraction',
				id: 'fract',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = fract(x);'
			},
			log: {
				description: 'compute the logarithm',
				id: 'log',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = log(x);'
			},
			mod: {
				description: 'compute the modulus',
				id: 'mod',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = mod(x);'
			},
			abs: {
				description: 'Outputs the absolute value of the input.',
				id: 'abs',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = abs(x);'
			},
			ceil: {
				description: '',
				id: 'ceil',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = ceil(x);'
			},
			// todo: random
			// todo: rotator
			// todo: panner
			posterize: { // should this be here?
				id: 'posterize',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = ceil(x * /*data.steps*/) / /*data.steps*/;',
				defines: {
					value: {
						name: 'steps',
						type: 'float',
						default: '5.0'
					}
				}
			},
			round: {
				description: '',
				id: 'round',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = round(x);'
			},
			reflect: {
				description: '',
				id: 'reflect',
				inputs: [{
					name: 'v',
					type: 'T',
					generic: true
				}, {
					name: 'n',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = reflect(v, n);'
			},
			trunc: {
				description: '',
				id: 'trunc',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = trunc(x);'
			},
			floor: {
				description: '',
				id: 'floor',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = floor(x);'
			},
			step: {
				description: '',
				id: 'step',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'edge',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = step(edge, x);'
			},
			'if': {
				description: '',
				id: 'if',
				inputs: [{
					name: 'a',
					type: 'T',
					generic: true
				}, {
					name: 'b',
					type: 'T',
					generic: true
				}, {
					name: 'x',
					type: 'T',
					generic: true
				}, {
					name: 'y',
					type: 'T',
					generic: true
				}, {
					name: 'z',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'if (a > b) { result = x; } else if (a < b) { result = z; } else { result = y; }'
			},
			dot: {
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
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
				description: '',
				id: 'sin',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = sin(x);'
			},
			cos: {
				description: '',
				id: 'cos',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = cos(x);'
			},
			tan: {
				description: '',
				id: 'tan',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = tan(x);'
			},
			asin: {
				description: '',
				id: 'asin',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = asin(x);'
			},
			acos: {
				description: '',
				id: 'acos',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = acos(x);'
			},
			atan: {
				description: '',
				id: 'atan',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = atan(x);'
			},
			atan2: {
				description: '',
				id: 'atan2',
				inputs: [{
					name: 'y',
					type: 'T',
					generic: true
				}, {
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = atan2(y, x);'
			},
			sign: {
				description: '',
				id: 'sign',
				inputs: [{
					name: 'x',
					type: 'T',
					generic: true
				}],
				outputs: [{
					name: 'result',
					type: 'T',
					generic: true
				}],
				body: 'result = sign(x);'
			},
			texture2D: {
				description: '',
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
});
