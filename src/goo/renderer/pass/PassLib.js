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

	function Bloom() {
		BloomPass.call(this, arguments);
	}
	Bloom.prototype = Object.create(BloomPass.prototype);
	Bloom.prototype.constructor = Bloom;

	Bloom.prototype.update = function(config) {
		var options = config.options || {};
		if (options.opacity !== undefined) {
			this.copyMaterial.uniforms.opacity = options.opacity / 100;
		}
		if (options.size !== undefined) {
			this.convolutionMaterial.uniforms.size = options.size;
		}
		if (options.brightness !== undefined) {
			this.bcMaterial.uniforms.brightness = options.brightness / 100;
		}
		if (options.contrast !== undefined) {
			this.bcMaterial.uniforms.contrast = options.contrast / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Bloom.label = 'Bloom';
	Bloom.options = [
		{
			key: 'opacity',
			name: 'Opacity',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 100,
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
			'default': 2
		},
		{
			key: 'brightness',
			name: 'Gain',
			type: 'int',
			control: 'slider',
			min: -100,
			max: 100,
			'default': 0
		},
		{
			key: 'contrast',
			name: 'Intensity',
			type: 'int',
			control: 'slider',
			min: -100,
			max: 100,
			'default': 0
		}
	];

	function Vignette() {
		FullscreenPass.call(this, Util.clone(ShaderLib.vignette));
	}
	Vignette.prototype = Object.create(FullscreenPass.prototype);
	Vignette.prototype.construcor = Vignette;

	Vignette.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.offset !== undefined) {
			shader.uniforms.offset = options.offset;
		}
		if(options.darkness !== undefined) {
			shader.uniforms.darkness = options.darkness;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Vignette.label = 'Vignette';
	Vignette.options = [
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
	];

	function Sepia() {
		FullscreenPass.call(this, Util.clone(ShaderLib.sepia));
	}
	Sepia.prototype = Object.create(FullscreenPass.prototype);
	Sepia.prototype.constructor = Sepia;

	Sepia.prototype.update = function(config) {
		var options = config.options;
		if(options.amount !== undefined) {
			this.material.uniforms.amount = options.amount / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Sepia.label = 'Sepia';
	Sepia.options = [
		{
			key: 'amount',
			name: 'Amount',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 100,
			'default': 100
		}
	];

	function Grain() {
		FullscreenPass.call(this, Util.clone(ShaderLib.film));
	}
	Grain.prototype = Object.create(FullscreenPass.prototype);
	Grain.prototype.constructor = Grain;

	Grain.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.nIntensity !== undefined) {
			shader.uniforms.nIntensity = options.nIntensity / 100;
		}
		if (options.sIntensity !== undefined) {
			shader.uniforms.sIntensity = options.sIntensity / 100;
		}
		if (options.sCount !== undefined) {
			shader.uniforms.sCount = options.sCount;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Grain.label = 'Film Grain';
	Grain.options = [
		{
			key: 'nIntensity',
			type: 'int',
			control: 'slider',
			name: 'Noise',
			min: 0,
			max: 100,
			'default': 50
		},
		{
			key: 'sIntensity',
			type: 'int',
			control: 'slider',
			name: "Line Intensity",
			min: 0,
			max: 100,
			'default': 50
		},
		{
			key: 'sCount',
			type: 'int',
			control: 'slider',
			name: "Count",
			min: 1,
			max: 4096,
			'default': 1024
		}
	];

	function RgbShift() {
		FullscreenPass.call(this, Util.clone(ShaderLib.rgbshift));
	}
	RgbShift.prototype = Object.create(FullscreenPass.prototype);
	RgbShift.prototype.constructor = RgbShift;

	RgbShift.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.amount !== undefined) {
			shader.uniforms.amount = options.amount;
		}
		if(options.angle !== undefined) {
			shader.uniforms.angle = options.angle;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	RgbShift.label = 'RgbShift';
	RgbShift.options = [
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
	];

	function Bleach() {
		FullscreenPass.call(this, Util.clone(ShaderLib.bleachbypass));
	}
	Bleach.prototype = Object.create(FullscreenPass.prototype);
	Bleach.prototype.constructor = Bleach;

	Bleach.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.opacity !== undefined) {
			shader.uniforms.opacity = options.opacity;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Bleach.label = 'Bleach';
	Bleach.options = [
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
	];

	function HSB() {
		FullscreenPass.call(this, Util.clone(ShaderLib.hsb));
	}
	HSB.prototype = Object.create(FullscreenPass.prototype);
	HSB.prototype.constructor = HSB;

	HSB.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.hue !== undefined) {
			shader.uniforms.hue = options.hue;
		}
		if(options.saturation !== undefined) {
			shader.uniforms.saturation = options.saturation;
		}
		if(options.brightness !== undefined) {
			shader.uniforms.brightness = options.brightness;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	HSB.label = 'HSB';
	HSB.options = [
		{
			key: 'hue',
			type: 'float',
			control: 'slider',
			name: 'Hue',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'saturation',
			type: 'float',
			control: 'slider',
			name: 'Saturation',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'brightness',
			type: 'float',
			control: 'slider',
			name: 'Brightness',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		}
	];

	function Colorify() {
		FullscreenPass.call(this, Util.clone(ShaderLib.colorify));
	}
	Colorify.prototype = Object.create(FullscreenPass.prototype);
	Colorify.prototype.constructor = Colorify;

	Colorify.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.color !== undefined) {
			shader.uniforms.color = options.color;
		}
		if(options.amount !== undefined) {
			shader.uniforms.amount = options.amount;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Colorify.label = 'Colorify';
	Colorify.options = [
		{
			key: 'color',
			type: 'color',
			name: 'Color',
			'default': [1.0, 1.0, 1.0]
		},
		{
			key: 'amount',
			type: 'float',
			control: 'slider',
			name: 'Amount',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		}
	];

	function Hatch() {
		FullscreenPass.call(this, Util.clone(ShaderLib.hatch));
	}
	Hatch.prototype = Object.create(FullscreenPass.prototype);
	Hatch.prototype.constructor = Hatch;

	Hatch.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.width !== undefined) {
			shader.uniforms.width = options.width;
		}
		if(options.spread !== undefined) {
			shader.uniforms.spread = options.spread;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Hatch.label = 'Hatch';
	Hatch.options = [
		{
			key: 'width',
			type: 'float',
			control: 'slider',
			name: 'Width',
			min: 0,
			max: 10,
			decimals: 1,
			'default': 2
		},
		{
			key: 'spread',
			type: 'int',
			control: 'slider',
			name: 'Spread',
			min: 1,
			max: 50,
			'default': 8
		}
	];

	function Dot() {
		FullscreenPass.call(this, Util.clone(ShaderLib.dotscreen));
	}
	Dot.prototype = Object.create(FullscreenPass.prototype);
	Dot.prototype.constructor = Dot;

	Dot.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.angle !== undefined) {
			shader.uniforms.angle = options.angle;
		}
		if(options.scale !== undefined) {
			shader.uniforms.scale = options.scale;
		}
		if(options.sizex !== undefined) {
			shader.uniforms.tSize[0] = options.sizex;
		}
		if(options.sizey !== undefined) {
			shader.uniforms.tSize[1] = options.sizey;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Dot.label = 'Dot';
	Dot.options = [
		{
			key: 'angle',
			type: 'float',
			control: 'slider',
			name: 'Angle',
			min: 0,
			max: 10,
			decimals: 2,
			'default': 1.57
		},
		{
			key: 'scale',
			type: 'float',
			control: 'slider',
			name: 'Scale',
			min: 0,
			max: 10,
			decimals: 2,
			'default': 1
		},
		{
			key: 'sizex',
			type: 'int',
			control: 'slider',
			name: 'SizeX',
			min: 0,
			max: 1024,
			'default': 256
		},
		{
			key: 'sizey',
			type: 'int',
			control: 'slider',
			name: 'SizeY',
			min: 0,
			max: 1024,
			'default': 256
		}
	];

	function Contrast() {
		FullscreenPass.call(this, Util.clone(ShaderLib.brightnesscontrast));
	}
	Contrast.prototype = Object.create(FullscreenPass.prototype);
	Contrast.prototype.constructor = Contrast;

	Contrast.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.brightness !== undefined) {
			shader.uniforms.brightness = options.brightness;
		}
		if(options.contrast !== undefined) {
			shader.uniforms.contrast = options.contrast;
		}
		if(options.saturation !== undefined) {
			shader.uniforms.saturation = options.saturation;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Contrast.label = 'Contrast';
	Contrast.options = [
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
		},
		{
			key: 'saturation',
			type: 'float',
			control: 'slider',
			name: 'Saturation',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		}
	];

	return {
		Bloom: Bloom,
		Vignette: Vignette,
		Sepia: Sepia,
		Grain: Grain,
		RgbShift: RgbShift,
		Bleach: Bleach,
		HSB: HSB,
		Colorify: Colorify,
		Hatch: Hatch,
		Dot: Dot,
		Contrast: Contrast
	};
});