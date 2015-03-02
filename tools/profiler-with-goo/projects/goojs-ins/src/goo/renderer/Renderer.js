define([
    'goo/renderer/RendererRecord',
    'goo/renderer/Util',
    'goo/renderer/TextureCreator',
    'goo/renderer/pass/RenderTarget',
    'goo/math/Vector4',
    'goo/entities/Entity',
    'goo/renderer/Texture',
    'goo/loaders/dds/DdsLoader',
    'goo/loaders/dds/DdsUtils',
    'goo/renderer/Material',
    'goo/math/Transform',
    'goo/renderer/RenderQueue',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/shadow/ShadowHandler',
    'goo/entities/SystemBus',
    'goo/renderer/TaskScheduler',
    'goo/renderer/RenderInfo'
], function (RendererRecord, Util, TextureCreator, RenderTarget, Vector4, Entity, Texture, DdsLoader, DdsUtils, Material, Transform, RenderQueue, ShaderLib, ShadowHandler, SystemBus, TaskScheduler, RenderInfo) {
    'use strict';
    __touch(16314);
    var WebGLRenderingContext = window.WebGLRenderingContext;
    __touch(16315);
    function Renderer(parameters) {
        parameters = parameters || {};
        __touch(16395);
        var _canvas = parameters.canvas;
        __touch(16396);
        if (_canvas === undefined) {
            _canvas = document.createElement('canvas');
            __touch(16447);
            _canvas.width = 500;
            __touch(16448);
            _canvas.height = 500;
            __touch(16449);
        }
        _canvas.screencanvas = true;
        __touch(16397);
        this.domElement = _canvas;
        __touch(16398);
        this._alpha = parameters.alpha !== undefined ? parameters.alpha : false;
        __touch(16399);
        this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
        __touch(16400);
        this._antialias = parameters.antialias !== undefined ? parameters.antialias : true;
        __touch(16401);
        this._stencil = parameters.stencil !== undefined ? parameters.stencil : false;
        __touch(16402);
        this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
        __touch(16403);
        this._useDevicePixelRatio = parameters.useDevicePixelRatio !== undefined ? parameters.useDevicePixelRatio : false;
        __touch(16404);
        this._onError = parameters.onError;
        __touch(16405);
        var settings = {
            alpha: this._alpha,
            premultipliedAlpha: this._premultipliedAlpha,
            antialias: this._antialias,
            stencil: this._stencil,
            preserveDrawingBuffer: this._preserveDrawingBuffer
        };
        __touch(16406);
        this.context = null;
        __touch(16407);
        if (!!window.WebGLRenderingContext) {
            var contextNames = [
                'experimental-webgl',
                'webgl',
                'moz-webgl',
                'webkit-3d'
            ];
            __touch(16450);
            for (var i = 0; i < contextNames.length; i++) {
                try {
                    this.context = _canvas.getContext(contextNames[i], settings);
                    __touch(16452);
                    if (this.context && typeof this.context.getParameter === 'function') {
                        break;
                        __touch(16453);
                    }
                } catch (e) {
                }
                __touch(16451);
            }
            if (!this.context) {
                throw {
                    name: 'GooWebGLError',
                    message: 'WebGL is supported but disabled',
                    supported: true,
                    enabled: false
                };
                __touch(16454);
            }
        } else {
            throw {
                name: 'GooWebGLError',
                message: 'WebGL is not supported',
                supported: false,
                enabled: false
            };
            __touch(16455);
        }
        if (parameters.debug) {
            var request = new XMLHttpRequest();
            __touch(16456);
            request.open('GET', '/js/goo/lib/webgl-debug.js', false);
            __touch(16457);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status <= 299) {
                        window['eval'].call(window, request.responseText);
                        __touch(16460);
                    }
                }
            };
            __touch(16458);
            request.send(null);
            __touch(16459);
            if (typeof window.WebGLDebugUtils === 'undefined') {
                console.warn('You need to include webgl-debug.js in your script definition to run in debug mode.');
                __touch(16461);
            } else {
                console.log('Running in webgl debug mode.');
                __touch(16462);
                if (parameters.validate) {
                    console.log('Running with "undefined arguments" validation.');
                    __touch(16463);
                    this.context = window.WebGLDebugUtils.makeDebugContext(this.context, this.onDebugError.bind(this), validateNoneOfTheArgsAreUndefined);
                    __touch(16464);
                } else {
                    this.context = window.WebGLDebugUtils.makeDebugContext(this.context, this.onDebugError.bind(this));
                    __touch(16465);
                }
            }
        }
        this.rendererRecord = new RendererRecord();
        __touch(16408);
        this.glExtensionCompressedTextureS3TC = DdsLoader.SUPPORTS_DDS = DdsUtils.isSupported(this.context);
        __touch(16409);
        this.glExtensionTextureFloat = this.context.getExtension('OES_texture_float');
        __touch(16410);
        this.glExtensionTextureFloatLinear = this.context.getExtension('OES_texture_float_linear');
        __touch(16411);
        this.glExtensionTextureHalfFloat = this.context.getExtension('OES_texture_half_float');
        __touch(16412);
        this.glExtensionStandardDerivatives = this.context.getExtension('OES_standard_derivatives');
        __touch(16413);
        this.glExtensionTextureFilterAnisotropic = this.context.getExtension('EXT_texture_filter_anisotropic') || this.context.getExtension('MOZ_EXT_texture_filter_anisotropic') || this.context.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        __touch(16414);
        this.glExtensionDepthTexture = this.context.getExtension('WEBGL_depth_texture') || this.context.getExtension('WEBKIT_WEBGL_depth_texture') || this.context.getExtension('MOZ_WEBGL_depth_texture');
        __touch(16415);
        this.glExtensionElementIndexUInt = this.context.getExtension('OES_element_index_uint');
        __touch(16416);
        this.glExtensionInstancedArrays = this.context.getExtension('ANGLE_instanced_arrays');
        __touch(16417);
        if (!this.glExtensionTextureFloat) {
            console.log('Float textures not supported.');
            __touch(16466);
        }
        if (!this.glExtensionTextureFloatLinear) {
            console.log('Float textures with linear filtering not supported.');
            __touch(16467);
        }
        if (!this.glExtensionStandardDerivatives) {
            console.log('Standard derivatives not supported.');
            __touch(16468);
        }
        if (!this.glExtensionTextureFilterAnisotropic) {
            console.log('Anisotropic texture filtering not supported.');
            __touch(16469);
        }
        if (!this.glExtensionCompressedTextureS3TC) {
            console.log('S3TC compressed textures not supported.');
            __touch(16470);
        }
        if (!this.glExtensionDepthTexture) {
            console.log('Depth textures not supported.');
            __touch(16471);
        }
        if (!this.glExtensionElementIndexUInt) {
            console.log('32 bit indices not supported.');
            __touch(16472);
        }
        if (this.context.getShaderPrecisionFormat === undefined) {
            this.context.getShaderPrecisionFormat = function () {
                return {
                    'rangeMin': 1,
                    'rangeMax': 1,
                    'precision': 1
                };
                __touch(16474);
            };
            __touch(16473);
        }
        this.capabilities = {
            maxTexureSize: this.context.getParameter(WebGLRenderingContext.MAX_TEXTURE_SIZE),
            maxCubemapSize: this.context.getParameter(WebGLRenderingContext.MAX_CUBE_MAP_TEXTURE_SIZE),
            maxRenderbufferSize: this.context.getParameter(WebGLRenderingContext.MAX_RENDERBUFFER_SIZE),
            maxViewPortDims: this.context.getParameter(WebGLRenderingContext.MAX_VIEWPORT_DIMS),
            maxAnisotropy: this.glExtensionTextureFilterAnisotropic ? this.context.getParameter(this.glExtensionTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0,
            maxVertexTextureUnits: this.context.getParameter(WebGLRenderingContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxFragmentTextureUnits: this.context.getParameter(WebGLRenderingContext.MAX_TEXTURE_IMAGE_UNITS),
            maxCombinedTextureUnits: this.context.getParameter(WebGLRenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexAttributes: this.context.getParameter(WebGLRenderingContext.MAX_VERTEX_ATTRIBS),
            maxVertexUniformVectors: this.context.getParameter(WebGLRenderingContext.MAX_VERTEX_UNIFORM_VECTORS),
            maxFragmentUniformVectors: this.context.getParameter(WebGLRenderingContext.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxVaryingVectors: this.context.getParameter(WebGLRenderingContext.MAX_VARYING_VECTORS),
            aliasedPointSizeRange: this.context.getParameter(WebGLRenderingContext.ALIASED_POINT_SIZE_RANGE),
            aliasedLineWidthRange: this.context.getParameter(WebGLRenderingContext.ALIASED_LINE_WIDTH_RANGE),
            samples: this.context.getParameter(WebGLRenderingContext.SAMPLES),
            sampleBuffers: this.context.getParameter(WebGLRenderingContext.SAMPLE_BUFFERS),
            depthBits: this.context.getParameter(WebGLRenderingContext.DEPTH_BITS),
            stencilBits: this.context.getParameter(WebGLRenderingContext.STENCIL_BITS),
            subpixelBits: this.context.getParameter(WebGLRenderingContext.SUBPIXEL_BITS),
            supportedExtensionsList: this.context.getSupportedExtensions(),
            renderer: this.context.getParameter(WebGLRenderingContext.RENDERER),
            vendor: this.context.getParameter(WebGLRenderingContext.VENDOR),
            version: this.context.getParameter(WebGLRenderingContext.VERSION),
            shadingLanguageVersion: this.context.getParameter(WebGLRenderingContext.SHADING_LANGUAGE_VERSION),
            vertexShaderHighpFloat: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.HIGH_FLOAT),
            vertexShaderMediumpFloat: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.MEDIUM_FLOAT),
            vertexShaderLowpFloat: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.LOW_FLOAT),
            fragmentShaderHighpFloat: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.HIGH_FLOAT),
            fragmentShaderMediumpFloat: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.MEDIUM_FLOAT),
            fragmentShaderLowpFloat: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.LOW_FLOAT),
            vertexShaderHighpInt: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.HIGH_INT),
            vertexShaderMediumpInt: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.MEDIUM_INT),
            vertexShaderLowpInt: this.context.getShaderPrecisionFormat(this.context.VERTEX_SHADER, this.context.LOW_INT),
            fragmentShaderHighpInt: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.HIGH_INT),
            fragmentShaderMediumpInt: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.MEDIUM_INT),
            fragmentShaderLowpInt: this.context.getShaderPrecisionFormat(this.context.FRAGMENT_SHADER, this.context.LOW_INT)
        };
        __touch(16418);
        this.maxTextureSize = !isNaN(parameters.maxTextureSize) ? Math.min(parameters.maxTextureSize, this.capabilities.maxTexureSize) : this.capabilities.maxTexureSize;
        __touch(16419);
        this.maxCubemapSize = !isNaN(parameters.maxTextureSize) ? Math.min(parameters.maxTextureSize, this.capabilities.maxCubemapSize) : this.capabilities.maxCubemapSize;
        __touch(16420);
        this.shaderPrecision = parameters.shaderPrecision || 'highp';
        __touch(16421);
        if (this.shaderPrecision === 'highp' && this.capabilities.vertexShaderHighpFloat.precision > 0 && this.capabilities.fragmentShaderHighpFloat.precision > 0) {
            this.shaderPrecision = 'highp';
            __touch(16475);
        } else if (this.shaderPrecision !== 'lowp' && this.capabilities.vertexShaderMediumpFloat.precision > 0 && this.capabilities.fragmentShaderMediumpFloat.precision > 0) {
            this.shaderPrecision = 'mediump';
            __touch(16476);
        } else {
            this.shaderPrecision = 'lowp';
            __touch(16477);
        }
        this.downScale = parameters.downScale || 1;
        __touch(16422);
        this.clearColor = new Vector4();
        __touch(16423);
        this._clearColor = new Float64Array(4);
        __touch(16424);
        this.setClearColor(0.3, 0.3, 0.3, 1);
        __touch(16425);
        this.context.clearDepth(1);
        __touch(16426);
        this.context.clearStencil(0);
        __touch(16427);
        this.context.stencilMask(0);
        __touch(16428);
        this.context.enable(WebGLRenderingContext.DEPTH_TEST);
        __touch(16429);
        this.context.depthFunc(WebGLRenderingContext.LEQUAL);
        __touch(16430);
        this.viewportX = 0;
        __touch(16431);
        this.viewportY = 0;
        __touch(16432);
        this.viewportWidth = 0;
        __touch(16433);
        this.viewportHeight = 0;
        __touch(16434);
        this.currentWidth = 0;
        __touch(16435);
        this.currentHeight = 0;
        __touch(16436);
        this.devicePixelRatio = 1;
        __touch(16437);
        this._overrideMaterials = [];
        __touch(16438);
        this._mergedMaterial = new Material('Merged Material');
        __touch(16439);
        this.renderQueue = new RenderQueue();
        __touch(16440);
        this.info = {
            calls: 0,
            vertices: 0,
            indices: 0,
            reset: function () {
                this.calls = 0;
                __touch(16478);
                this.vertices = 0;
                __touch(16479);
                this.indices = 0;
                __touch(16480);
            },
            toString: function () {
                return 'Calls: ' + this.calls + '<br/>Vertices: ' + this.vertices + '<br/>Indices: ' + this.indices;
                __touch(16481);
            }
        };
        __touch(16441);
        this.shadowHandler = new ShadowHandler();
        __touch(16442);
        this.hardwarePicking = null;
        __touch(16443);
        SystemBus.addListener('goo.setClearColor', function (color) {
            this.setClearColor.apply(this, color);
            __touch(16482);
        }.bind(this));
        __touch(16444);
        if (document.createElementNS) {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            __touch(16483);
            this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            __touch(16484);
            this.svg.setAttribute('version', '1.1');
            __touch(16485);
            this.svg.style.position = 'absolute';
            __touch(16486);
            this.svg.style.display = 'none';
            __touch(16487);
            document.body.appendChild(this.svg);
            __touch(16488);
        } else {
            this.svg = { currentScale: 1 };
            __touch(16489);
        }
        SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
            Renderer.mainCamera = newCam.camera;
            __touch(16490);
            this.checkResize(Renderer.mainCamera);
            __touch(16491);
        }.bind(this));
        __touch(16445);
        this._definesIndices = [];
        __touch(16446);
    }
    __touch(16316);
    function validateNoneOfTheArgsAreUndefined(functionName, args) {
        for (var ii = 0; ii < args.length; ++ii) {
            if (args[ii] === undefined) {
                console.error('undefined passed to gl.' + functionName + '(' + window.WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ')');
                __touch(16492);
            }
        }
    }
    __touch(16317);
    Renderer.prototype.onDebugError = function (err, functionName, args) {
        var message = 'WebGL error ' + window.WebGLDebugUtils.glEnumToString(err) + ' in ' + functionName + '(';
        __touch(16493);
        for (var ii = 0; ii < args.length; ++ii) {
            message += (ii === 0 ? '' : ', ') + window.WebGLDebugUtils.glFunctionArgToString(functionName, ii, args[ii]);
            __touch(16496);
        }
        message += ')';
        __touch(16494);
        console.error(message);
        __touch(16495);
        if (this._onError) {
            this._onError(message);
            __touch(16497);
        }
    };
    __touch(16318);
    Renderer.mainCamera = null;
    __touch(16319);
    Renderer.prototype.checkResize = function (camera) {
        var devicePixelRatio = this.devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;
        __touch(16498);
        var adjustWidth, adjustHeight;
        __touch(16499);
        if (document.querySelector) {
            adjustWidth = this.domElement.offsetWidth;
            __touch(16506);
            adjustHeight = this.domElement.offsetHeight;
            __touch(16507);
        } else {
            adjustWidth = window.innerWidth;
            __touch(16508);
            adjustHeight = window.innerHeight;
            __touch(16509);
        }
        adjustWidth = adjustWidth * devicePixelRatio / this.downScale;
        __touch(16500);
        adjustHeight = adjustHeight * devicePixelRatio / this.downScale;
        __touch(16501);
        var fullWidth = adjustWidth;
        __touch(16502);
        var fullHeight = adjustHeight;
        __touch(16503);
        if (camera && camera.lockedRatio === true && camera.aspect) {
            adjustWidth = adjustHeight * camera.aspect;
            __touch(16510);
        }
        var aspect = adjustWidth / adjustHeight;
        __touch(16504);
        this.setSize(adjustWidth, adjustHeight, fullWidth, fullHeight);
        __touch(16505);
        if (camera && camera.lockedRatio === false && camera.aspect !== aspect) {
            camera.aspect = aspect;
            __touch(16511);
            if (camera.projectionMode === 0) {
                camera.setFrustumPerspective();
                __touch(16513);
            } else {
                camera.setFrustum();
                __touch(16514);
            }
            camera.onFrameChange();
            __touch(16512);
        }
    };
    __touch(16320);
    Renderer.prototype.setSize = function (width, height, fullWidth, fullHeight) {
        if (fullWidth === undefined) {
            fullWidth = width;
            __touch(16519);
        }
        if (fullHeight === undefined) {
            fullHeight = height;
            __touch(16520);
        }
        this.domElement.width = fullWidth;
        __touch(16515);
        this.domElement.height = fullHeight;
        __touch(16516);
        if (width > fullWidth) {
            var mult = fullWidth / width;
            __touch(16521);
            width = fullWidth;
            __touch(16522);
            height = fullHeight * mult;
            __touch(16523);
        }
        var w = (fullWidth - width) * 0.5;
        __touch(16517);
        var h = (fullHeight - height) * 0.5;
        __touch(16518);
        if (w !== this.viewportX || h !== this.viewportY || width !== this.viewportWidth || height !== this.viewportHeight) {
            this.setViewport(w, h, width, height);
            __touch(16524);
            if (this.hardwarePicking !== null) {
                this.hardwarePicking.pickingTarget = null;
                __touch(16525);
            }
        }
    };
    __touch(16321);
    Renderer.prototype.setViewport = function (x, y, width, height) {
        this.viewportX = x !== undefined ? x : 0;
        __touch(16526);
        this.viewportY = y !== undefined ? y : 0;
        __touch(16527);
        this.viewportWidth = width !== undefined ? width : this.domElement.width;
        __touch(16528);
        this.viewportHeight = height !== undefined ? height : this.domElement.height;
        __touch(16529);
        this.context.viewport(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);
        __touch(16530);
        SystemBus.emit('goo.viewportResize', {
            x: this.viewportX,
            y: this.viewportY,
            width: this.viewportWidth,
            height: this.viewportHeight
        }, true);
        __touch(16531);
    };
    __touch(16322);
    Renderer.prototype.setClearColor = function (r, g, b, a) {
        if (this._clearColor[0] === r && this._clearColor[1] === g && this._clearColor[2] === b && this._clearColor[3] === a) {
            return;
            __touch(16538);
        }
        this._clearColor[0] = r;
        __touch(16532);
        this._clearColor[1] = g;
        __touch(16533);
        this._clearColor[2] = b;
        __touch(16534);
        this._clearColor[3] = a;
        __touch(16535);
        this.clearColor.seta(this._clearColor);
        __touch(16536);
        this.context.clearColor(r, g, b, a);
        __touch(16537);
    };
    __touch(16323);
    Renderer.prototype.bindData = function (bufferData) {
        var glBuffer = bufferData.glBuffer;
        __touch(16539);
        if (glBuffer !== null) {
            this.setBoundBuffer(glBuffer, bufferData.target);
            __touch(16540);
            if (bufferData._dataNeedsRefresh) {
                this.context.bufferSubData(this.getGLBufferTarget(bufferData.target), 0, bufferData.data);
                __touch(16541);
                bufferData._dataNeedsRefresh = false;
                __touch(16542);
            }
        } else {
            glBuffer = this.context.createBuffer();
            __touch(16543);
            bufferData.glBuffer = glBuffer;
            __touch(16544);
            this.rendererRecord.invalidateBuffer(bufferData.target);
            __touch(16545);
            this.setBoundBuffer(glBuffer, bufferData.target);
            __touch(16546);
            this.context.bufferData(this.getGLBufferTarget(bufferData.target), bufferData.data, this.getGLBufferUsage(bufferData._dataUsage));
            __touch(16547);
        }
    };
    __touch(16324);
    Renderer.prototype.setShadowType = function (type) {
        this.shadowHandler.shadowType = type;
        __touch(16548);
    };
    __touch(16325);
    Renderer.prototype.updateShadows = function (partitioner, entities, lights) {
        this.shadowHandler.checkShadowRendering(this, partitioner, entities, lights);
        __touch(16549);
    };
    __touch(16326);
    Renderer.prototype.preloadTexture = function (context, texture) {
        context.bindTexture(this.getGLType(texture.variant), texture.glTexture);
        __touch(16550);
        context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, texture.unpackAlignment);
        __touch(16551);
        context.pixelStorei(WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        __touch(16552);
        context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        __touch(16553);
        var image = texture.image;
        __touch(16554);
        if (texture.variant === '2D') {
            if (!image) {
                context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
                __touch(16555);
            } else {
                if (!image.isCompressed && (texture.generateMipmaps || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
                    this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
                    __touch(16556);
                    image = texture.image;
                    __touch(16557);
                }
                if (image.isData === true) {
                    if (image.isCompressed) {
                        this.loadCompressedTexture(context, WebGLRenderingContext.TEXTURE_2D, texture, image.data);
                        __touch(16558);
                    } else {
                        context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), image.width, image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data);
                        __touch(16559);
                    }
                } else {
                    context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image);
                    __touch(16560);
                }
                if (texture.generateMipmaps && !image.isCompressed) {
                    context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
                    __touch(16561);
                }
            }
        } else if (texture.variant === 'CUBE') {
            if (image && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
                for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
                    if (image.data[i] && !image.data[i].buffer) {
                        Util.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
                        __touch(16565);
                    } else {
                        Util.getBlankImage(texture, [
                            0.3,
                            0.3,
                            0.3,
                            0
                        ], image.width, image.height, this.maxCubemapSize, i);
                        __touch(16566);
                    }
                }
                texture.image.width = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.width));
                __touch(16562);
                texture.image.height = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.height));
                __touch(16563);
                image = texture.image;
                __touch(16564);
            }
            for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
                var face = Texture.CUBE_FACES[faceIndex];
                __touch(16567);
                if (!image) {
                    context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
                    __touch(16568);
                } else {
                    if (image.isData === true) {
                        if (image.isCompressed) {
                            this.loadCompressedTexture(context, this.getGLCubeMapFace(face), texture, image.data[faceIndex]);
                            __touch(16569);
                        } else {
                            context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), image.width, image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data[faceIndex]);
                            __touch(16570);
                        }
                    } else {
                        context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data[faceIndex]);
                        __touch(16571);
                    }
                }
            }
            if (image && texture.generateMipmaps && !image.isCompressed) {
                context.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP);
                __touch(16572);
            }
        }
    };
    __touch(16327);
    Renderer.prototype.preloadTextures = function (material, queue) {
        var context = this.context;
        __touch(16573);
        var textureKeys = Object.keys(material._textureMaps);
        __touch(16574);
        textureKeys.forEach(function (textureKey) {
            var texture = material.getTexture(textureKey);
            __touch(16576);
            if (texture === undefined) {
                return;
                __touch(16579);
            }
            var textureList = texture;
            __touch(16577);
            if (texture instanceof Array === false) {
                textureList = [texture];
                __touch(16580);
            }
            textureList.forEach(function (texture) {
                queue.push(function () {
                    if (texture === null || texture instanceof RenderTarget === false && (texture.image === undefined || texture.checkDataReady() === false)) {
                        if (texture.variant === '2D') {
                            texture = TextureCreator.DEFAULT_TEXTURE_2D;
                            __touch(16582);
                        } else if (texture.variant === 'CUBE') {
                            texture = TextureCreator.DEFAULT_TEXTURE_CUBE;
                            __touch(16583);
                        }
                    }
                    if (texture.glTexture === null) {
                        texture.glTexture = context.createTexture();
                        __touch(16584);
                        this.preloadTexture(context, texture);
                        __touch(16585);
                        texture.needsUpdate = false;
                        __touch(16586);
                    } else if (texture instanceof RenderTarget === false && texture.checkNeedsUpdate()) {
                        this.preloadTexture(context, texture);
                        __touch(16587);
                        texture.needsUpdate = false;
                        __touch(16588);
                    }
                }.bind(this));
                __touch(16581);
            }.bind(this));
            __touch(16578);
        }.bind(this));
        __touch(16575);
    };
    __touch(16328);
    var preloadMaterialsRenderInfo = new RenderInfo();
    __touch(16329);
    Renderer.prototype.preloadMaterials = function (renderList) {
        var queue = [];
        __touch(16589);
        var renderInfo = preloadMaterialsRenderInfo;
        __touch(16590);
        renderInfo.reset();
        __touch(16591);
        if (Array.isArray(renderList)) {
            for (var i = 0; i < renderList.length; i++) {
                var renderable = renderList[i];
                __touch(16593);
                if (renderable.isSkybox && this._overrideMaterials.length > 0) {
                    continue;
                    __touch(16595);
                }
                renderInfo.fill(renderable);
                __touch(16594);
                for (var j = 0; j < renderInfo.materials.length; j++) {
                    this.preloadTextures(renderInfo.materials[j], queue);
                    __touch(16596);
                }
            }
        } else {
            renderInfo.fill(renderList);
            __touch(16597);
            for (var j = 0; j < renderInfo.materials.length; j++) {
                this.preloadTextures(renderInfo.materials[j], queue);
                __touch(16598);
            }
        }
        return TaskScheduler.each(queue);
        __touch(16592);
    };
    __touch(16330);
    Renderer.prototype.precompileShader = function (material, renderInfo, queue) {
        var shader = material.shader;
        __touch(16599);
        if (shader.processors || shader.defines) {
            if (shader.processors) {
                for (var j = 0; j < shader.processors.length; j++) {
                    shader.processors[j](shader, renderInfo);
                    __touch(16603);
                }
            }
            var defineKey = this.makeKey(shader);
            __touch(16601);
            var shaderCache = this.rendererRecord.shaderCache;
            __touch(16602);
            if (!shaderCache[defineKey]) {
                if (shader.builder) {
                    shader.builder(shader, renderInfo);
                    __touch(16606);
                }
                shader = material.shader = shader.clone();
                __touch(16604);
                shaderCache[defineKey] = shader;
                __touch(16605);
            } else {
                shader = shaderCache[defineKey];
                __touch(16607);
                if (shader !== material.shader) {
                    var uniforms = material.shader.uniforms;
                    __touch(16608);
                    var keys = Object.keys(uniforms);
                    __touch(16609);
                    for (var ii = 0, l = keys.length; ii < l; ii++) {
                        var key = keys[ii];
                        __touch(16611);
                        var origUniform = shader.uniforms[key] = uniforms[key];
                        __touch(16612);
                        if (origUniform instanceof Array) {
                            shader.uniforms[key] = origUniform.slice(0);
                            __touch(16613);
                        }
                    }
                    material.shader = shader;
                    __touch(16610);
                }
            }
        }
        queue.push(function () {
            shader.precompile(this);
            __touch(16614);
        }.bind(this));
        __touch(16600);
    };
    __touch(16331);
    Renderer.prototype.clearShaderCache = function () {
        var cache = this.rendererRecord.shaderCache;
        __touch(16615);
        if (!cache) {
            return;
            __touch(16617);
        }
        var keys = Object.keys(cache);
        __touch(16616);
        for (var i = 0; i < keys.length; i++) {
            delete cache[keys[i]];
            __touch(16618);
        }
    };
    __touch(16332);
    Renderer.prototype.precompileShaders = function (renderList, lights) {
        var renderInfo = new RenderInfo();
        __touch(16619);
        if (lights) {
            renderInfo.lights = lights;
            __touch(16622);
        }
        var queue = [];
        __touch(16620);
        if (Array.isArray(renderList)) {
            for (var i = 0; i < renderList.length; i++) {
                var renderable = renderList[i];
                __touch(16623);
                if (renderable.isSkybox && this._overrideMaterials.length > 0) {
                    continue;
                    __touch(16625);
                }
                renderInfo.fill(renderable);
                __touch(16624);
                for (var j = 0; j < renderInfo.materials.length; j++) {
                    renderInfo.material = renderInfo.materials[j];
                    __touch(16626);
                    this.precompileShader(renderInfo.materials[j], renderInfo, queue);
                    __touch(16627);
                }
            }
        } else {
            renderInfo.fill(renderList);
            __touch(16628);
            for (var j = 0; j < renderInfo.materials.length; j++) {
                renderInfo.material = renderInfo.materials[j];
                __touch(16629);
                this.precompileShader(renderInfo.materials[j], renderInfo, queue);
                __touch(16630);
            }
        }
        return TaskScheduler.each(queue);
        __touch(16621);
    };
    __touch(16333);
    Renderer.prototype.preloadBuffers = function (renderList) {
        var renderInfo = new RenderInfo();
        __touch(16631);
        if (Array.isArray(renderList)) {
            for (var i = 0; i < renderList.length; i++) {
                var renderable = renderList[i];
                __touch(16632);
                if (renderable.isSkybox && this._overrideMaterials.length > 0) {
                    continue;
                    __touch(16634);
                }
                renderInfo.fill(renderable);
                __touch(16633);
                for (var j = 0; j < renderInfo.materials.length; j++) {
                    renderInfo.material = renderInfo.materials[j];
                    __touch(16635);
                    this.preloadBuffer(renderable, renderInfo.materials[j], renderInfo);
                    __touch(16636);
                }
            }
        } else {
            renderInfo.fill(renderList);
            __touch(16637);
            for (var j = 0; j < renderInfo.materials.length; j++) {
                renderInfo.material = renderInfo.materials[j];
                __touch(16638);
                this.preloadBuffer(renderList, renderInfo.materials[j], renderInfo);
                __touch(16639);
            }
        }
    };
    __touch(16334);
    Renderer.prototype.preloadBuffer = function (renderable, material, renderInfo) {
        var meshData = renderInfo.meshData;
        __touch(16640);
        if (meshData.vertexData === null || meshData.vertexData !== null && meshData.vertexData.data.byteLength === 0 || meshData.indexData !== null && meshData.indexData.data.byteLength === 0) {
            return;
            __touch(16646);
        }
        this.bindData(meshData.vertexData);
        __touch(16641);
        if (meshData.getIndexBuffer() !== null) {
            this.bindData(meshData.getIndexData());
            __touch(16647);
        }
        var materials = renderInfo.materials;
        __touch(16642);
        var flatOrWire = null;
        __touch(16643);
        var originalData = meshData;
        __touch(16644);
        var count = 0;
        __touch(16645);
        if (this._overrideMaterials.length === 0) {
            count = materials.length;
            __touch(16648);
        } else {
            count = this._overrideMaterials.length;
            __touch(16649);
        }
        for (var i = 0; i < count; i++) {
            var material = null, orMaterial = null;
            __touch(16650);
            if (i < materials.length) {
                material = materials[i];
                __touch(16651);
            }
            if (i < this._overrideMaterials.length) {
                orMaterial = this._overrideMaterials[i];
                __touch(16652);
            }
            if (material && orMaterial) {
                this._override(orMaterial, material, this._mergedMaterial);
                __touch(16653);
                material = this._mergedMaterial;
                __touch(16654);
            } else if (orMaterial) {
                material = orMaterial;
                __touch(16655);
            }
            if (!material.shader) {
                if (!material.errorOnce) {
                    console.warn('No shader set on material: ' + material.name);
                    __touch(16657);
                    material.errorOnce = true;
                    __touch(16658);
                }
                continue;
                __touch(16656);
            } else {
                material.errorOnce = false;
                __touch(16659);
            }
            if (material.wireframe && flatOrWire !== 'wire') {
                if (!meshData.wireframeData) {
                    meshData.wireframeData = meshData.buildWireframeData();
                    __touch(16663);
                }
                meshData = meshData.wireframeData;
                __touch(16660);
                this.bindData(meshData.vertexData);
                __touch(16661);
                flatOrWire = 'wire';
                __touch(16662);
            } else if (material.flat && flatOrWire !== 'flat') {
                if (!meshData.flatMeshData) {
                    meshData.flatMeshData = meshData.buildFlatMeshData();
                    __touch(16667);
                }
                meshData = meshData.flatMeshData;
                __touch(16664);
                this.bindData(meshData.vertexData);
                __touch(16665);
                flatOrWire = 'flat';
                __touch(16666);
            } else if (!material.wireframe && !material.flat && flatOrWire !== null) {
                meshData = originalData;
                __touch(16668);
                this.bindData(meshData.vertexData);
                __touch(16669);
                flatOrWire = null;
                __touch(16670);
            }
        }
    };
    __touch(16335);
    var renderRenderInfo = new RenderInfo();
    __touch(16336);
    Renderer.prototype.render = function (renderList, camera, lights, renderTarget, clear, overrideMaterials) {
        if (overrideMaterials) {
            this._overrideMaterials = overrideMaterials instanceof Array ? overrideMaterials : [overrideMaterials];
            __touch(16679);
        } else {
            this._overrideMaterials = [];
            __touch(16680);
        }
        if (!camera) {
            return;
            __touch(16681);
        } else if (Renderer.mainCamera === null) {
            Renderer.mainCamera = camera;
            __touch(16682);
        }
        this.setRenderTarget(renderTarget);
        __touch(16671);
        if (clear === undefined || clear === null || clear === true) {
            this.clear();
            __touch(16683);
        } else if (typeof clear === 'object') {
            this.clear(clear.color, clear.depth, clear.stencil);
            __touch(16684);
        }
        var renderInfo = renderRenderInfo;
        __touch(16672);
        renderInfo.reset();
        __touch(16673);
        renderInfo.camera = camera;
        __touch(16674);
        renderInfo.mainCamera = Renderer.mainCamera;
        __touch(16675);
        renderInfo.lights = lights;
        __touch(16676);
        renderInfo.shadowHandler = this.shadowHandler;
        __touch(16677);
        renderInfo.renderer = this;
        __touch(16678);
        if (Array.isArray(renderList)) {
            this.renderQueue.sort(renderList, camera);
            __touch(16685);
            for (var i = 0; i < renderList.length; i++) {
                var renderable = renderList[i];
                __touch(16686);
                if (renderable.isSkybox && this._overrideMaterials.length > 0) {
                    continue;
                    __touch(16689);
                }
                renderInfo.fill(renderable);
                __touch(16687);
                this.renderMesh(renderInfo);
                __touch(16688);
            }
        } else {
            renderInfo.fill(renderList);
            __touch(16690);
            this.renderMesh(renderInfo);
            __touch(16691);
        }
        if (renderTarget && renderTarget.generateMipmaps && Util.isPowerOfTwo(renderTarget.width) && Util.isPowerOfTwo(renderTarget.height)) {
            this.updateRenderTargetMipmap(renderTarget);
            __touch(16692);
        }
    };
    __touch(16337);
    Renderer.prototype._override = function (mat1, mat2, store) {
        store.empty();
        __touch(16693);
        var keys = Object.keys(store);
        __touch(16694);
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            __touch(16695);
            var storeVal = store[key];
            __touch(16696);
            var mat1Val = mat1[key];
            __touch(16697);
            var mat2Val = mat2[key];
            __touch(16698);
            if (storeVal instanceof Object && key !== 'shader') {
                var matkeys = Object.keys(mat1Val);
                __touch(16699);
                for (var j = 0, l2 = matkeys.length; j < l2; j++) {
                    var prop = matkeys[j];
                    __touch(16701);
                    storeVal[prop] = mat1Val[prop];
                    __touch(16702);
                }
                var matkeys = Object.keys(mat2Val);
                __touch(16700);
                for (var j = 0, l2 = matkeys.length; j < l2; j++) {
                    var prop = matkeys[j];
                    __touch(16703);
                    if (storeVal[prop] === undefined) {
                        storeVal[prop] = mat2Val[prop];
                        __touch(16704);
                    }
                }
            } else {
                if (mat1Val !== undefined) {
                    store[key] = mat1Val;
                    __touch(16705);
                } else {
                    store[key] = mat2Val;
                    __touch(16706);
                }
            }
        }
    };
    __touch(16338);
    Renderer.prototype.renderMesh = function (renderInfo) {
        var meshData = renderInfo.meshData;
        __touch(16707);
        if (!meshData || meshData.vertexData === null || meshData.vertexData !== null && meshData.vertexData.data.byteLength === 0 || meshData.indexData !== null && meshData.indexData.data.byteLength === 0) {
            return;
            __touch(16713);
        }
        this.bindData(meshData.vertexData);
        __touch(16708);
        var materials = renderInfo.materials;
        __touch(16709);
        var flatOrWire = null;
        __touch(16710);
        var originalData = meshData;
        __touch(16711);
        var count = 0;
        __touch(16712);
        if (this._overrideMaterials.length === 0) {
            count = materials.length;
            __touch(16714);
        } else {
            count = this._overrideMaterials.length;
            __touch(16715);
        }
        for (var i = 0; i < count; i++) {
            this.renderMeshMaterial(i, materials, flatOrWire, originalData, renderInfo);
            __touch(16716);
        }
    };
    __touch(16339);
    Renderer.prototype.callShaderProcessors = function (material, renderInfo) {
        if (material.shader.processors || material.shader.defines) {
            var shader = material.shader;
            __touch(16717);
            if (shader.processors) {
                for (var j = 0; j < shader.processors.length; j++) {
                    shader.processors[j](shader, renderInfo);
                    __touch(16719);
                }
            }
            material.shader = this.findOrCacheMaterialShader(material, shader, renderInfo);
            __touch(16718);
        }
    };
    __touch(16340);
    Renderer.prototype.renderMeshMaterial = function (materialIndex, materials, flatOrWire, originalData, renderInfo) {
        var material = null, orMaterial = null;
        __touch(16720);
        if (materialIndex < materials.length) {
            material = materials[materialIndex];
            __touch(16737);
        }
        if (materialIndex < this._overrideMaterials.length) {
            orMaterial = this._overrideMaterials[materialIndex];
            __touch(16738);
        }
        material = this.configureRenderInfo(renderInfo, materialIndex, material, orMaterial, originalData, flatOrWire);
        __touch(16721);
        var meshData = renderInfo.meshData;
        __touch(16722);
        this.callShaderProcessors(material, renderInfo);
        __touch(16723);
        material.shader.apply(renderInfo, this);
        __touch(16724);
        this.updateDepthTest(material);
        __touch(16725);
        this.updateCulling(material);
        __touch(16726);
        this.updateBlending(material);
        __touch(16727);
        this.updateOffset(material);
        __touch(16728);
        this.updateTextures(material);
        __touch(16729);
        this.updateLineAndPointSettings(material);
        __touch(16730);
        this._checkDualTransparency(material, meshData);
        __touch(16731);
        this.updateCulling(material);
        __touch(16732);
        this._drawBuffers(meshData);
        __touch(16733);
        this.info.calls++;
        __touch(16734);
        this.info.vertices += meshData.vertexCount;
        __touch(16735);
        this.info.indices += meshData.indexCount;
        __touch(16736);
    };
    __touch(16341);
    Renderer.prototype._drawBuffers = function (meshData) {
        if (meshData.getIndexBuffer() !== null) {
            this.bindData(meshData.getIndexData());
            __touch(16739);
            if (meshData.getIndexLengths() !== null) {
                this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), meshData.getIndexLengths());
                __touch(16740);
            } else {
                this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), [meshData.getIndexBuffer().length]);
                __touch(16741);
            }
        } else {
            if (meshData.getIndexLengths() !== null) {
                this.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths());
                __touch(16742);
            } else {
                this.drawArraysVBO(meshData.getIndexModes(), [meshData.vertexCount]);
                __touch(16743);
            }
        }
    };
    __touch(16342);
    Renderer.prototype.configureRenderInfo = function (renderInfo, materialIndex, material, orMaterial, originalData, flatOrWire) {
        var meshData = renderInfo.meshData;
        __touch(16744);
        if (materialIndex < this._overrideMaterials.length) {
            orMaterial = this._overrideMaterials[materialIndex];
            __touch(16748);
        }
        if (material && orMaterial) {
            this._override(orMaterial, material, this._mergedMaterial);
            __touch(16749);
            material = this._mergedMaterial;
            __touch(16750);
        } else if (orMaterial) {
            material = orMaterial;
            __touch(16751);
        }
        if (!material.shader) {
            if (!material.errorOnce) {
                console.warn('No shader set on material: ' + material.name);
                __touch(16753);
                material.errorOnce = true;
                __touch(16754);
            }
            return;
            __touch(16752);
        } else {
            material.errorOnce = false;
            __touch(16755);
        }
        if (material.wireframe && flatOrWire !== 'wire') {
            if (!meshData.wireframeData) {
                meshData.wireframeData = meshData.buildWireframeData();
                __touch(16759);
            }
            meshData = meshData.wireframeData;
            __touch(16756);
            this.bindData(meshData.vertexData);
            __touch(16757);
            flatOrWire = 'wire';
            __touch(16758);
        } else if (material.flat && flatOrWire !== 'flat') {
            if (!meshData.flatMeshData) {
                meshData.flatMeshData = meshData.buildFlatMeshData();
                __touch(16763);
            }
            meshData = meshData.flatMeshData;
            __touch(16760);
            this.bindData(meshData.vertexData);
            __touch(16761);
            flatOrWire = 'flat';
            __touch(16762);
        } else if (!material.wireframe && !material.flat && flatOrWire !== null) {
            meshData = originalData;
            __touch(16764);
            this.bindData(meshData.vertexData);
            __touch(16765);
            flatOrWire = null;
            __touch(16766);
        }
        renderInfo.material = material;
        __touch(16745);
        renderInfo.meshData = meshData;
        __touch(16746);
        return material;
        __touch(16747);
    };
    __touch(16343);
    Renderer.prototype.findOrCacheMaterialShader = function (material, shader, renderInfo) {
        var defineKey = this.makeKey(shader);
        __touch(16767);
        var shaderCache = this.rendererRecord.shaderCache;
        __touch(16768);
        if (!shaderCache[defineKey]) {
            if (shader.builder) {
                shader.builder(shader, renderInfo);
                __touch(16772);
            }
            shader = shader.clone();
            __touch(16770);
            shaderCache[defineKey] = shader;
            __touch(16771);
        } else {
            shader = shaderCache[defineKey];
            __touch(16773);
            if (shader !== material.shader) {
                var uniforms = material.shader.uniforms;
                __touch(16774);
                var keys = Object.keys(uniforms);
                __touch(16775);
                for (var i = 0, l = keys.length; i < l; i++) {
                    var key = keys[i];
                    __touch(16776);
                    var origUniform = shader.uniforms[key] = uniforms[key];
                    __touch(16777);
                    if (origUniform instanceof Array) {
                        shader.uniforms[key] = origUniform.slice(0);
                        __touch(16778);
                    }
                }
            }
        }
        return shader;
        __touch(16769);
    };
    __touch(16344);
    Renderer.prototype.makeKey = function (shader) {
        var defineArray = Object.keys(shader.defines);
        __touch(16779);
        var key = 'Key:' + shader.name;
        __touch(16780);
        for (var i = 0, l = defineArray.length; i < l; i++) {
            var defineIndex = this._definesIndices.indexOf(defineArray[i]);
            __touch(16782);
            if (defineIndex === -1) {
                this._definesIndices.push(defineArray[i]);
                __touch(16784);
                defineIndex = this._definesIndices.length;
                __touch(16785);
            }
            key += '_' + defineIndex + ':' + shader.defines[defineArray[i]];
            __touch(16783);
        }
        return key;
        __touch(16781);
    };
    __touch(16345);
    Renderer.prototype._checkDualTransparency = function (material, meshData) {
        if (material.dualTransparency) {
            var savedCullFace = material.cullState.cullFace;
            __touch(16786);
            var newCullFace = savedCullFace === 'Front' ? 'Back' : 'Front';
            __touch(16787);
            material.cullState.cullFace = newCullFace;
            __touch(16788);
            this.updateCulling(material);
            __touch(16789);
            this._drawBuffers(meshData);
            __touch(16790);
            material.cullState.cullFace = savedCullFace;
            __touch(16791);
        }
    };
    __touch(16346);
    Renderer.prototype.readPixels = function (x, y, width, height, store) {
        store = store || new Uint8Array(width * height * 4);
        __touch(16792);
        this.context.readPixels(x, y, width, height, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, store);
        __touch(16793);
        return store;
        __touch(16794);
    };
    __touch(16347);
    Renderer.prototype.readTexturePixels = function (texture, x, y, width, height, store) {
        store = store || new Uint8Array(width * height * 4);
        __touch(16795);
        var glFrameBuffer = this.context.createFramebuffer();
        __touch(16796);
        this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, glFrameBuffer);
        __touch(16797);
        this.context.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, WebGLRenderingContext.TEXTURE_2D, texture.glTexture, 0);
        __touch(16798);
        if (this.context.checkFramebufferStatus(WebGLRenderingContext.FRAMEBUFFER) === WebGLRenderingContext.FRAMEBUFFER_COMPLETE) {
            this.context.readPixels(x, y, width, height, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, store);
            __touch(16800);
        }
        return store;
        __touch(16799);
    };
    __touch(16348);
    Renderer.prototype.drawElementsVBO = function (indices, indexModes, indexLengths) {
        var offset = 0;
        __touch(16801);
        var indexModeCounter = 0;
        __touch(16802);
        var type = indices.type = indices.type || this.getGLArrayType(indices);
        __touch(16803);
        var byteSize = this.getGLByteSize(indices);
        __touch(16804);
        for (var i = 0; i < indexLengths.length; i++) {
            var count = indexLengths[i];
            __touch(16805);
            var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);
            __touch(16806);
            this.context.drawElements(glIndexMode, count, type, offset * byteSize);
            __touch(16807);
            offset += count;
            __touch(16808);
            if (indexModeCounter < indexModes.length - 1) {
                indexModeCounter++;
                __touch(16809);
            }
        }
    };
    __touch(16349);
    Renderer.prototype.drawArraysVBO = function (indexModes, indexLengths) {
        var offset = 0;
        __touch(16810);
        var indexModeCounter = 0;
        __touch(16811);
        for (var i = 0; i < indexLengths.length; i++) {
            var count = indexLengths[i];
            __touch(16812);
            var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);
            __touch(16813);
            this.context.drawArrays(glIndexMode, offset, count);
            __touch(16814);
            offset += count;
            __touch(16815);
            if (indexModeCounter < indexModes.length - 1) {
                indexModeCounter++;
                __touch(16816);
            }
        }
    };
    __touch(16350);
    Renderer.prototype.renderToPick = function (renderList, camera, clear, skipUpdateBuffer, doScissor, clientX, clientY, customPickingMaterial, skipOverride) {
        if (this.viewportWidth * this.viewportHeight === 0) {
            return;
            __touch(16818);
        }
        var pickingResolutionDivider = 4;
        __touch(16817);
        if (this.hardwarePicking === null) {
            var pickingMaterial = Material.createEmptyMaterial(ShaderLib.pickingShader, 'pickingMaterial');
            __touch(16819);
            pickingMaterial.blendState = {
                blending: 'NoBlending',
                blendEquation: 'AddEquation',
                blendSrc: 'SrcAlphaFactor',
                blendDst: 'OneMinusSrcAlphaFactor'
            };
            __touch(16820);
            pickingMaterial.wireframe = false;
            __touch(16821);
            this.hardwarePicking = {
                pickingTarget: new RenderTarget(this.viewportWidth / pickingResolutionDivider, this.viewportHeight / pickingResolutionDivider, {
                    minFilter: 'NearestNeighborNoMipMaps',
                    magFilter: 'NearestNeighbor'
                }),
                pickingMaterial: pickingMaterial,
                pickingBuffer: new Uint8Array(4),
                clearColorStore: new Vector4()
            };
            __touch(16822);
            skipUpdateBuffer = false;
            __touch(16823);
        } else if (this.hardwarePicking.pickingTarget === null) {
            this.hardwarePicking.pickingTarget = new RenderTarget(this.viewportWidth / pickingResolutionDivider, this.viewportHeight / pickingResolutionDivider, {
                minFilter: 'NearestNeighborNoMipMaps',
                magFilter: 'NearestNeighbor'
            });
            __touch(16824);
            skipUpdateBuffer = false;
            __touch(16825);
        }
        if (!skipUpdateBuffer) {
            this.hardwarePicking.clearColorStore.setv(this.clearColor);
            __touch(16826);
            if (doScissor && clientX !== undefined && clientY !== undefined) {
                var devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;
                __touch(16828);
                var x = Math.floor((clientX * devicePixelRatio - this.viewportX) / pickingResolutionDivider);
                __touch(16829);
                var y = Math.floor((this.viewportHeight - (clientY * devicePixelRatio - this.viewportY)) / pickingResolutionDivider);
                __touch(16830);
                this.context.enable(WebGLRenderingContext.SCISSOR_TEST);
                __touch(16831);
                this.context.scissor(x, y, 1, 1);
                __touch(16832);
            }
            var pickList = [];
            __touch(16827);
            for (var i = 0, l = renderList.length; i < l; i++) {
                var entity = renderList[i];
                __touch(16833);
                if (!entity.meshRendererComponent || entity.meshRendererComponent.isPickable) {
                    pickList.push(entity);
                    __touch(16834);
                }
            }
            if (skipOverride) {
                this.render(pickList, camera, [], this.hardwarePicking.pickingTarget, clear);
                __touch(16835);
            } else {
                this.render(pickList, camera, [], this.hardwarePicking.pickingTarget, clear, customPickingMaterial || this.hardwarePicking.pickingMaterial);
                __touch(16836);
            }
            if (doScissor) {
                this.context.disable(WebGLRenderingContext.SCISSOR_TEST);
                __touch(16837);
            }
        } else {
            this.setRenderTarget(this.hardwarePicking.pickingTarget);
            __touch(16838);
        }
    };
    __touch(16351);
    Renderer.prototype.pick = function (clientX, clientY, pickingStore, camera) {
        if (this.viewportWidth * this.viewportHeight === 0) {
            pickingStore.id = -1;
            __touch(16848);
            pickingStore.depth = 0;
            __touch(16849);
            return;
            __touch(16850);
        }
        var devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;
        __touch(16839);
        var pickingResolutionDivider = 4;
        __touch(16840);
        var x = Math.floor((clientX * devicePixelRatio - this.viewportX) / pickingResolutionDivider);
        __touch(16841);
        var y = Math.floor((this.viewportHeight - (clientY * devicePixelRatio - this.viewportY)) / pickingResolutionDivider);
        __touch(16842);
        this.readPixels(x, y, 1, 1, this.hardwarePicking.pickingBuffer);
        __touch(16843);
        var id = this.hardwarePicking.pickingBuffer[0] * 255 + this.hardwarePicking.pickingBuffer[1] - 1;
        __touch(16844);
        var depth = (this.hardwarePicking.pickingBuffer[2] / 255 + this.hardwarePicking.pickingBuffer[3] / (255 * 255)) * camera.far;
        __touch(16845);
        pickingStore.id = id;
        __touch(16846);
        pickingStore.depth = depth;
        __touch(16847);
    };
    __touch(16352);
    Renderer.prototype.updateLineAndPointSettings = function (material) {
        var record = this.rendererRecord.lineRecord;
        __touch(16851);
        var lineWidth = material.lineWidth || 1;
        __touch(16852);
        if (record.lineWidth !== lineWidth) {
            this.context.lineWidth(lineWidth);
            __touch(16853);
            record.lineWidth = lineWidth;
            __touch(16854);
        }
    };
    __touch(16353);
    Renderer.prototype.updateDepthTest = function (material) {
        var record = this.rendererRecord.depthRecord;
        __touch(16855);
        var depthState = material.depthState;
        __touch(16856);
        if (record.enabled !== depthState.enabled) {
            if (depthState.enabled) {
                this.context.enable(WebGLRenderingContext.DEPTH_TEST);
                __touch(16858);
            } else {
                this.context.disable(WebGLRenderingContext.DEPTH_TEST);
                __touch(16859);
            }
            record.enabled = depthState.enabled;
            __touch(16857);
        }
        if (record.write !== depthState.write) {
            if (depthState.write) {
                this.context.depthMask(true);
                __touch(16861);
            } else {
                this.context.depthMask(false);
                __touch(16862);
            }
            record.write = depthState.write;
            __touch(16860);
        }
    };
    __touch(16354);
    Renderer.prototype.updateCulling = function (material) {
        var record = this.rendererRecord.cullRecord;
        __touch(16863);
        var cullFace = material.cullState.cullFace;
        __touch(16864);
        var frontFace = material.cullState.frontFace;
        __touch(16865);
        var enabled = material.cullState.enabled;
        __touch(16866);
        if (record.enabled !== enabled) {
            if (enabled) {
                this.context.enable(WebGLRenderingContext.CULL_FACE);
                __touch(16868);
            } else {
                this.context.disable(WebGLRenderingContext.CULL_FACE);
                __touch(16869);
            }
            record.enabled = enabled;
            __touch(16867);
        }
        if (record.cullFace !== cullFace) {
            var glCullFace = cullFace === 'Front' ? WebGLRenderingContext.FRONT : cullFace === 'Back' ? WebGLRenderingContext.BACK : WebGLRenderingContext.FRONT_AND_BACK;
            __touch(16870);
            this.context.cullFace(glCullFace);
            __touch(16871);
            record.cullFace = cullFace;
            __touch(16872);
        }
        if (record.frontFace !== frontFace) {
            switch (frontFace) {
            case 'CCW':
                this.context.frontFace(WebGLRenderingContext.CCW);
                break;
            case 'CW':
                this.context.frontFace(WebGLRenderingContext.CW);
                break;
            }
            __touch(16873);
            record.frontFace = frontFace;
            __touch(16874);
        }
    };
    __touch(16355);
    Renderer.prototype.updateTextures = function (material) {
        var context = this.context;
        __touch(16875);
        var textureSlots = material.shader.textureSlots;
        __touch(16876);
        for (var i = 0; i < textureSlots.length; i++) {
            var textureSlot = textureSlots[i];
            __touch(16877);
            var texture = material.getTexture(textureSlot.mapping);
            __touch(16878);
            if (texture === undefined) {
                continue;
                __touch(16880);
            }
            var textureList = texture;
            __touch(16879);
            if (texture instanceof Array === false) {
                textureList = [texture];
                __touch(16881);
            }
            for (var j = 0; j < textureList.length; j++) {
                texture = textureList[j];
                __touch(16882);
                var texIndex = textureSlot.index instanceof Array ? textureSlot.index[j] : textureSlot.index;
                __touch(16883);
                if (texture === null || texture instanceof RenderTarget === false && (texture.image === undefined || texture.checkDataReady() === false)) {
                    if (textureSlot.format === 'sampler2D') {
                        texture = TextureCreator.DEFAULT_TEXTURE_2D;
                        __touch(16888);
                    } else if (textureSlot.format === 'samplerCube') {
                        texture = TextureCreator.DEFAULT_TEXTURE_CUBE;
                        __touch(16889);
                    }
                }
                var unitrecord = this.rendererRecord.textureRecord[texIndex];
                __touch(16884);
                if (unitrecord === undefined) {
                    unitrecord = this.rendererRecord.textureRecord[texIndex] = {};
                    __touch(16890);
                }
                if (texture.glTexture === null) {
                    texture.glTexture = context.createTexture();
                    __touch(16891);
                    this.updateTexture(context, texture, texIndex, unitrecord);
                    __touch(16892);
                    texture.needsUpdate = false;
                    __touch(16893);
                } else if (texture instanceof RenderTarget === false && texture.checkNeedsUpdate()) {
                    this.updateTexture(context, texture, texIndex, unitrecord);
                    __touch(16894);
                    texture.needsUpdate = false;
                    __touch(16895);
                } else {
                    this.bindTexture(context, texture, texIndex, unitrecord);
                    __touch(16896);
                }
                var imageObject = texture.image !== undefined ? texture.image : texture;
                __touch(16885);
                var isTexturePowerOfTwo = Util.isPowerOfTwo(imageObject.width) && Util.isPowerOfTwo(imageObject.height);
                __touch(16886);
                this.updateTextureParameters(texture, isTexturePowerOfTwo);
                __touch(16887);
            }
        }
    };
    __touch(16356);
    Renderer.prototype.updateTextureParameters = function (texture, isImagePowerOfTwo) {
        var context = this.context;
        __touch(16897);
        var texrecord = texture.textureRecord;
        __touch(16898);
        if (texrecord === undefined) {
            texrecord = {};
            __touch(16903);
            texture.textureRecord = texrecord;
            __touch(16904);
        }
        var glType = this.getGLType(texture.variant);
        __touch(16899);
        if (texrecord.magFilter !== texture.magFilter) {
            context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MAG_FILTER, this.getGLMagFilter(texture.magFilter));
            __touch(16905);
            texrecord.magFilter = texture.magFilter;
            __touch(16906);
        }
        var minFilter = isImagePowerOfTwo ? texture.minFilter : this.getFilterFallback(texture.minFilter);
        __touch(16900);
        if (texrecord.minFilter !== minFilter) {
            context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MIN_FILTER, this.getGLMinFilter(minFilter));
            __touch(16907);
            texrecord.minFilter = minFilter;
            __touch(16908);
        }
        var wrapS = isImagePowerOfTwo ? texture.wrapS : 'EdgeClamp';
        __touch(16901);
        if (texrecord.wrapS !== wrapS) {
            var glwrapS = this.getGLWrap(wrapS, context);
            __touch(16909);
            context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_S, glwrapS);
            __touch(16910);
            texrecord.wrapS = wrapS;
            __touch(16911);
        }
        var wrapT = isImagePowerOfTwo ? texture.wrapT : 'EdgeClamp';
        __touch(16902);
        if (texrecord.wrapT !== wrapT) {
            var glwrapT = this.getGLWrap(wrapT, context);
            __touch(16912);
            context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_T, glwrapT);
            __touch(16913);
            texrecord.wrapT = wrapT;
            __touch(16914);
        }
        if (this.glExtensionTextureFilterAnisotropic && texture.type !== 'Float') {
            var anisotropy = texture.anisotropy;
            __touch(16915);
            if (texrecord.anisotropy !== anisotropy) {
                context.texParameterf(glType, this.glExtensionTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, this.capabilities.maxAnisotropy));
                __touch(16916);
                texrecord.anisotropy = anisotropy;
                __touch(16917);
            }
        }
    };
    __touch(16357);
    Renderer.prototype.bindTexture = function (context, texture, unit, record) {
        if (record.boundTexture === undefined || texture.glTexture !== undefined && record.boundTexture !== texture.glTexture) {
            context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
            __touch(16918);
            context.bindTexture(this.getGLType(texture.variant), texture.glTexture);
            __touch(16919);
            record.boundTexture = texture.glTexture;
            __touch(16920);
        }
    };
    __touch(16358);
    Renderer.prototype.unbindTexture = function (context, texture, unit, record) {
        context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
        __touch(16921);
        context.bindTexture(this.getGLType(texture.variant), null);
        __touch(16922);
        record.boundTexture = undefined;
        __touch(16923);
    };
    __touch(16359);
    Renderer.prototype.getGLType = function (type) {
        switch (type) {
        case '2D':
            return WebGLRenderingContext.TEXTURE_2D;
        case 'CUBE':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP;
        }
        __touch(16924);
        throw 'invalid texture type: ' + type;
        __touch(16925);
    };
    __touch(16360);
    Renderer.prototype.loadCompressedTexture = function (context, target, texture, imageData) {
        var mipSizes = texture.image.mipmapSizes;
        __touch(16926);
        var dataOffset = 0, dataLength = 0;
        __touch(16927);
        var width = texture.image.width, height = texture.image.height;
        __touch(16928);
        var ddsExt = DdsUtils.getDdsExtension(context);
        __touch(16929);
        var internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        __touch(16930);
        if (texture.format === 'PrecompressedDXT1') {
            internalFormat = ddsExt.COMPRESSED_RGB_S3TC_DXT1_EXT;
            __touch(16931);
        } else if (texture.format === 'PrecompressedDXT1A') {
            internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            __touch(16932);
        } else if (texture.format === 'PrecompressedDXT3') {
            internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            __touch(16933);
        } else if (texture.format === 'PrecompressedDXT5') {
            internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
            __touch(16934);
        } else {
            throw new Error('Unhandled compression format: ' + imageData.getDataFormat().name());
            __touch(16935);
        }
        if (typeof mipSizes === 'undefined' || mipSizes === null) {
            if (imageData instanceof Uint8Array) {
                context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, imageData);
                __touch(16936);
            } else {
                context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset, imageData.byteLength));
                __touch(16937);
            }
        } else {
            texture.generateMipmaps = false;
            __touch(16938);
            if (imageData instanceof Array) {
                for (var i = 0; i < imageData.length; i++) {
                    context.compressedTexImage2D(target, i, internalFormat, width, height, 0, imageData[i]);
                    __touch(16941);
                    width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
                    __touch(16942);
                    height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
                    __touch(16943);
                }
            } else {
                for (var i = 0; i < mipSizes.length; i++) {
                    dataLength = mipSizes[i];
                    __touch(16944);
                    context.compressedTexImage2D(target, i, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset + dataOffset, dataLength));
                    __touch(16945);
                    width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
                    __touch(16946);
                    height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
                    __touch(16947);
                    dataOffset += dataLength;
                    __touch(16948);
                }
            }
            var expectedMipmaps = 1 + Math.ceil(Math.log(Math.max(texture.image.height, texture.image.width)) / Math.log(2));
            __touch(16939);
            var size = mipSizes[mipSizes.length - 1];
            __touch(16940);
            if (mipSizes.length < expectedMipmaps) {
                for (var i = mipSizes.length; i < expectedMipmaps; i++) {
                    size = ~~((width + 3) / 4) * ~~((height + 3) / 4) * texture.image.bpp * 2;
                    __touch(16949);
                    context.compressedTexImage2D(target, i, internalFormat, width, height, 0, new Uint8Array(size));
                    __touch(16950);
                    width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
                    __touch(16951);
                    height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
                    __touch(16952);
                }
            }
        }
    };
    __touch(16361);
    Renderer.prototype.updateTexture = function (context, texture, unit, record) {
        context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
        __touch(16953);
        context.bindTexture(this.getGLType(texture.variant), texture.glTexture);
        __touch(16954);
        record.boundTexture = texture.glTexture;
        __touch(16955);
        context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, texture.unpackAlignment);
        __touch(16956);
        context.pixelStorei(WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        __touch(16957);
        context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        __touch(16958);
        var image = texture.image;
        __touch(16959);
        if (texture.variant === '2D') {
            if (!image) {
                context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
                __touch(16960);
            } else {
                if (!image.isCompressed && (texture.generateMipmaps || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
                    this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
                    __touch(16961);
                    image = texture.image;
                    __touch(16962);
                }
                if (image.isData === true) {
                    if (image.isCompressed) {
                        this.loadCompressedTexture(context, WebGLRenderingContext.TEXTURE_2D, texture, image.data);
                        __touch(16963);
                    } else {
                        context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), image.width, image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data);
                        __touch(16964);
                    }
                } else {
                    context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image);
                    __touch(16965);
                }
                if (texture.generateMipmaps && !image.isCompressed) {
                    context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
                    __touch(16966);
                }
            }
        } else if (texture.variant === 'CUBE') {
            if (image && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
                for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
                    if (image.data[i] && !image.data[i].buffer) {
                        Util.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
                        __touch(16970);
                    } else {
                        Util.getBlankImage(texture, [
                            0.3,
                            0.3,
                            0.3,
                            0
                        ], image.width, image.height, this.maxCubemapSize, i);
                        __touch(16971);
                    }
                }
                texture.image.width = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.width));
                __touch(16967);
                texture.image.height = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.height));
                __touch(16968);
                image = texture.image;
                __touch(16969);
            }
            for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
                var face = Texture.CUBE_FACES[faceIndex];
                __touch(16972);
                if (!image) {
                    context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
                    __touch(16973);
                } else {
                    if (image.isData === true) {
                        if (image.isCompressed) {
                            this.loadCompressedTexture(context, this.getGLCubeMapFace(face), texture, image.data[faceIndex]);
                            __touch(16974);
                        } else {
                            context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), image.width, image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data[faceIndex]);
                            __touch(16975);
                        }
                    } else {
                        context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), image.data[faceIndex]);
                        __touch(16976);
                    }
                }
            }
            if (image && texture.generateMipmaps && !image.isCompressed) {
                context.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP);
                __touch(16977);
            }
        }
    };
    __touch(16362);
    Renderer.prototype.checkRescale = function (texture, image, width, height, maxSize, index) {
        Util.scaleImage(texture, image, width, height, maxSize, index);
        __touch(16978);
    };
    __touch(16363);
    Renderer.prototype.getGLWrap = function (wrap) {
        switch (wrap) {
        case 'Repeat':
            return WebGLRenderingContext.REPEAT;
        case 'MirroredRepeat':
            return WebGLRenderingContext.MIRRORED_REPEAT;
        case 'EdgeClamp':
            return WebGLRenderingContext.CLAMP_TO_EDGE;
        }
        __touch(16979);
        throw 'invalid WrapMode type: ' + wrap;
        __touch(16980);
    };
    __touch(16364);
    Renderer.prototype.getGLInternalFormat = function (format) {
        switch (format) {
        case 'RGBA':
            return WebGLRenderingContext.RGBA;
        case 'RGB':
            return WebGLRenderingContext.RGB;
        case 'Alpha':
            return WebGLRenderingContext.ALPHA;
        case 'Luminance':
            return WebGLRenderingContext.LUMINANCE;
        case 'LuminanceAlpha':
            return WebGLRenderingContext.LUMINANCE_ALPHA;
        default:
            throw 'Unsupported format: ' + format;
        }
        __touch(16981);
    };
    __touch(16365);
    Renderer.prototype.getGLPixelDataType = function (type) {
        switch (type) {
        case 'UnsignedByte':
            return WebGLRenderingContext.UNSIGNED_BYTE;
        case 'UnsignedShort565':
            return WebGLRenderingContext.UNSIGNED_SHORT_5_6_5;
        case 'UnsignedShort4444':
            return WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4;
        case 'UnsignedShort5551':
            return WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1;
        case 'Float':
            return WebGLRenderingContext.FLOAT;
        default:
            throw 'Unsupported type: ' + type;
        }
        __touch(16982);
    };
    __touch(16366);
    Renderer.prototype.getFilterFallback = function (filter) {
        switch (filter) {
        case 'NearestNeighborNoMipMaps':
        case 'NearestNeighborNearestMipMap':
        case 'NearestNeighborLinearMipMap':
            return 'NearestNeighborNoMipMaps';
        case 'BilinearNoMipMaps':
        case 'Trilinear':
        case 'BilinearNearestMipMap':
            return 'BilinearNoMipMaps';
        default:
            return 'NearestNeighborNoMipMaps';
        }
        __touch(16983);
    };
    __touch(16367);
    Renderer.prototype.getGLMagFilter = function (filter) {
        switch (filter) {
        case 'Bilinear':
            return WebGLRenderingContext.LINEAR;
        case 'NearestNeighbor':
            return WebGLRenderingContext.NEAREST;
        }
        __touch(16984);
        throw 'invalid MagnificationFilter type: ' + filter;
        __touch(16985);
    };
    __touch(16368);
    Renderer.prototype.getGLMinFilter = function (filter) {
        switch (filter) {
        case 'BilinearNoMipMaps':
            return WebGLRenderingContext.LINEAR;
        case 'Trilinear':
            return WebGLRenderingContext.LINEAR_MIPMAP_LINEAR;
        case 'BilinearNearestMipMap':
            return WebGLRenderingContext.LINEAR_MIPMAP_NEAREST;
        case 'NearestNeighborNoMipMaps':
            return WebGLRenderingContext.NEAREST;
        case 'NearestNeighborNearestMipMap':
            return WebGLRenderingContext.NEAREST_MIPMAP_NEAREST;
        case 'NearestNeighborLinearMipMap':
            return WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
        }
        __touch(16986);
        throw 'invalid MinificationFilter type: ' + filter;
        __touch(16987);
    };
    __touch(16369);
    Renderer.prototype.getGLBufferTarget = function (target) {
        if (target === 'ElementArrayBuffer') {
            return WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
            __touch(16989);
        }
        return WebGLRenderingContext.ARRAY_BUFFER;
        __touch(16988);
    };
    __touch(16370);
    Renderer.prototype.getGLArrayType = function (indices) {
        if (indices instanceof Uint8Array) {
            return WebGLRenderingContext.UNSIGNED_BYTE;
            __touch(16991);
        } else if (indices instanceof Uint16Array) {
            return WebGLRenderingContext.UNSIGNED_SHORT;
            __touch(16992);
        } else if (indices instanceof Uint32Array) {
            return WebGLRenderingContext.UNSIGNED_INT;
            __touch(16993);
        } else if (indices instanceof Int8Array) {
            return WebGLRenderingContext.UNSIGNED_BYTE;
            __touch(16994);
        } else if (indices instanceof Int16Array) {
            return WebGLRenderingContext.UNSIGNED_SHORT;
            __touch(16995);
        } else if (indices instanceof Int32Array) {
            return WebGLRenderingContext.UNSIGNED_INT;
            __touch(16996);
        }
        return null;
        __touch(16990);
    };
    __touch(16371);
    Renderer.prototype.getGLByteSize = function (indices) {
        if (indices instanceof Uint8Array) {
            return 1;
            __touch(16998);
        } else if (indices instanceof Uint16Array) {
            return 2;
            __touch(16999);
        } else if (indices instanceof Uint32Array) {
            return 4;
            __touch(17000);
        } else if (indices instanceof Int8Array) {
            return 1;
            __touch(17001);
        } else if (indices instanceof Int16Array) {
            return 2;
            __touch(17002);
        } else if (indices instanceof Int32Array) {
            return 4;
            __touch(17003);
        }
        return 1;
        __touch(16997);
    };
    __touch(16372);
    Renderer.prototype.getGLCubeMapFace = function (face) {
        switch (face) {
        case 'PositiveX':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X;
        case 'NegativeX':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X;
        case 'PositiveY':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y;
        case 'NegativeY':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y;
        case 'PositiveZ':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z;
        case 'NegativeZ':
            return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z;
        }
        __touch(17004);
        throw 'Invalid cubemap face: ' + face;
        __touch(17005);
    };
    __touch(16373);
    Renderer.prototype.getGLBufferUsage = function (usage) {
        var glMode = WebGLRenderingContext.STATIC_DRAW;
        __touch(17006);
        switch (usage) {
        case 'StaticDraw':
            glMode = WebGLRenderingContext.STATIC_DRAW;
            break;
        case 'DynamicDraw':
            glMode = WebGLRenderingContext.DYNAMIC_DRAW;
            break;
        case 'StreamDraw':
            glMode = WebGLRenderingContext.STREAM_DRAW;
            break;
        }
        __touch(17007);
        return glMode;
        __touch(17008);
    };
    __touch(16374);
    Renderer.prototype.getGLIndexMode = function (indexMode) {
        var glMode = WebGLRenderingContext.TRIANGLES;
        __touch(17009);
        switch (indexMode) {
        case 'Triangles':
            glMode = WebGLRenderingContext.TRIANGLES;
            break;
        case 'TriangleStrip':
            glMode = WebGLRenderingContext.TRIANGLE_STRIP;
            break;
        case 'TriangleFan':
            glMode = WebGLRenderingContext.TRIANGLE_FAN;
            break;
        case 'Lines':
            glMode = WebGLRenderingContext.LINES;
            break;
        case 'LineStrip':
            glMode = WebGLRenderingContext.LINE_STRIP;
            break;
        case 'LineLoop':
            glMode = WebGLRenderingContext.LINE_LOOP;
            break;
        case 'Points':
            glMode = WebGLRenderingContext.POINTS;
            break;
        }
        __touch(17010);
        return glMode;
        __touch(17011);
    };
    __touch(16375);
    Renderer.prototype.updateBlending = function (material) {
        var blendRecord = this.rendererRecord.blendRecord;
        __touch(17012);
        var context = this.context;
        __touch(17013);
        var blending = material.blendState.blending;
        __touch(17014);
        if (blending !== blendRecord.blending) {
            if (blending === 'NoBlending') {
                context.disable(WebGLRenderingContext.BLEND);
                __touch(17016);
            } else if (blending === 'AdditiveBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17017);
                context.blendEquation(WebGLRenderingContext.FUNC_ADD);
                __touch(17018);
                context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE);
                __touch(17019);
            } else if (blending === 'SubtractiveBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17020);
                context.blendEquation(WebGLRenderingContext.FUNC_REVERSE_SUBTRACT);
                __touch(17021);
                context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE);
                __touch(17022);
            } else if (blending === 'MultiplyBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17023);
                context.blendEquation(WebGLRenderingContext.FUNC_ADD);
                __touch(17024);
                context.blendFunc(WebGLRenderingContext.DST_COLOR, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
                __touch(17025);
            } else if (blending === 'AlphaBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17026);
                context.blendEquation(WebGLRenderingContext.FUNC_ADD);
                __touch(17027);
                context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
                __touch(17028);
            } else if (blending === 'TransparencyBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17029);
                context.blendEquationSeparate(WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD);
                __touch(17030);
                context.blendFuncSeparate(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
                __touch(17031);
            } else if (blending === 'CustomBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17032);
            } else if (blending === 'SeparateBlending') {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17033);
                context.blendEquationSeparate(this.getGLBlendParam(material.blendState.blendEquationColor), this.getGLBlendParam(material.blendState.blendEquationAlpha));
                __touch(17034);
                context.blendFuncSeparate(this.getGLBlendParam(material.blendState.blendSrcColor), this.getGLBlendParam(material.blendState.blendDstColor), this.getGLBlendParam(material.blendState.blendSrcAlpha), this.getGLBlendParam(material.blendState.blendDstAlpha));
                __touch(17035);
            } else {
                context.enable(WebGLRenderingContext.BLEND);
                __touch(17036);
                context.blendEquationSeparate(WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD);
                __touch(17037);
                context.blendFuncSeparate(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
                __touch(17038);
            }
            blendRecord.blending = blending;
            __touch(17015);
        }
        if (blending === 'CustomBlending') {
            var blendEquation = material.blendState.blendEquation;
            __touch(17039);
            var blendSrc = material.blendState.blendSrc;
            __touch(17040);
            var blendDst = material.blendState.blendDst;
            __touch(17041);
            if (blendEquation !== blendRecord.blendEquation) {
                context.blendEquation(this.getGLBlendParam(blendEquation));
                __touch(17042);
                blendRecord.blendEquation = blendEquation;
                __touch(17043);
            }
            if (blendSrc !== blendRecord.blendSrc || blendDst !== blendRecord.blendDst) {
                context.blendFunc(this.getGLBlendParam(blendSrc), this.getGLBlendParam(blendDst));
                __touch(17044);
                blendRecord.blendSrc = blendSrc;
                __touch(17045);
                blendRecord.blendDst = blendDst;
                __touch(17046);
            }
        } else {
            blendRecord.blendEquation = null;
            __touch(17047);
            blendRecord.blendSrc = null;
            __touch(17048);
            blendRecord.blendDst = null;
            __touch(17049);
        }
    };
    __touch(16376);
    Renderer.prototype.updateOffset = function (material) {
        var offsetRecord = this.rendererRecord.offsetRecord;
        __touch(17050);
        var context = this.context;
        __touch(17051);
        var enabled = material.offsetState.enabled;
        __touch(17052);
        var factor = material.offsetState.factor;
        __touch(17053);
        var units = material.offsetState.units;
        __touch(17054);
        if (offsetRecord.enabled !== enabled) {
            if (enabled) {
                context.enable(WebGLRenderingContext.POLYGON_OFFSET_FILL);
                __touch(17056);
            } else {
                context.disable(WebGLRenderingContext.POLYGON_OFFSET_FILL);
                __touch(17057);
            }
            offsetRecord.enabled = enabled;
            __touch(17055);
        }
        if (enabled && (offsetRecord.factor !== factor || offsetRecord.units !== units)) {
            context.polygonOffset(factor, units);
            __touch(17058);
            offsetRecord.factor = factor;
            __touch(17059);
            offsetRecord.units = units;
            __touch(17060);
        }
    };
    __touch(16377);
    Renderer.prototype.setBoundBuffer = function (buffer, target) {
        var targetBuffer = this.rendererRecord.currentBuffer[target];
        __touch(17061);
        if (!targetBuffer.valid || targetBuffer.buffer !== buffer) {
            this.context.bindBuffer(this.getGLBufferTarget(target), buffer);
            __touch(17062);
            targetBuffer.buffer = buffer;
            __touch(17063);
            targetBuffer.valid = true;
            __touch(17064);
        }
    };
    __touch(16378);
    Renderer.prototype.bindVertexAttribute = function (attribIndex, attribute) {
        this.context.vertexAttribPointer(attribIndex, attribute.count, this.getGLDataType(attribute.type), attribute.normalized, attribute.stride, attribute.offset);
        __touch(17065);
    };
    __touch(16379);
    Renderer.prototype.getGLDataType = function (type) {
        switch (type) {
        case 'Float':
        case 'HalfFloat':
        case 'Double':
            return WebGLRenderingContext.FLOAT;
        case 'Byte':
            return WebGLRenderingContext.BYTE;
        case 'UnsignedByte':
            return WebGLRenderingContext.UNSIGNED_BYTE;
        case 'Short':
            return WebGLRenderingContext.SHORT;
        case 'UnsignedShort':
            return WebGLRenderingContext.UNSIGNED_SHORT;
        case 'Int':
            return WebGLRenderingContext.INT;
        case 'UnsignedInt':
            return WebGLRenderingContext.UNSIGNED_INT;
        default:
            throw 'Unknown datatype: ' + type;
        }
        __touch(17066);
    };
    __touch(16380);
    Renderer.prototype.getGLBlendParam = function (param) {
        switch (param) {
        case 'AddEquation':
            return WebGLRenderingContext.FUNC_ADD;
        case 'SubtractEquation':
            return WebGLRenderingContext.FUNC_SUBTRACT;
        case 'ReverseSubtractEquation':
            return WebGLRenderingContext.FUNC_REVERSE_SUBTRACT;
        case 'ZeroFactor':
            return WebGLRenderingContext.ZERO;
        case 'OneFactor':
            return WebGLRenderingContext.ONE;
        case 'SrcColorFactor':
            return WebGLRenderingContext.SRC_COLOR;
        case 'OneMinusSrcColorFactor':
            return WebGLRenderingContext.ONE_MINUS_SRC_COLOR;
        case 'SrcAlphaFactor':
            return WebGLRenderingContext.SRC_ALPHA;
        case 'OneMinusSrcAlphaFactor':
            return WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;
        case 'DstAlphaFactor':
            return WebGLRenderingContext.DST_ALPHA;
        case 'OneMinusDstAlphaFactor':
            return WebGLRenderingContext.ONE_MINUS_DST_ALPHA;
        case 'DstColorFactor':
            return WebGLRenderingContext.DST_COLOR;
        case 'OneMinusDstColorFactor':
            return WebGLRenderingContext.ONE_MINUS_DST_COLOR;
        case 'SrcAlphaSaturateFactor':
            return WebGLRenderingContext.SRC_ALPHA_SATURATE;
        default:
            throw 'Unknown blend param: ' + param;
        }
        __touch(17067);
    };
    __touch(16381);
    Renderer.prototype.clear = function (color, depth, stencil) {
        var bits = 0;
        __touch(17068);
        if (color === undefined || color) {
            bits |= WebGLRenderingContext.COLOR_BUFFER_BIT;
            __touch(17070);
        }
        if (depth === undefined || depth) {
            bits |= WebGLRenderingContext.DEPTH_BUFFER_BIT;
            __touch(17071);
        }
        if (stencil === undefined || stencil) {
            bits |= WebGLRenderingContext.STENCIL_BUFFER_BIT;
            __touch(17072);
        }
        var record = this.rendererRecord.depthRecord;
        __touch(17069);
        if (record.write !== true) {
            this.context.depthMask(true);
            __touch(17073);
            record.write = true;
            __touch(17074);
        }
        if (bits) {
            this.context.clear(bits);
            __touch(17075);
        }
    };
    __touch(16382);
    Renderer.prototype.flush = function () {
        this.context.flush();
        __touch(17076);
    };
    __touch(16383);
    Renderer.prototype.finish = function () {
        this.context.finish();
        __touch(17077);
    };
    __touch(16384);
    Renderer.prototype.setupFrameBuffer = function (framebuffer, renderTarget, textureTarget) {
        this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
        __touch(17078);
        this.context.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, textureTarget, renderTarget.glTexture, 0);
        __touch(17079);
    };
    __touch(16385);
    Renderer.prototype.setupRenderBuffer = function (renderbuffer, renderTarget) {
        this.context.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, renderbuffer);
        __touch(17080);
        if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
            this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height);
            __touch(17081);
            this.context.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, renderbuffer);
            __touch(17082);
        } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
            this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_STENCIL, renderTarget.width, renderTarget.height);
            __touch(17083);
            this.context.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, renderbuffer);
            __touch(17084);
        } else {
            this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.RGBA4, renderTarget.width, renderTarget.height);
            __touch(17085);
        }
    };
    __touch(16386);
    Renderer.prototype.setRenderTarget = function (renderTarget) {
        if (renderTarget && !renderTarget._glFrameBuffer) {
            if (renderTarget.depthBuffer === undefined) {
                renderTarget.depthBuffer = true;
                __touch(17103);
            }
            if (renderTarget.stencilBuffer === undefined) {
                renderTarget.stencilBuffer = true;
                __touch(17104);
            }
            renderTarget.glTexture = this.context.createTexture();
            __touch(17089);
            var isTargetPowerOfTwo = Util.isPowerOfTwo(renderTarget.width) && Util.isPowerOfTwo(renderTarget.height);
            __touch(17090);
            var glFormat = this.getGLInternalFormat(renderTarget.format);
            __touch(17091);
            var glType = this.getGLDataType(renderTarget.type);
            __touch(17092);
            renderTarget._glFrameBuffer = this.context.createFramebuffer();
            __touch(17093);
            renderTarget._glRenderBuffer = this.context.createRenderbuffer();
            __touch(17094);
            this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
            __touch(17095);
            this.updateTextureParameters(renderTarget, isTargetPowerOfTwo);
            __touch(17096);
            this.context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);
            __touch(17097);
            this.setupFrameBuffer(renderTarget._glFrameBuffer, renderTarget, WebGLRenderingContext.TEXTURE_2D);
            __touch(17098);
            this.setupRenderBuffer(renderTarget._glRenderBuffer, renderTarget);
            __touch(17099);
            if (renderTarget.generateMipmaps && isTargetPowerOfTwo) {
                this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
                __touch(17105);
            }
            this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
            __touch(17100);
            this.context.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
            __touch(17101);
            this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
            __touch(17102);
        }
        var framebuffer, width, height, vx, vy;
        __touch(17086);
        if (renderTarget) {
            framebuffer = renderTarget._glFrameBuffer;
            __touch(17106);
            vx = 0;
            __touch(17107);
            vy = 0;
            __touch(17108);
            width = renderTarget.width;
            __touch(17109);
            height = renderTarget.height;
            __touch(17110);
        } else {
            framebuffer = null;
            __touch(17111);
            vx = this.viewportX;
            __touch(17112);
            vy = this.viewportY;
            __touch(17113);
            width = this.viewportWidth;
            __touch(17114);
            height = this.viewportHeight;
            __touch(17115);
        }
        if (framebuffer !== this.rendererRecord.currentFrameBuffer) {
            this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
            __touch(17116);
            this.context.viewport(vx, vy, width, height);
            __touch(17117);
            this.rendererRecord.currentFrameBuffer = framebuffer;
            __touch(17118);
            this.rendererRecord.textureRecord = [];
            __touch(17119);
        }
        this.currentWidth = width;
        __touch(17087);
        this.currentHeight = height;
        __touch(17088);
    };
    __touch(16387);
    Renderer.prototype.updateRenderTargetMipmap = function (renderTarget) {
        this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
        __touch(17120);
        this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
        __touch(17121);
        this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
        __touch(17122);
    };
    __touch(16388);
    Renderer.prototype.getCapabilitiesString = function () {
        var caps = [];
        __touch(17123);
        var isArrayBufferView = function (value) {
            return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
            __touch(17127);
        };
        __touch(17124);
        for (var name in this.capabilities) {
            var cap = this.capabilities[name];
            __touch(17128);
            var str = '';
            __touch(17129);
            if (isArrayBufferView(cap)) {
                str += '[';
                __touch(17131);
                for (var i = 0; i < cap.length; i++) {
                    str += cap[i];
                    __touch(17133);
                    if (i < cap.length - 1) {
                        str += ',';
                        __touch(17134);
                    }
                }
                str += ']';
                __touch(17132);
            } else {
                str = cap;
                __touch(17135);
            }
            caps.push(name + ': ' + str);
            __touch(17130);
        }
        __touch(17125);
        return caps.join('\n');
        __touch(17126);
    };
    __touch(16389);
    Renderer.prototype._deallocateMeshData = function (meshData) {
        meshData.destroy(this.context);
        __touch(17136);
    };
    __touch(16390);
    Renderer.prototype._deallocateTexture = function (texture) {
        texture.destroy(this.context);
        __touch(17137);
    };
    __touch(16391);
    Renderer.prototype._deallocateRenderTarget = function (renderTarget) {
        renderTarget.destroy(this.context);
        __touch(17138);
    };
    __touch(16392);
    Renderer.prototype._deallocateShader = function (shader) {
        shader.destroy();
        __touch(17139);
    };
    __touch(16393);
    return Renderer;
    __touch(16394);
});
__touch(16313);