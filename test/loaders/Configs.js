define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	'use strict';
	var bundle = {};
	var Configs = {
		randomRef: function(type) {
			return Math.random().toString(16) + '.' + (type || '');
		},
		gooObject: function(type, name) {
			return {
				id: Configs.randomRef(type),
				name: name,
				license: 'CC0',
				orignalLicense: 'CC0',

				created: '2014-01-11T13:29:12+00:00',
				modified: '2014-01-11T13:29:12+00:00',

				public: true,
				owner: 'rickard',
				readonly: false,
				description: 'Test object',
				deleted: false,

				dataModelVersion: 2
			};
		},
		entity: function(components) {
			components = components || ['transform'];
			var entity = Configs.gooObject('entity', 'Dummy');
			entity.components = {};
			for (var i = 0; i < components.length; i++) {
				entity.components[components[i]] = Configs.component[components[i]]();
			}
			bundle[entity.id] = entity;
			return entity;
		},
		skeleton: function() {
			var skeleton = Configs.gooObject('skeleton', 'Dummy');
			skeleton.joints = {};
			for (var i = 0; i < 6; i++) {
				skeleton.joints[Configs.randomRef()] = {
					index: i,
					parentIndex: i > 0 ? i - 1 : -32768,
					name: 'Joint_'+i,
					inverseBindPose: [
						1,0,0,0,
						0,1,0,0,
						0,0,1,0,
						0,0,0,1
					]
				};
			}
			bundle[skeleton.id] = skeleton;
			return skeleton;
		},
		animation: function() {
			var layers = Configs.gooObject('animation', 'Dummy');

			layers.layers = {};

			for (var i = 5; i >= 0; i--) {
				var layerKey = Configs.randomRef();

				layers.layers[layerKey] = {
					sortValue: i,
					blendWeight: 1,
					defaultState: 'default',
					states: {
						'default': {
							stateRef: Configs.animstate().id
						}
					},
					transitions: {
						'*': {
							type: 'Fade',
							fadeTime: 1.2
						}
					}
				};
			}

			bundle[layers.id] = layers;
			return layers;
		},
		animstate: function() {
			var state = Configs.gooObject('animstate', 'Dummy');

			state.clipSource = {
				type: 'Clip',
				clipRef: Configs.clip().id,
				loopCount: -1,
				timeScale: 1
			};

			bundle[state.id] = state;
			return state;
		},
		clip: function() {
			var clip = Configs.gooObject('clip', 'Dummy');
			clip.binaryRef = Configs.binary(128);

			clip.channels = {};
			for(var i = 0; i < 6; i++) {
				clip.channels[Configs.randomRef()] = Configs.clipChannel(i);
			}
			bundle[clip.id] = clip;
			return clip;
		},
		clipChannel: function(index, samples) {
			index = (index !== undefined) ? index : 0;
			samples = samples || 4;

			var channel = {
				blendType: 'Linear',
				jointIndex: index,
				name: 'dummy_joint_'+index,
				times: [0,samples,'float32'],
				translationSamples: [4, samples * 3, 'float32'],
				rotationSamples: [16, samples * 4, 'float32'],
				scaleSamples: [32, samples * 3, 'float32'],
				type: 'Joint'
			};
			return channel;
		},
		binary: function(size) {
			var arr = new Float32Array(size);
			for (var i = 0; i < size; i++) {
				arr[i] = i / size;
			}
			var ref = Configs.randomRef('bin');
			bundle[ref] = arr.buffer;
			return ref;
		},
		component: {
			transform: function(translation, rotation, scale) {
				translation = (translation) ? translation.slice() : [0,0,0];
				rotation = (rotation) ? rotation.slice() : [0,0,0];
				scale = (scale) ? scale.slice() : [1,1,1];

				return {
					translation: translation,
					rotation: rotation,
					scale: scale
				};
			},
			camera: function(aspect, lockedRatio, far, fov, near) {
				return {
					aspect: aspect || 1,
					lockedRatio: !!lockedRatio,
					far: far || 1000,
					fov: fov || 45,
					near: near || 1
				};
			},
			light: function(type, options) {
				var config = _.defaults({}, options, {
					type: type || 'PointLight',
					color: [1,1,1],
					intensity: 1,
					shadowCaster: false,
					specularIntensity: 1
				});
				if (type !== 'DirectionalLight') {
					config.range = config.range || 1000;
				}
				if (type === 'SpotLight') {
					config.angle = config.angle || 55;
				}
				if (config.shadowCaster) {
					config.shadowSettings = config.shadowSettings || {};
					_.defaults(config.shadowSettings, {
						type: 'Blur',
						projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
						near: 1,
						far: 1000,
						resolution: [512, 512],
						upVector: [0,1,0],
						darkness: 0.5
					});
				}
				return config;
			},
			animation: function() {
				var config = {
					layersRef: Configs.animation().id,
					poseRef: Configs.skeleton().id
				};
				return config;
			}
		},
		attachChild: function(parent, child) {
			if (!parent.components.transform.childRefs) {
				parent.components.transform.childRefs = {};
			}
			var key = Configs.randomRef();
			parent.components.transform.childRefs[key] = child.id;
		},
		get: function() {
			return bundle;
		}
	};
	return Configs;
});