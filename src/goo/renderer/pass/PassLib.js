define([
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/renderer/pass/BlurPass',
	'goo/renderer/pass/DoGPass',
	'goo/renderer/pass/MotionBlurPass',
	'goo/renderer/Util'
],
/** @lends */
function(
	ShaderLib,
	FullscreenPass,
	BloomPass,
	BlurPass,
	DoGPass,
	MotionBlurPass,
	Util
) {
	'use strict';

	/** @class */

	function Bloom(id) {
		BloomPass.call(this);
		this.id = id;
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

	function DiffOfGaussians(id) {
		DoGPass.call(this, arguments);
		this.id = id;
	}

	DiffOfGaussians.prototype = Object.create(DoGPass.prototype);
	DiffOfGaussians.prototype.constructor = DiffOfGaussians;

	DiffOfGaussians.prototype.update = function(config) {
		var options = config.options || {};

		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}

		if (options.sigma !== undefined) {
			this.updateSigma(options.sigma);
		}

		if (options.threshold !== undefined) {
			this.updateThreshold(options.threshold);
		}

		if (options.edgeColor !== undefined) {
			this.updateEdgeColor(options.edgeColor);
		}

		if (options.backgroundColor !== undefined) {
			this.updateBackgroundColor(options.backgroundColor);
		}

		if (options.backgroundMix !== undefined) {
			this.updateBackgroundMix(options.backgroundMix);
		}

	};

	DiffOfGaussians.label = 'Edge detect';
	DiffOfGaussians.options = [
		{
			key: 'sigma',
			name: 'Gauss Sigma',
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1.7,
			decimals: 2,
			'default': 0.6
		},
		{
			key: 'threshold',
			name: 'Threshold',
			type: 'float',
			control: 'slider',
			min: 0.00000000000001,
			max: 0.11,
			decimals: 20,
			'default': 0.005
		},
		{
			key: 'backgroundMix',
			name: 'Background %',
			type: 'float',
			control: 'slider',
			min: 0.0,
			max: 1.0,
			decimals: 2,
			'default': 0.0
		},
		{
			key: 'edgeColor',
			name: 'Edge Color',
			type: 'color',
			'default': [0.0, 1.0, 0.0]
		},
		{
			key: 'backgroundColor',
			name: 'Background Color',
			type: 'color',
			'default': [0.0, 0.0, 0.0]
		}
	];

	function Blur(id) {
		BlurPass.call(this, arguments);
		this.id = id;
	}
	Blur.prototype = Object.create(BlurPass.prototype);
	Blur.prototype.constructor = Blur;

	Blur.prototype.update = function(config) {
		var options = config.options || {};
		if (options.opacity !== undefined) {
			this.copyMaterial.uniforms.opacity = options.opacity / 100;
		}
		if (options.size !== undefined) {
			this.blurX = [0.001953125 * options.size, 0.0];
			this.blurY = [0.0, 0.001953125 * options.size];
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Blur.label = 'Blur';
	Blur.options = [
		{
			key: 'opacity',
			name: 'Amount',
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
			min: 0.0,
			max: 5,
			decimals: 1,
			'default': 1
		}
	];

	function Vignette(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.vignette));
		this.id = id;
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

	function Sepia(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.sepia));
		this.id = id;
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

	function Grain(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.film));
		this.id = id;
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
			name: "Line Count",
			min: 1,
			max: 4096,
			'default': 1024
		}
	];

	function Noise(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.noise));
		this.id = id;
	}
	Noise.prototype = Object.create(FullscreenPass.prototype);
	Noise.prototype.constructor = Noise;

	Noise.prototype.update = function(config) {
		var options = config.options;
		var shader = this.material.shader;
		if(options.nIntensity !== undefined) {
			shader.uniforms.nIntensity = options.nIntensity / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Noise.label = 'Noise';
	Noise.options = [
		{
			key: 'nIntensity',
			type: 'int',
			control: 'slider',
			name: 'Noise',
			min: 0,
			max: 100,
			'default': 50
		}
	];

	function RgbShift(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.rgbshift));
		this.id = id;
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

	function Bleach(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.bleachbypass));
		this.id = id;
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

	function HSB(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.hsb));
		this.id = id;
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

	function Colorify(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.colorify));
		this.id = id;
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
	Colorify.label = 'Tint';
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

	function Hatch(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.hatch));
		this.id = id;
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

	function Dot(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.dotscreen));
		this.id = id;
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

	function Contrast(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.brightnesscontrast));
		this.id = id;
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

	function MotionBlur(id) {
		MotionBlurPass.call(this);
		this.id = id;
	}
	MotionBlur.prototype = Object.create(MotionBlurPass.prototype);
	MotionBlur.prototype.constructor = MotionBlur;

	MotionBlur.prototype.update = function (config) {
		var options = config.options;
		var shader = this.inPass.material.shader;
		if (options.blend !== undefined) {
			shader.uniforms.blend = options.blend;
		}
		if (options.scale !== undefined) {
			shader.uniforms.scale = options.scale;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	MotionBlur.label = 'Motion Blur';

	MotionBlur.options = [
		{
			key: 'blend',
			type: 'float',
			control: 'slider',
			name: 'Amount',
			min: 0,
			max: 1,
			'default': 0.5
		},
		{
			key: 'scale',
			type: 'float',
			name: 'Scale',
			min: 0.2,
			'default': 1,
			scale: 0.01
		}
	];

	function Antialias(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.antialias));
		this.id = id;
	}
	Antialias.prototype = Object.create(FullscreenPass.prototype);
	Antialias.prototype.constructor = Antialias;

	Antialias.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.span !== undefined) {
			shader.uniforms.FXAA_SPAN_MAX = options.span;
			shader.uniforms.FXAA_REDUCE_MUL = 1 / options.span;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Antialias.label = 'Antialias';
	Antialias.options = [
		{
			key: 'span',
			type: 'int',
			control: 'slider',
			name: 'Span',
			min: 0,
			max: 16,
			'default': 8
		}
	];

	function Radial(id) {
		FullscreenPass.call(this, Util.clone(ShaderLib.radial));
		this.id = id;
	}
	Radial.prototype = Object.create(FullscreenPass.prototype);
	Radial.prototype.constructor = Radial;

	Radial.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.offset !== undefined) {
			shader.uniforms.offset = options.offset;
		}
		if (options.multiplier !== undefined) {
			shader.uniforms.multiplier = options.multiplier;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Radial.label = 'Radial';
	Radial.options = [
		{
			key: 'offset',
			type: 'float',
			control: 'slider',
			name: 'Offset',
			min: -1,
			max: 1,
			decimals: 2,
			'default': -0.5
		},
		{
			key: 'multiplier',
			type: 'float',
			control: 'slider',
			name: 'Multiplier',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0.75
		}
	];

	return {
		Bloom: Bloom,
		Blur: Blur,
		Vignette: Vignette,
		Sepia: Sepia,
		Grain: Grain,
		Noise: Noise,
		RgbShift: RgbShift,
		Bleach: Bleach,
		HSB: HSB,
		Colorify: Colorify,
		Hatch: Hatch,
		Dot: Dot,
		Contrast: Contrast,
		DiffOfGaussians: DiffOfGaussians,
		MotionBlur: MotionBlur,
		Antialias: Antialias,
		Radial: Radial
	};
});