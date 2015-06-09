define([
],
/** @lends */
function (
) {
	"use strict";

	return {
		'id': 'defaultConfig',

		'color': {
			'value': [1, 1, 1, 1],
			'type': 'color'
		},
		'size': {
			'value': [0.3, 0.3],
			'type': 'range',
			'min': 0.0,
			'max': 2.0
		},
		'rotation': {
			'value': [0, 360],
			'type': 'range',
			'min': 0.0,
			'max': 6.29
		},
		'growth': {
			'value': [0.0, 0.0],
			'type': 'range',
			'min': -1.0,
			'max': 1.0
		},
		'spin': {
			'value': [-1, 1],
			'type': 'range',
			'min': -5.0,
			'max': 5.0
		},
		'lifespan': {
			'value': [1, 4],
			'type': 'range',
			'min': 0.0,
			'max': 5.0
		},
		'damping': {
			'value': 0.4,
			'type': 'number',
			'min': 0.0,
			'max': 2.0
		},
		'skipFade': {
			'value': true,
			'type': 'boolean'
		},
		'eternal': {
			'value': true,
			'type': 'boolean'
		},
		'follow': {
			'value': 'box',
			'type': 'string'
		},
		'followType': {
			'value': 'Mesh',
			'type': 'option',
			'values': ['Mesh', 'Joint'],
			'texts': ['Mesh', 'Joint']
		},
		'poolCount': 100,

		'spawner': {
			'value': 'meshSpawner',
			'type': 'option',
			'values': ['sphereSpawner', 'randomSpawner', 'meshSpawner'],
			'texts': ['sphereSpawner', 'randomSpawner', 'meshSpawner']
		},
		'behaviors': [
			// 'flockcenter2'
			'meshFollower'
		],
		'renderers': {
			'ParticleRenderer': {
				'enabled': true,
				'settings': {
					'textureUrl': {
						'value': null,
						'type': 'texture'
					},
					'tile': {
						'enabled': {
							'value': false,
							'type': 'boolean'
						},
						'tileCountX': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'tileCountY': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'loopScale': {
							'value': 1,
							'type': 'number',
							'step': 0.1,
							'decimals': 1
						},
						'value': true,
						'type': 'tile'
					},
					'blending': {
						'value': 'AdditiveBlending',
						'type': 'option',
						'values': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending'],
						'texts': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending']
					},
					'alphakill': {
						'value': 0,
						'type': 'number',
						'min': 0.0,
						'max': 1.0
					},
					'poolCount': 500
				}
			},
			'TrailRenderer': {
				'enabled': true,
				'settings': {
					'textureUrl': {
						'value': null,
						'type': 'texture'
					},
					'tile': {
						'enabled': {
							'value': false,
							'type': 'boolean'
						},
						'tileCountX': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'tileCountY': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'loopScale': {
							'value': 1,
							'type': 'number',
							'step': 0.1,
							'decimals': 1
						},
						'value': true,
						'type': 'tile'
					},
					'blending': {
						'value': 'AdditiveBlending',
						'type': 'option',
						'values': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending'],
						'texts': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending']
					},
					'alphakill': {
						'value': 0,
						'type': 'number',
						'min': 0.0,
						'max': 1.0
					},
					'poolCount': 100,
					'segmentCount': 20,
					'width': {
						'value': 1.5,
						'type': 'number',
					},
					'updateSpeed': {
						'value': 10,
						'type': 'number',
					}
				}
			},
			'LineRenderer': {
				'enabled': false,
				'settings': {
					'textureUrl': {
						'value': null,
						'type': 'texture'
					},
					'tile': {
						'enabled': {
							'value': false,
							'type': 'boolean'
						},
						'tileCountX': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'tileCountY': {
							'value': 5,
							'type': 'number',
							'step': 1,
							'decimals': 0
						},
						'loopScale': {
							'value': 1,
							'type': 'number',
							'step': 0.1,
							'decimals': 1
						},
						'value': true,
						'type': 'tile'
					},
					'blending': {
						'value': 'AdditiveBlending',
						'type': 'option',
						'values': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending'],
						'texts': ['AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'NoBlending', 'CustomBlending']
					},
					'alphakill': {
						'value': 0,
						'type': 'number',
						'min': 0.0,
						'max': 1.0
					},
					'poolCount': 2000,
					'width': {
						'value': 0.1,
						'type': 'number',
						'step': 0.01,
						'decimals': 2
					},
					'distance': {
						'value': 0.2,
						'type': 'number',
						'step': 0.1
					},
					'limit': {
						'value': 3,
						'type': 'number',
						'step': 1,
						'decimals': 0
					}
				}
			}
		}
	};
});