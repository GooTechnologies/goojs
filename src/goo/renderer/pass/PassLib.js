define([
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/renderer/pass/BlurPass',
	'goo/renderer/pass/SSAOPass',
	'goo/renderer/Util'
], function(
	ShaderLib,
	FullscreenPass,
	BloomPass,
	BlurPass,
	SSAOPass,
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
					type: 'int',
					control: 'slider',
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
					type: 'int',
					control: 'slider',
					min: 0,
					max: 200,
					'default': 100
				},
				{
					key: 'size',
					name: 'Size',
					type: 'float',
					control: 'slider',
					min: 0,
					max: 10,
					decimals: 1,
					'default': 10
				}
			]
		};
	}());
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
					type: 'int',
					control: 'slider',
					name: 'N Intensity',
					min: 0,
					max: 150,
					'default': 50
				},
				{
					key: 'sIntensity',
					type: 'int',
					control: 'slider',
					name: "S Intensity",
					min: 0,
					max: 100,
					'default': 50
				}
			]
		};
	}());
	PassLib.BC = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.brightnesscontrast);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.brightness !== undefined) {
					shader.uniforms.brightness = options.brightness;
				}
				if(options.contrast !== undefined) {
					shader.uniforms.contrast = options.contrast;
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
					key: 'brightness',
					type: 'float',
					control: 'slider',
					name: 'Brightness',
					min: -1,
					max: 1,
					decimals: 2,
					'default': 0
				},
				{
					key: 'contrast',
					type: 'float',
					control: 'slider',
					name: 'Contrast',
					min: 0,
					max: 1,
					'default': 0
				}
			]
		};
	}());
	PassLib.RgbShift = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.rgbshift);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.amount !== undefined) {
					shader.uniforms.amount = options.amount;
				}
				if(options.angle !== undefined) {
					shader.uniforms.angle = options.angle;
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
					type: 'float',
					control: 'slider',
					name: 'Amount',
					min: 0,
					max: 0.05,
					decimals: 3,
					'default': 0.005
				},
				{
					key: 'angle',
					type: 'float',
					control: 'slider',
					name: 'Angle',
					min: 0,
					max: 6.28,
					decimals: 1,
					'default': 0
				}
			]
		};
	}());
	PassLib.Vignette = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.vignette);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.offset !== undefined) {
					shader.uniforms.offset = options.offset;
				}
				if(options.darkness !== undefined) {
					shader.uniforms.darkness = options.darkness;
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
					key: 'offset',
					type: 'float',
					control: 'slider',
					name: 'Offset',
					min: 0,
					max: 10,
					decimals: 1,
					'default': 1
				},
				{
					key: 'darkness',
					type: 'float',
					control: 'slider',
					name: 'Darkness',
					min: 0,
					max: 2,
					decimals: 2,
					'default': 1.5
				}
			]
		};
	}());
	PassLib.Bleach = (function() {
		var shader, pass;
		return {
			create: function() {
				shader = Util.clone(ShaderLib.bleachbypass);
				return pass = new FullscreenPass(shader);
			},
			update: function(config) {
				var options = config.options;
				if(options.opacity !== undefined) {
					shader.uniforms.opacity = options.opacity;
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
					type: 'float',
					control: 'slider',
					name: 'Opacity',
					min: 0,
					max: 1,
					decimals: 2,
					'default': 1
				}
			]
		};
	}());
	// PassLib.Colorify = (function() {
	// 	var shader, pass;
	// 	return {
	// 		create: function() {
	// 			shader = Util.clone(ShaderLib.colorify);
	// 			return pass = new FullscreenPass(shader);
	// 		},
	// 		update: function(config) {
	// 			var options = config.options;
	// 			if(options.color !== undefined) {
	// 				shader.uniforms.color = options.color;
	// 			}
				// if (config.enabled !== undefined) {
					// pass.enabled = config.enabled;
				// }
	// 		},
	// 		get: function() {
	// 			return pass;
	// 		},
	// 		options: [
	// 			{
	// 				key: 'color',
	// 				type: 'color',
	// 				name: 'Color',
	// 				'default': [1.0, 1.0, 1.0]
	// 			}
	// 		]
	// 	};
	// }());

	return PassLib;
});