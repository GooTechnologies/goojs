define([
    'goo/passpack/ShaderLibExtra',
    'goo/renderer/pass/FullscreenPass',
    'goo/passpack/BloomPass',
    'goo/passpack/BlurPass',
    'goo/passpack/DoGPass',
    'goo/passpack/MotionBlurPass',
    'goo/renderer/Util'
], function (ShaderLibExtra, FullscreenPass, BloomPass, BlurPass, DoGPass, MotionBlurPass, Util) {
    'use strict';
    __touch(14752);
    function Bloom(id) {
        BloomPass.call(this);
        __touch(14869);
        this.id = id;
        __touch(14870);
    }
    __touch(14753);
    Bloom.prototype = Object.create(BloomPass.prototype);
    __touch(14754);
    Bloom.prototype.constructor = Bloom;
    __touch(14755);
    Bloom.prototype.update = function (config) {
        var options = config.options || {};
        __touch(14871);
        if (options.opacity !== undefined) {
            this.copyMaterial.uniforms.opacity = options.opacity / 100;
            __touch(14872);
        }
        if (options.size !== undefined) {
            this.convolutionMaterial.uniforms.size = options.size;
            __touch(14873);
        }
        if (options.brightness !== undefined) {
            this.bcMaterial.uniforms.brightness = options.brightness / 100;
            __touch(14874);
        }
        if (options.contrast !== undefined) {
            this.bcMaterial.uniforms.contrast = options.contrast / 100;
            __touch(14875);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14876);
        }
    };
    __touch(14756);
    Bloom.label = 'Bloom';
    __touch(14757);
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
    __touch(14758);
    function DiffOfGaussians(id) {
        DoGPass.call(this, arguments);
        __touch(14877);
        this.id = id;
        __touch(14878);
    }
    __touch(14759);
    DiffOfGaussians.prototype = Object.create(DoGPass.prototype);
    __touch(14760);
    DiffOfGaussians.prototype.constructor = DiffOfGaussians;
    __touch(14761);
    DiffOfGaussians.prototype.update = function (config) {
        var options = config.options || {};
        __touch(14879);
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14880);
        }
        if (options.sigma !== undefined) {
            this.updateSigma(options.sigma);
            __touch(14881);
        }
        if (options.threshold !== undefined) {
            this.updateThreshold(options.threshold);
            __touch(14882);
        }
        if (options.edgeColor !== undefined) {
            this.updateEdgeColor(options.edgeColor);
            __touch(14883);
        }
        if (options.backgroundColor !== undefined) {
            this.updateBackgroundColor(options.backgroundColor);
            __touch(14884);
        }
        if (options.backgroundMix !== undefined) {
            this.updateBackgroundMix(options.backgroundMix);
            __touch(14885);
        }
    };
    __touch(14762);
    DiffOfGaussians.label = 'Edge detect';
    __touch(14763);
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
            min: 1e-14,
            max: 0.11,
            decimals: 20,
            'default': 0.005
        },
        {
            key: 'backgroundMix',
            name: 'Background %',
            type: 'float',
            control: 'slider',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 0
        },
        {
            key: 'edgeColor',
            name: 'Edge Color',
            type: 'vec3',
            control: 'color',
            'default': [
                0,
                1,
                0
            ]
        },
        {
            key: 'backgroundColor',
            name: 'Background Color',
            type: 'vec3',
            control: 'color',
            'default': [
                0,
                0,
                0
            ]
        }
    ];
    __touch(14764);
    function Blur(id) {
        BlurPass.call(this, arguments);
        __touch(14886);
        this.id = id;
        __touch(14887);
    }
    __touch(14765);
    Blur.prototype = Object.create(BlurPass.prototype);
    __touch(14766);
    Blur.prototype.constructor = Blur;
    __touch(14767);
    Blur.prototype.update = function (config) {
        var options = config.options || {};
        __touch(14888);
        if (options.opacity !== undefined) {
            this.copyMaterial.uniforms.opacity = options.opacity / 100;
            __touch(14889);
        }
        if (options.size !== undefined) {
            this.blurX = [
                0.001953125 * options.size,
                0
            ];
            __touch(14890);
            this.blurY = [
                0,
                0.001953125 * options.size
            ];
            __touch(14891);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14892);
        }
    };
    __touch(14768);
    Blur.label = 'Blur';
    __touch(14769);
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
            min: 0,
            max: 5,
            decimals: 1,
            'default': 1
        }
    ];
    __touch(14770);
    function Vignette(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.vignette));
        __touch(14893);
        this.id = id;
        __touch(14894);
    }
    __touch(14771);
    Vignette.prototype = Object.create(FullscreenPass.prototype);
    __touch(14772);
    Vignette.prototype.construcor = Vignette;
    __touch(14773);
    Vignette.prototype.update = function (config) {
        var options = config.options;
        __touch(14895);
        var shader = this.material.shader;
        __touch(14896);
        if (options.offset !== undefined) {
            shader.uniforms.offset = options.offset;
            __touch(14897);
        }
        if (options.darkness !== undefined) {
            shader.uniforms.darkness = options.darkness;
            __touch(14898);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14899);
        }
    };
    __touch(14774);
    Vignette.label = 'Vignette';
    __touch(14775);
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
    __touch(14776);
    function Sepia(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.sepia));
        __touch(14900);
        this.id = id;
        __touch(14901);
    }
    __touch(14777);
    Sepia.prototype = Object.create(FullscreenPass.prototype);
    __touch(14778);
    Sepia.prototype.constructor = Sepia;
    __touch(14779);
    Sepia.prototype.update = function (config) {
        var options = config.options;
        __touch(14902);
        if (options.amount !== undefined) {
            this.material.uniforms.amount = options.amount / 100;
            __touch(14903);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14904);
        }
    };
    __touch(14780);
    Sepia.label = 'Sepia';
    __touch(14781);
    Sepia.options = [{
            key: 'amount',
            name: 'Amount',
            type: 'int',
            control: 'slider',
            min: 0,
            max: 100,
            'default': 100
        }];
    __touch(14782);
    function Grain(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.film));
        __touch(14905);
        this.id = id;
        __touch(14906);
    }
    __touch(14783);
    Grain.prototype = Object.create(FullscreenPass.prototype);
    __touch(14784);
    Grain.prototype.constructor = Grain;
    __touch(14785);
    Grain.prototype.update = function (config) {
        var options = config.options;
        __touch(14907);
        var shader = this.material.shader;
        __touch(14908);
        if (options.nIntensity !== undefined) {
            shader.uniforms.nIntensity = options.nIntensity / 100;
            __touch(14909);
        }
        if (options.sIntensity !== undefined) {
            shader.uniforms.sIntensity = options.sIntensity / 100;
            __touch(14910);
        }
        if (options.sCount !== undefined) {
            shader.uniforms.sCount = options.sCount;
            __touch(14911);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14912);
        }
    };
    __touch(14786);
    Grain.label = 'Film Grain';
    __touch(14787);
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
            name: 'Line Intensity',
            min: 0,
            max: 100,
            'default': 50
        },
        {
            key: 'sCount',
            type: 'int',
            control: 'slider',
            name: 'Line Count',
            min: 1,
            max: 4096,
            'default': 1024
        }
    ];
    __touch(14788);
    function Noise(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.noise));
        __touch(14913);
        this.id = id;
        __touch(14914);
    }
    __touch(14789);
    Noise.prototype = Object.create(FullscreenPass.prototype);
    __touch(14790);
    Noise.prototype.constructor = Noise;
    __touch(14791);
    Noise.prototype.update = function (config) {
        var options = config.options;
        __touch(14915);
        var shader = this.material.shader;
        __touch(14916);
        if (options.nIntensity !== undefined) {
            shader.uniforms.nIntensity = options.nIntensity / 100;
            __touch(14917);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14918);
        }
    };
    __touch(14792);
    Noise.label = 'Noise';
    __touch(14793);
    Noise.options = [{
            key: 'nIntensity',
            type: 'int',
            control: 'slider',
            name: 'Noise',
            min: 0,
            max: 100,
            'default': 50
        }];
    __touch(14794);
    function RgbShift(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.rgbshift));
        __touch(14919);
        this.id = id;
        __touch(14920);
    }
    __touch(14795);
    RgbShift.prototype = Object.create(FullscreenPass.prototype);
    __touch(14796);
    RgbShift.prototype.constructor = RgbShift;
    __touch(14797);
    RgbShift.prototype.update = function (config) {
        var options = config.options;
        __touch(14921);
        var shader = this.material.shader;
        __touch(14922);
        if (options.amount !== undefined) {
            shader.uniforms.amount = options.amount;
            __touch(14923);
        }
        if (options.angle !== undefined) {
            shader.uniforms.angle = options.angle;
            __touch(14924);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14925);
        }
    };
    __touch(14798);
    RgbShift.label = 'RgbShift';
    __touch(14799);
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
    __touch(14800);
    function Bleach(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.bleachbypass));
        __touch(14926);
        this.id = id;
        __touch(14927);
    }
    __touch(14801);
    Bleach.prototype = Object.create(FullscreenPass.prototype);
    __touch(14802);
    Bleach.prototype.constructor = Bleach;
    __touch(14803);
    Bleach.prototype.update = function (config) {
        var options = config.options;
        __touch(14928);
        var shader = this.material.shader;
        __touch(14929);
        if (options.opacity !== undefined) {
            shader.uniforms.opacity = options.opacity;
            __touch(14930);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14931);
        }
    };
    __touch(14804);
    Bleach.label = 'Bleach';
    __touch(14805);
    Bleach.options = [{
            key: 'opacity',
            type: 'float',
            control: 'slider',
            name: 'Opacity',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 1
        }];
    __touch(14806);
    function HSB(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.hsb));
        __touch(14932);
        this.id = id;
        __touch(14933);
    }
    __touch(14807);
    HSB.prototype = Object.create(FullscreenPass.prototype);
    __touch(14808);
    HSB.prototype.constructor = HSB;
    __touch(14809);
    HSB.prototype.update = function (config) {
        var options = config.options;
        __touch(14934);
        var shader = this.material.shader;
        __touch(14935);
        if (options.hue !== undefined) {
            shader.uniforms.hue = options.hue;
            __touch(14936);
        }
        if (options.saturation !== undefined) {
            shader.uniforms.saturation = options.saturation;
            __touch(14937);
        }
        if (options.brightness !== undefined) {
            shader.uniforms.brightness = options.brightness;
            __touch(14938);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14939);
        }
    };
    __touch(14810);
    HSB.label = 'HSB';
    __touch(14811);
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
    __touch(14812);
    function Colorify(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.colorify));
        __touch(14940);
        this.id = id;
        __touch(14941);
    }
    __touch(14813);
    Colorify.prototype = Object.create(FullscreenPass.prototype);
    __touch(14814);
    Colorify.prototype.constructor = Colorify;
    __touch(14815);
    Colorify.prototype.update = function (config) {
        var options = config.options;
        __touch(14942);
        var shader = this.material.shader;
        __touch(14943);
        if (options.color !== undefined) {
            shader.uniforms.color = options.color;
            __touch(14944);
        }
        if (options.amount !== undefined) {
            shader.uniforms.amount = options.amount;
            __touch(14945);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14946);
        }
    };
    __touch(14816);
    Colorify.label = 'Tint';
    __touch(14817);
    Colorify.options = [
        {
            key: 'color',
            type: 'vec3',
            control: 'color',
            name: 'Color',
            'default': [
                1,
                1,
                1
            ]
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
    __touch(14818);
    function Hatch(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.hatch));
        __touch(14947);
        this.id = id;
        __touch(14948);
    }
    __touch(14819);
    Hatch.prototype = Object.create(FullscreenPass.prototype);
    __touch(14820);
    Hatch.prototype.constructor = Hatch;
    __touch(14821);
    Hatch.prototype.update = function (config) {
        var options = config.options;
        __touch(14949);
        var shader = this.material.shader;
        __touch(14950);
        if (options.width !== undefined) {
            shader.uniforms.width = options.width;
            __touch(14951);
        }
        if (options.spread !== undefined) {
            shader.uniforms.spread = options.spread;
            __touch(14952);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14953);
        }
    };
    __touch(14822);
    Hatch.label = 'Hatch';
    __touch(14823);
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
    __touch(14824);
    function Dot(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.dotscreen));
        __touch(14954);
        this.id = id;
        __touch(14955);
    }
    __touch(14825);
    Dot.prototype = Object.create(FullscreenPass.prototype);
    __touch(14826);
    Dot.prototype.constructor = Dot;
    __touch(14827);
    Dot.prototype.update = function (config) {
        var options = config.options;
        __touch(14956);
        var shader = this.material.shader;
        __touch(14957);
        if (options.angle !== undefined) {
            shader.uniforms.angle = options.angle;
            __touch(14958);
        }
        if (options.scale !== undefined) {
            shader.uniforms.scale = options.scale;
            __touch(14959);
        }
        if (options.sizex !== undefined) {
            shader.uniforms.tSize[0] = options.sizex;
            __touch(14960);
        }
        if (options.sizey !== undefined) {
            shader.uniforms.tSize[1] = options.sizey;
            __touch(14961);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14962);
        }
    };
    __touch(14828);
    Dot.label = 'Dot';
    __touch(14829);
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
    __touch(14830);
    function Contrast(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.brightnesscontrast));
        __touch(14963);
        this.id = id;
        __touch(14964);
    }
    __touch(14831);
    Contrast.prototype = Object.create(FullscreenPass.prototype);
    __touch(14832);
    Contrast.prototype.constructor = Contrast;
    __touch(14833);
    Contrast.prototype.update = function (config) {
        var options = config.options;
        __touch(14965);
        var shader = this.material.shader;
        __touch(14966);
        if (options.brightness !== undefined) {
            shader.uniforms.brightness = options.brightness;
            __touch(14967);
        }
        if (options.contrast !== undefined) {
            shader.uniforms.contrast = options.contrast;
            __touch(14968);
        }
        if (options.saturation !== undefined) {
            shader.uniforms.saturation = options.saturation;
            __touch(14969);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14970);
        }
    };
    __touch(14834);
    Contrast.label = 'Contrast';
    __touch(14835);
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
    __touch(14836);
    function MotionBlur(id) {
        MotionBlurPass.call(this);
        __touch(14971);
        this.id = id;
        __touch(14972);
    }
    __touch(14837);
    MotionBlur.prototype = Object.create(MotionBlurPass.prototype);
    __touch(14838);
    MotionBlur.prototype.constructor = MotionBlur;
    __touch(14839);
    MotionBlur.prototype.update = function (config) {
        var options = config.options;
        __touch(14973);
        var shader = this.inPass.material.shader;
        __touch(14974);
        if (options.blend !== undefined) {
            shader.uniforms.blend = options.blend;
            __touch(14975);
        }
        if (options.scale !== undefined) {
            shader.uniforms.scale = options.scale;
            __touch(14976);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14977);
        }
    };
    __touch(14840);
    MotionBlur.label = 'Motion Blur';
    __touch(14841);
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
    __touch(14842);
    function Antialias(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.antialias));
        __touch(14978);
        this.id = id;
        __touch(14979);
    }
    __touch(14843);
    Antialias.prototype = Object.create(FullscreenPass.prototype);
    __touch(14844);
    Antialias.prototype.constructor = Antialias;
    __touch(14845);
    Antialias.prototype.update = function (config) {
        var options = config.options;
        __touch(14980);
        var shader = this.material.shader;
        __touch(14981);
        if (options.span !== undefined) {
            shader.uniforms.FXAA_SPAN_MAX = options.span;
            __touch(14982);
            shader.uniforms.FXAA_REDUCE_MUL = 1 / options.span;
            __touch(14983);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14984);
        }
    };
    __touch(14846);
    Antialias.label = 'Antialias';
    __touch(14847);
    Antialias.options = [{
            key: 'span',
            type: 'int',
            control: 'slider',
            name: 'Span',
            min: 0,
            max: 16,
            'default': 8
        }];
    __touch(14848);
    function Radial(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.radial));
        __touch(14985);
        this.id = id;
        __touch(14986);
    }
    __touch(14849);
    Radial.prototype = Object.create(FullscreenPass.prototype);
    __touch(14850);
    Radial.prototype.constructor = Radial;
    __touch(14851);
    Radial.prototype.update = function (config) {
        var options = config.options;
        __touch(14987);
        var shader = this.material.shader;
        __touch(14988);
        if (options.offset !== undefined) {
            shader.uniforms.offset = options.offset;
            __touch(14989);
        }
        if (options.multiplier !== undefined) {
            shader.uniforms.multiplier = options.multiplier;
            __touch(14990);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(14991);
        }
    };
    __touch(14852);
    Radial.label = 'Radial';
    __touch(14853);
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
    __touch(14854);
    function Overlay(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.overlay));
        __touch(14992);
        this.id = id;
        __touch(14993);
    }
    __touch(14855);
    Overlay.prototype = Object.create(FullscreenPass.prototype);
    __touch(14856);
    Overlay.prototype.constructor = Overlay;
    __touch(14857);
    Overlay.blendmodes = [
        'Normal',
        'Lighten',
        'Darken',
        'Multiply',
        'Average',
        'Add',
        'Substract',
        'Difference',
        'Negation',
        'Exclusion',
        'Screen',
        'Overlay',
        'SoftLight',
        'HardLight',
        'ColorDodge',
        'ColorBurn',
        'LinearLight',
        'VividLight',
        'PinLight',
        'HardMix',
        'Reflect',
        'Glow',
        'Phoenix'
    ];
    __touch(14858);
    Overlay.prototype.update = function (config) {
        var options = config.options;
        __touch(14994);
        var shader = this.material.shader;
        __touch(14995);
        if (options.blendmode !== undefined) {
            var newBlendMode = Overlay.blendmodes.indexOf(options.blendmode);
            __touch(14996);
            if (newBlendMode !== shader.defines.OVERLAY_TYPE) {
                shader.defines.OVERLAY_TYPE = newBlendMode;
                __touch(14997);
                shader.uniforms.amount = options.amount - 0.01;
                __touch(14998);
            }
        }
        if (options.amount !== undefined) {
            shader.uniforms.amount = options.amount;
            __touch(14999);
        }
        if (options.url != null) {
            this.material.setTexture('OVERLAY_MAP', options.url);
            __touch(15000);
        } else {
            this.material.removeTexture('OVERLAY_MAP');
            __touch(15001);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(15002);
        }
    };
    __touch(14859);
    Overlay.label = 'Overlay';
    __touch(14860);
    Overlay.options = [
        {
            key: 'url',
            name: 'Texture',
            type: 'texture',
            'default': { enabled: true }
        },
        {
            key: 'blendmode',
            name: 'Blend Mode',
            type: 'string',
            control: 'select',
            options: Overlay.blendmodes,
            'default': 'Normal'
        },
        {
            key: 'amount',
            name: 'Amount',
            type: 'float',
            control: 'slider',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 1
        }
    ];
    __touch(14861);
    function Levels(id) {
        FullscreenPass.call(this, Util.clone(ShaderLibExtra.levels));
        __touch(15003);
        this.id = id;
        __touch(15004);
    }
    __touch(14862);
    Levels.prototype = Object.create(FullscreenPass.prototype);
    __touch(14863);
    Levels.prototype.constructor = Levels;
    __touch(14864);
    Levels.prototype.update = function (config) {
        var options = config.options;
        __touch(15005);
        var shader = this.material.shader;
        __touch(15006);
        if (options.gamma !== undefined) {
            shader.uniforms.gamma = options.gamma;
            __touch(15007);
        }
        if (options.gamma !== undefined) {
            shader.uniforms.gamma = options.gamma;
            __touch(15008);
        }
        if (options.minInput !== undefined) {
            shader.uniforms.minInput = options.minInput;
            __touch(15009);
        }
        if (options.maxInput !== undefined) {
            shader.uniforms.maxInput = options.maxInput;
            __touch(15010);
        }
        if (options.minOutput !== undefined) {
            shader.uniforms.minOutput = options.minOutput;
            __touch(15011);
        }
        if (options.maxOutput !== undefined) {
            shader.uniforms.maxOutput = options.maxOutput;
            __touch(15012);
        }
        if (config.enabled !== undefined) {
            this.enabled = config.enabled;
            __touch(15013);
        }
    };
    __touch(14865);
    Levels.label = 'Levels';
    __touch(14866);
    Levels.options = [
        {
            key: 'gamma',
            type: 'float',
            control: 'slider',
            name: 'Gamma',
            min: 0,
            max: 5,
            decimals: 2,
            'default': 1
        },
        {
            key: 'minInput',
            type: 'float',
            control: 'slider',
            name: 'Min Input',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 0
        },
        {
            key: 'maxInput',
            type: 'float',
            control: 'slider',
            name: 'Max Input',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 1
        },
        {
            key: 'minOutput',
            type: 'float',
            control: 'slider',
            name: 'Min Output',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 0
        },
        {
            key: 'maxOutput',
            type: 'float',
            control: 'slider',
            name: 'Max Output',
            min: 0,
            max: 1,
            decimals: 2,
            'default': 1
        }
    ];
    __touch(14867);
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
        Radial: Radial,
        Overlay: Overlay,
        Levels: Levels
    };
    __touch(14868);
});
__touch(14751);