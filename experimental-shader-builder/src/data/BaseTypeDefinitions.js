(function () {
	'use strict';

	var BaseTypeDefinitions = {
		vertex: {
			position: {
				id: 'position',
				inputs: [{
					name: 'x',
					type: 'float'
				}, {
					name: 'y',
					type: 'float'
				}, {
					name: 'z',
					type: 'float'
				}, {
					name: 'w',
					type: 'float'
				}],
				outputs: [],
				body: 'gl_Position = vec4(x, y, z, w);'
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
					name: 'r',
					type: 'float'
				}, {
					name: 'g',
					type: 'float'
				}, {
					name: 'b',
					type: 'float'
				}],
				outputs: [],
				body: 'gl_FragColor = vec4(r, g, b, 1.0);'
			}
		},
		all: {
			'const': {} // ?
		}
	};

	window.shaderBits = window.shaderBits || {};
	window.shaderBits.BaseTypeDefinitions = BaseTypeDefinitions;
})();
