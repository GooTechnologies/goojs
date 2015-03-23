define([
], function(
) {
	'use strict';
	return {
		skeleton: function() {
			var skeleton = this.gooObject('skeleton', 'Dummy');
			skeleton.joints = {};
			for (var i = 0; i < 6; i++) {
				skeleton.joints[this.randomRef()] = {
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
			return skeleton;
		},
		animation: function() {
			var layers = this.gooObject('animation', 'Dummy');

			layers.layers = {};

			for (var i = 5; i >= 0; i--) {
				var layerKey = this.randomRef('layer');

				var state = this.animstate();
				layers.layers[layerKey] = {
					id: layerKey,
					sortValue: i,
					blendWeight: 1,
					initialStateRef: state.id,
					states: {},
					transitions: {
						'*': {
							type: 'Fade',
							fadeTime: 1.2
						}
					}
				};
				layers.layers[layerKey].states[state.id] = {
					sortValue: 0,
					stateRef: state.id
				};
			}
			return layers;
		},
		animstate: function() {
			var state = this.gooObject('animstate', 'Dummy');

			state.clipSource = {
				type: 'Clip',
				clipRef: this.clip().id,
				loopCount: -1,
				timeScale: 1
			};
			return state;
		},
		clip: function() {
			var clip = this.gooObject('clip', 'Dummy');
			clip.binaryRef = this.binary(128);

			clip.channels = {};
			for(var i = 0; i < 6; i++) {
				clip.channels[this.randomRef()] = this.clipChannel(i);
			}
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
		}
	};
});