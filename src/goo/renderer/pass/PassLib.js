define([
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/renderer/pass/BlurPass',
	'goo/renderer/Util'
], function(
	ShaderLib,
	FullscreenPass,
	BloomPass,
	BlurPass,
	Util
) {
	'use strict';
	var PassLib = {};

	PassLib.Sepia = (function() {
		var pass;
		return {
			create: function() {
				return pass = new FullscreenPass(Util.clone(ShaderLib.sepia));
			},
			update: function(config) {
				var options = config.options;
				if(options.amount !== undefined) {
					pass.material.uniforms.amount = options.amount / 100;
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
	PassLib.Glow = (function() {
		var pass;
		return {
			create: function() {
				return pass = new BloomPass();
			},
			update: function(config) {
				var options = config.options || {};
				if (options.opacity !== undefined) {
					pass.copyMaterial.uniforms.opacity = options.opacity / 100;
				}
				if (options.size !== undefined) {
					pass.convolutionMaterial.uniforms.size = options.size;
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
					key: 'opacity',
					name: 'Opacity',
					type: 'float',
					min: 0,
					max: 200,
					'default': 100
				},
				{
					key: 'size',
					name: 'Size',
					type: 'float',
					min: 0,
					max: 10,
					'default': 10
				}
			]
		};
	}()),
	PassLib.Grain = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.film);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.nIntensity !== undefined) {
					shader.uniforms.nIntensity = options.nIntensity / 100;
				}
				if (options.sIntensity !== undefined) {
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