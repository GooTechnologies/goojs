define([
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Util'
], function(
	ShaderLib,
	FullscreenPass,
	Util
) {
	'use strict';
	var PassLib = {};

	PassLib.Sepia = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.sepia);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.amount) {
					shader.uniforms.amount = options.amount / 100;
				}
				if (config.enabled !== undefined) {
					pass.enabled = config.enabled;
				}
			},
			get: function() {
				return pass;
			},
			options: [
				{
					key: 'amount',
					name: 'Amount',
					type: 'float',
					min: 0,
					max: 100,
					'default': 100
				}
			]
		};
	}());
	/*
	Bloom: {
		create: function() {
			return new BloomPass(options);
		}
	},function() {
		function (options) {  },
	}()),*/
	PassLib.Grain = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.film);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.nIntensity) {
					shader.uniforms.nIntensity = options.nIntensity / 100;
				}
				if (options.sIntensity) {
					shader.uniforms.sIntensity = options.sIntensity / 100;
				}
				if (config.enabled !== undefined) {
					pass.enabled = config.enabled;
				}
			},
			get: function() {
				return pass;
			},
			options: [
				{
					key: 'nIntensity',
					type: 'float',
					name: 'N Intensity',
					min: 0,
					max: 150,
					'default': 50
				},
				{
					key: 'sIntensity',
					type: 'float',
					name: "S Intensity",
					min: 0,
					max: 100,
					'default': 50
				}
			]
		};
	}());

	return PassLib;
});