define([
    'goo/renderer/ShaderCall',
    'goo/math/Matrix4x4',
    'goo/entities/World',
    'goo/renderer/RenderQueue',
    'goo/renderer/Util',
    'goo/entities/SystemBus'
], function (ShaderCall, Matrix4x4, World, RenderQueue, Util, SystemBus) {
    'use strict';
    __touch(17168);
    var WebGLRenderingContext = window.WebGLRenderingContext;
    __touch(17169);
    function Shader(name, shaderDefinition) {
        if (!shaderDefinition.vshader || !shaderDefinition.fshader) {
            throw new Error('Missing shader sources for shader: ' + name);
            __touch(17261);
        }
        this.originalShaderDefinition = shaderDefinition;
        __touch(17231);
        this.shaderDefinition = shaderDefinition;
        __touch(17232);
        this.name = name;
        __touch(17233);
        this.origVertexSource = shaderDefinition.vshader;
        __touch(17234);
        this.origFragmentSource = shaderDefinition.fshader;
        __touch(17235);
        this.vertexSource = typeof this.origVertexSource === 'function' ? this.origVertexSource() : this.origVertexSource;
        __touch(17236);
        this.fragmentSource = typeof this.origFragmentSource === 'function' ? this.origFragmentSource() : this.origFragmentSource;
        __touch(17237);
        this.shaderProgram = null;
        __touch(17238);
        this.vertexShader = null;
        __touch(17239);
        this.fragmentShader = null;
        __touch(17240);
        this.renderer = null;
        __touch(17241);
        this.attributeMapping = {};
        __touch(17242);
        this.attributeIndexMapping = {};
        __touch(17243);
        this.uniformMapping = {};
        __touch(17244);
        this.uniformCallMapping = {};
        __touch(17245);
        this.textureSlots = [];
        __touch(17246);
        this.textureSlotsNaming = {};
        __touch(17247);
        this.currentCallbacks = {};
        __touch(17248);
        this.overridePrecision = shaderDefinition.precision || null;
        __touch(17249);
        this.processors = shaderDefinition.processors;
        __touch(17250);
        this.builder = shaderDefinition.builder;
        __touch(17251);
        this.defines = shaderDefinition.defines;
        __touch(17252);
        this.attributes = shaderDefinition.attributes || {};
        __touch(17253);
        this.uniforms = shaderDefinition.uniforms || {};
        __touch(17254);
        this.attributeKeys = null;
        __touch(17255);
        this.uniformKeys = null;
        __touch(17256);
        this.matchedUniforms = [];
        __touch(17257);
        this.renderQueue = RenderQueue.OPAQUE;
        __touch(17258);
        this._id = Shader.id++;
        __touch(17259);
        this.errorOnce = false;
        __touch(17260);
    }
    __touch(17170);
    Shader.id = 0;
    __touch(17171);
    Shader.prototype.clone = function () {
        return new Shader(this.name, Util.clone({
            precision: this.precision,
            processors: this.processors,
            builder: this.builder,
            defines: this.defines,
            attributes: this.attributes,
            uniforms: this.uniforms,
            vshader: this.origVertexSource,
            fshader: this.origFragmentSource
        }));
        __touch(17262);
    };
    __touch(17172);
    Shader.prototype.cloneOriginal = function () {
        return new Shader(this.name, this.originalShaderDefinition);
        __touch(17263);
    };
    __touch(17173);
    Shader.prototype.precompile = function (renderer) {
        if (this.shaderProgram === null) {
            this._investigateShaders();
            __touch(17264);
            this.addDefines(this.defines);
            __touch(17265);
            this.addPrecision(this.overridePrecision || renderer.shaderPrecision);
            __touch(17266);
            this.compile(renderer);
            __touch(17267);
        }
    };
    __touch(17174);
    var regExp = /\b(attribute|uniform)\s+(float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)\s+(\w+)(\s*\[\s*\w+\s*\])*;/g;
    __touch(17175);
    Shader.prototype.apply = function (shaderInfo, renderer) {
        var context = renderer.context;
        __touch(17268);
        var record = renderer.rendererRecord;
        __touch(17269);
        if (this.shaderProgram === null) {
            this._investigateShaders();
            __touch(17272);
            this.addDefines(this.defines);
            __touch(17273);
            this.addPrecision(this.overridePrecision || renderer.shaderPrecision);
            __touch(17274);
            this.compile(renderer);
            __touch(17275);
        }
        var switchedProgram = false;
        __touch(17270);
        if (record.usedProgram !== this.shaderProgram) {
            context.useProgram(this.shaderProgram);
            __touch(17276);
            record.usedProgram = this.shaderProgram;
            __touch(17277);
            switchedProgram = true;
            __touch(17278);
        }
        record.newlyEnabledAttributes.length = 0;
        __touch(17271);
        if (this.attributes) {
            var attributeMap = shaderInfo.meshData.attributeMap;
            __touch(17279);
            var attributes = this.attributes;
            __touch(17280);
            var keys = this.attributeKeys;
            __touch(17281);
            for (var i = 0, l = keys.length; i < l; i++) {
                var key = keys[i];
                __touch(17282);
                var attribute = attributeMap[attributes[key]];
                __touch(17283);
                if (!attribute) {
                    continue;
                    __touch(17287);
                }
                var attributeIndex = this.attributeIndexMapping[key];
                __touch(17284);
                if (attributeIndex === undefined) {
                    continue;
                    __touch(17288);
                }
                record.newlyEnabledAttributes[attributeIndex] = true;
                __touch(17285);
                renderer.bindVertexAttribute(attributeIndex, attribute);
                __touch(17286);
            }
        }
        for (var i = 0, l = record.enabledAttributes.length; i < l; i++) {
            var enabled = record.enabledAttributes[i];
            __touch(17289);
            var newEnabled = record.newlyEnabledAttributes[i];
            __touch(17290);
            if (!newEnabled && enabled) {
                renderer.context.disableVertexAttribArray(i);
                __touch(17291);
                record.enabledAttributes[i] = false;
                __touch(17292);
            }
        }
        for (var i = 0, l = record.newlyEnabledAttributes.length; i < l; i++) {
            var enabled = record.enabledAttributes[i];
            __touch(17293);
            var newEnabled = record.newlyEnabledAttributes[i];
            __touch(17294);
            if (newEnabled && !enabled) {
                renderer.context.enableVertexAttribArray(i);
                __touch(17295);
                record.enabledAttributes[i] = true;
                __touch(17296);
            }
        }
        if (this.matchedUniforms) {
            this.textureIndex = 0;
            __touch(17297);
            for (var i = 0, l = this.matchedUniforms.length; i < l; i++) {
                this._bindUniform(this.matchedUniforms[i], shaderInfo);
                __touch(17298);
            }
        }
    };
    __touch(17176);
    Shader.prototype._bindUniform = function (name, shaderInfo) {
        var mapping = this.uniformCallMapping[name];
        __touch(17299);
        if (mapping === undefined) {
            return;
            __touch(17302);
        }
        var defValue = shaderInfo.material.uniforms[name];
        __touch(17300);
        if (defValue === undefined) {
            defValue = this.uniforms[name];
            __touch(17303);
        }
        var type = typeof defValue;
        __touch(17301);
        if (type === 'string') {
            var callback = this.currentCallbacks[name];
            __touch(17304);
            if (callback) {
                callback(mapping, shaderInfo);
                __touch(17305);
            } else {
                var slot = this.textureSlotsNaming[name];
                __touch(17306);
                if (slot !== undefined) {
                    this._bindTextureUniforms(shaderInfo, mapping, slot);
                    __touch(17307);
                }
            }
        } else {
            var value = type === 'function' ? defValue(shaderInfo) : defValue;
            __touch(17308);
            mapping.call(value);
            __touch(17309);
        }
    };
    __touch(17177);
    Shader.prototype._bindTextureUniforms = function (shaderInfo, mapping, slot) {
        var maps = shaderInfo.material.getTexture(slot.mapping);
        __touch(17310);
        if (maps instanceof Array) {
            var arr = [];
            __touch(17311);
            slot.index = [];
            __touch(17312);
            for (var i = 0; i < maps.length; i++) {
                slot.index.push(this.textureIndex);
                __touch(17314);
                arr.push(this.textureIndex++);
                __touch(17315);
            }
            mapping.call(arr);
            __touch(17313);
        } else {
            slot.index = this.textureIndex;
            __touch(17316);
            mapping.call(this.textureIndex++);
            __touch(17317);
        }
    };
    __touch(17178);
    Shader.prototype.rebuild = function () {
        this.shaderProgram = null;
        __touch(17318);
        this.attributeMapping = {};
        __touch(17319);
        this.attributeIndexMapping = {};
        __touch(17320);
        this.uniformMapping = {};
        __touch(17321);
        this.uniformCallMapping = {};
        __touch(17322);
        this.currentCallbacks = {};
        __touch(17323);
        this.attributeKeys = null;
        __touch(17324);
        this.uniformKeys = null;
        __touch(17325);
        this.vertexSource = typeof this.origVertexSource === 'function' ? this.origVertexSource() : this.origVertexSource;
        __touch(17326);
        this.fragmentSource = typeof this.origFragmentSource === 'function' ? this.origFragmentSource() : this.origFragmentSource;
        __touch(17327);
    };
    __touch(17179);
    Shader.prototype._investigateShaders = function () {
        this.textureSlots = [];
        __touch(17328);
        this.textureSlotsNaming = {};
        __touch(17329);
        Shader.investigateShader(this.vertexSource, this);
        __touch(17330);
        Shader.investigateShader(this.fragmentSource, this);
        __touch(17331);
    };
    __touch(17180);
    Shader.investigateShader = function (source, target) {
        regExp.lastIndex = 0;
        __touch(17332);
        var matcher = regExp.exec(source);
        __touch(17333);
        while (matcher !== null) {
            var definition = { format: matcher[2] };
            __touch(17335);
            var type = matcher[1];
            __touch(17336);
            var variableName = matcher[3];
            __touch(17337);
            var arrayDeclaration = matcher[4];
            __touch(17338);
            if (arrayDeclaration) {
                if (definition.format === 'float') {
                    definition.format = 'floatarray';
                    __touch(17340);
                } else if (definition.format === 'int') {
                    definition.format = 'intarray';
                    __touch(17341);
                } else if (definition.format.indexOf('sampler') === 0) {
                    definition.format = 'samplerArray';
                    __touch(17342);
                }
            }
            if ('attribute' === type) {
                target.attributeMapping[variableName] = definition;
                __touch(17343);
            } else {
                if (definition.format.indexOf('sampler') === 0) {
                    var textureSlot = {
                        format: definition.format,
                        name: variableName,
                        mapping: target.uniforms[variableName],
                        index: target.textureSlots.length
                    };
                    __touch(17345);
                    target.textureSlots.push(textureSlot);
                    __touch(17346);
                    target.textureSlotsNaming[textureSlot.name] = textureSlot;
                    __touch(17347);
                }
                target.uniformMapping[variableName] = definition;
                __touch(17344);
            }
            matcher = regExp.exec(source);
            __touch(17339);
        }
        __touch(17334);
    };
    __touch(17181);
    Shader.prototype.compile = function (renderer) {
        var context = renderer.context;
        __touch(17348);
        this.renderer = renderer;
        __touch(17349);
        this.vertexShader = this._getShader(context, WebGLRenderingContext.VERTEX_SHADER, this.vertexSource);
        __touch(17350);
        this.fragmentShader = this._getShader(context, WebGLRenderingContext.FRAGMENT_SHADER, this.fragmentSource);
        __touch(17351);
        if (this.vertexShader === null || this.fragmentShader === null) {
            console.error('Shader error - no shaders');
            __touch(17359);
        }
        this.shaderProgram = context.createProgram();
        __touch(17352);
        var error = context.getError();
        __touch(17353);
        if (this.shaderProgram === null || error !== WebGLRenderingContext.NO_ERROR) {
            console.error('Shader error: ' + error + ' [shader: ' + this.name + ']');
            __touch(17360);
            SystemBus.emit('goo.shader.error');
            __touch(17361);
        }
        context.attachShader(this.shaderProgram, this.vertexShader);
        __touch(17354);
        context.attachShader(this.shaderProgram, this.fragmentShader);
        __touch(17355);
        context.linkProgram(this.shaderProgram);
        __touch(17356);
        if (!context.getProgramParameter(this.shaderProgram, WebGLRenderingContext.LINK_STATUS)) {
            var errInfo = context.getProgramInfoLog(this.shaderProgram);
            __touch(17362);
            console.error('Could not initialise shaders: ' + errInfo);
            __touch(17363);
            SystemBus.emit('goo.shader.error', errInfo);
            __touch(17364);
        }
        for (var key in this.attributeMapping) {
            var attributeIndex = context.getAttribLocation(this.shaderProgram, key);
            __touch(17365);
            if (attributeIndex === -1) {
                continue;
                __touch(17367);
            }
            this.attributeIndexMapping[key] = attributeIndex;
            __touch(17366);
        }
        __touch(17357);
        for (var key in this.uniformMapping) {
            var uniform = context.getUniformLocation(this.shaderProgram, key);
            __touch(17368);
            if (uniform === null) {
                var l = this.textureSlots.length;
                __touch(17370);
                for (var i = 0; i < l; i++) {
                    var slot = this.textureSlots[i];
                    __touch(17372);
                    if (slot.name === key) {
                        this.textureSlots.splice(i, 1);
                        __touch(17373);
                        delete this.textureSlotsNaming[slot.name];
                        __touch(17374);
                        for (; i < l - 1; i++) {
                            this.textureSlots[i].index--;
                            __touch(17376);
                        }
                        break;
                        __touch(17375);
                    }
                }
                continue;
                __touch(17371);
            }
            this.uniformCallMapping[key] = new ShaderCall(context, uniform, this.uniformMapping[key].format);
            __touch(17369);
        }
        __touch(17358);
        if (this.attributes) {
            this.attributeKeys = Object.keys(this.attributes);
            __touch(17377);
        }
        if (this.uniforms) {
            if (this.uniforms.$link) {
                var links = this.uniforms.$link instanceof Array ? this.uniforms.$link : [this.uniforms.$link];
                __touch(17381);
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    __touch(17383);
                    for (var key in link) {
                        this.uniforms[key] = link[key];
                        __touch(17385);
                    }
                    __touch(17384);
                }
                delete this.uniforms.$link;
                __touch(17382);
            }
            this.matchedUniforms = [];
            __touch(17378);
            for (var name in this.uniforms) {
                var mapping = this.uniformCallMapping[name];
                __touch(17386);
                if (mapping !== undefined) {
                    this.matchedUniforms.push(name);
                    __touch(17388);
                }
                var value = this.uniforms[name];
                __touch(17387);
                if (this.defaultCallbacks[value]) {
                    this.currentCallbacks[name] = this.defaultCallbacks[value];
                    __touch(17389);
                }
            }
            __touch(17379);
            this.uniformKeys = Object.keys(this.uniforms);
            __touch(17380);
        }
    };
    __touch(17182);
    var errorRegExp = /\b\d+:(\d+):\s(.+)\b/g;
    __touch(17183);
    var errorRegExpIE = /\((\d+),\s*\d+\):\s(.+)/g;
    __touch(17184);
    Shader.prototype._getShader = function (context, type, source) {
        var shader = context.createShader(type);
        __touch(17390);
        context.shaderSource(shader, source);
        __touch(17391);
        context.compileShader(shader);
        __touch(17392);
        if (!context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
            var infoLog = context.getShaderInfoLog(shader);
            __touch(17394);
            var shaderType = type === WebGLRenderingContext.VERTEX_SHADER ? 'VertexShader' : 'FragmentShader';
            __touch(17395);
            errorRegExp.lastIndex = 0;
            __touch(17396);
            var errorMatcher = errorRegExp.exec(infoLog);
            __touch(17397);
            if (errorMatcher === null) {
                errorMatcher = errorRegExpIE.exec(infoLog);
                __touch(17399);
            }
            if (errorMatcher !== null) {
                while (errorMatcher !== null) {
                    var splitSource = source.split('\n');
                    __touch(17401);
                    var lineNum = errorMatcher[1];
                    __touch(17402);
                    var errorStr = errorMatcher[2];
                    __touch(17403);
                    console.error('Error in ' + shaderType + ' - [' + this.name + '][' + this._id + '] at line ' + lineNum + ':');
                    __touch(17404);
                    console.error('\tError: ' + errorStr);
                    __touch(17405);
                    console.error('\tSource: ' + splitSource[lineNum - 1]);
                    __touch(17406);
                    errorMatcher = errorRegExp.exec(infoLog);
                    __touch(17407);
                }
                __touch(17400);
            } else {
                console.error('Error in ' + shaderType + ' - [' + this.name + '][' + this._id + '] ' + infoLog);
                __touch(17408);
            }
            return null;
            __touch(17398);
        }
        return shader;
        __touch(17393);
    };
    __touch(17185);
    var precisionRegExp = /\bprecision\s+(lowp|mediump|highp)\s+(float|int);/g;
    __touch(17186);
    Shader.prototype.addPrecision = function (precision) {
        precisionRegExp.lastIndex = 0;
        __touch(17409);
        var vertMatcher = precisionRegExp.exec(this.vertexSource);
        __touch(17410);
        if (vertMatcher === null) {
            this.vertexSource = 'precision ' + precision + ' float;' + '\n' + this.vertexSource;
            __touch(17413);
        }
        precisionRegExp.lastIndex = 0;
        __touch(17411);
        var fragMatcher = precisionRegExp.exec(this.fragmentSource);
        __touch(17412);
        if (fragMatcher === null) {
            this.fragmentSource = 'precision ' + precision + ' float;' + '\n' + this.fragmentSource;
            __touch(17414);
        }
    };
    __touch(17187);
    Shader.prototype.addDefines = function (defines) {
        if (!defines) {
            return;
            __touch(17418);
        }
        var defineStr = this.generateDefines(defines);
        __touch(17415);
        this.vertexSource = defineStr + '\n' + this.vertexSource;
        __touch(17416);
        this.fragmentSource = defineStr + '\n' + this.fragmentSource;
        __touch(17417);
    };
    __touch(17188);
    Shader.prototype.generateDefines = function (defines) {
        var chunks = [];
        __touch(17419);
        for (var d in defines) {
            var value = defines[d];
            __touch(17422);
            if (value === false) {
                continue;
                __touch(17425);
            }
            var chunk = '#define ' + d + ' ' + value;
            __touch(17423);
            chunks.push(chunk);
            __touch(17424);
        }
        __touch(17420);
        return chunks.join('\n');
        __touch(17421);
    };
    __touch(17189);
    function setupDefaultCallbacks(defaultCallbacks) {
        defaultCallbacks[Shader.PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.camera.getProjectionMatrix();
            __touch(17448);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17449);
        };
        __touch(17426);
        defaultCallbacks[Shader.VIEW_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.camera.getViewMatrix();
            __touch(17450);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17451);
        };
        __touch(17427);
        defaultCallbacks[Shader.WORLD_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.matrix : Matrix4x4.IDENTITY;
            __touch(17452);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17453);
        };
        __touch(17428);
        defaultCallbacks[Shader.NORMAL_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.normalMatrix : Matrix4x4.IDENTITY;
            __touch(17454);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17455);
        };
        __touch(17429);
        defaultCallbacks[Shader.VIEW_INVERSE_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.camera.getViewInverseMatrix();
            __touch(17456);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17457);
        };
        __touch(17430);
        defaultCallbacks[Shader.VIEW_PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.camera.getViewProjectionMatrix();
            __touch(17458);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17459);
        };
        __touch(17431);
        defaultCallbacks[Shader.VIEW_PROJECTION_INVERSE_MATRIX] = function (uniformCall, shaderInfo) {
            var matrix = shaderInfo.camera.getViewProjectionInverseMatrix();
            __touch(17460);
            uniformCall.uniformMatrix4fv(matrix);
            __touch(17461);
        };
        __touch(17432);
        for (var i = 0; i < 16; i++) {
            defaultCallbacks[Shader['TEXTURE' + i]] = function (i) {
                return function (uniformCall) {
                    uniformCall.uniform1i(i);
                    __touch(17464);
                };
                __touch(17463);
            }(i);
            __touch(17462);
        }
        for (var i = 0; i < 8; i++) {
            defaultCallbacks[Shader['LIGHT' + i]] = function (i) {
                return function (uniformCall, shaderInfo) {
                    var light = shaderInfo.lights[i];
                    __touch(17467);
                    if (light !== undefined) {
                        uniformCall.uniform3f(light.translation.data[0], light.translation.data[1], light.translation.data[2]);
                        __touch(17468);
                    } else {
                        uniformCall.uniform3f(-20, 20, 20);
                        __touch(17469);
                    }
                };
                __touch(17466);
            }(i);
            __touch(17465);
        }
        defaultCallbacks[Shader.LIGHTCOUNT] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1i(shaderInfo.lights.length);
            __touch(17470);
        };
        __touch(17433);
        defaultCallbacks[Shader.CAMERA] = function (uniformCall, shaderInfo) {
            var cameraPosition = shaderInfo.camera.translation;
            __touch(17471);
            uniformCall.uniform3f(cameraPosition.data[0], cameraPosition.data[1], cameraPosition.data[2]);
            __touch(17472);
        };
        __touch(17434);
        defaultCallbacks[Shader.NEAR_PLANE] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1f(shaderInfo.camera.near);
            __touch(17473);
        };
        __touch(17435);
        defaultCallbacks[Shader.FAR_PLANE] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1f(shaderInfo.camera.far);
            __touch(17474);
        };
        __touch(17436);
        defaultCallbacks[Shader.MAIN_NEAR_PLANE] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1f(shaderInfo.mainCamera.near);
            __touch(17475);
        };
        __touch(17437);
        defaultCallbacks[Shader.MAIN_FAR_PLANE] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1f(shaderInfo.mainCamera.far);
            __touch(17476);
        };
        __touch(17438);
        defaultCallbacks[Shader.MAIN_DEPTH_SCALE] = function (uniformCall, shaderInfo) {
            uniformCall.uniform1f(1 / (shaderInfo.mainCamera.far - shaderInfo.mainCamera.near));
            __touch(17477);
        };
        __touch(17439);
        defaultCallbacks[Shader.AMBIENT] = function (uniformCall, shaderInfo) {
            var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.ambient : Shader.DEFAULT_AMBIENT;
            __touch(17478);
            uniformCall.uniform4fv(materialState);
            __touch(17479);
        };
        __touch(17440);
        defaultCallbacks[Shader.EMISSIVE] = function (uniformCall, shaderInfo) {
            var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.emissive : Shader.DEFAULT_EMISSIVE;
            __touch(17480);
            uniformCall.uniform4fv(materialState);
            __touch(17481);
        };
        __touch(17441);
        defaultCallbacks[Shader.DIFFUSE] = function (uniformCall, shaderInfo) {
            var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.diffuse : Shader.DEFAULT_DIFFUSE;
            __touch(17482);
            uniformCall.uniform4fv(materialState);
            __touch(17483);
        };
        __touch(17442);
        defaultCallbacks[Shader.SPECULAR] = function (uniformCall, shaderInfo) {
            var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.specular : Shader.DEFAULT_SPECULAR;
            __touch(17484);
            uniformCall.uniform4fv(materialState);
            __touch(17485);
        };
        __touch(17443);
        defaultCallbacks[Shader.SPECULAR_POWER] = function (uniformCall, shaderInfo) {
            var shininess = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.shininess : Shader.DEFAULT_SHININESS;
            __touch(17486);
            shininess = Math.max(shininess, 1);
            __touch(17487);
            uniformCall.uniform1f(shininess);
            __touch(17488);
        };
        __touch(17444);
        defaultCallbacks[Shader.TIME] = function (uniformCall) {
            uniformCall.uniform1f(World.time);
            __touch(17489);
        };
        __touch(17445);
        defaultCallbacks[Shader.TPF] = function (uniformCall) {
            uniformCall.uniform1f(World.tpf);
            __touch(17490);
        };
        __touch(17446);
        defaultCallbacks[Shader.RESOLUTION] = function (uniformCall, shaderInfo) {
            uniformCall.uniform2f(shaderInfo.renderer.viewportWidth, shaderInfo.renderer.viewportHeight);
            __touch(17491);
        };
        __touch(17447);
    }
    __touch(17190);
    Shader.prototype.getShaderDefinition = function () {
        return {
            vshader: this.vertexSource,
            fshader: this.fragmentSource,
            defines: this.defines,
            attributes: this.attributes,
            uniforms: this.uniforms
        };
        __touch(17492);
    };
    __touch(17191);
    Shader.prototype.destroy = function () {
        if (this.shaderProgram) {
            this.renderer.context.deleteProgram(this.shaderProgram);
            __touch(17494);
            this.shaderProgram = null;
            __touch(17495);
        }
        if (this.vertexShader) {
            this.renderer.context.deleteShader(this.vertexShader);
            __touch(17496);
            this.vertexShader = null;
            __touch(17497);
        }
        if (this.fragmentShader) {
            this.renderer.context.deleteShader(this.fragmentShader);
            __touch(17498);
            this.fragmentShader = null;
            __touch(17499);
        }
        this.renderer = null;
        __touch(17493);
    };
    __touch(17192);
    Shader.prototype.toString = function () {
        return this.name;
        __touch(17500);
    };
    __touch(17193);
    Shader.PROJECTION_MATRIX = 'PROJECTION_MATRIX';
    __touch(17194);
    Shader.VIEW_MATRIX = 'VIEW_MATRIX';
    __touch(17195);
    Shader.VIEW_INVERSE_MATRIX = 'VIEW_INVERSE_MATRIX';
    __touch(17196);
    Shader.VIEW_PROJECTION_MATRIX = 'VIEW_PROJECTION_MATRIX';
    __touch(17197);
    Shader.VIEW_PROJECTION_INVERSE_MATRIX = 'VIEW_PROJECTION_INVERSE_MATRIX';
    __touch(17198);
    Shader.WORLD_MATRIX = 'WORLD_MATRIX';
    __touch(17199);
    Shader.NORMAL_MATRIX = 'NORMAL_MATRIX';
    __touch(17200);
    for (var i = 0; i < 8; i++) {
        Shader['LIGHT' + i] = 'LIGHT' + i;
        __touch(17501);
    }
    Shader.CAMERA = 'CAMERA';
    __touch(17201);
    Shader.AMBIENT = 'AMBIENT';
    __touch(17202);
    Shader.EMISSIVE = 'EMISSIVE';
    __touch(17203);
    Shader.DIFFUSE = 'DIFFUSE';
    __touch(17204);
    Shader.SPECULAR = 'SPECULAR';
    __touch(17205);
    Shader.SPECULAR_POWER = 'SPECULAR_POWER';
    __touch(17206);
    Shader.NEAR_PLANE = 'NEAR_PLANE';
    __touch(17207);
    Shader.FAR_PLANE = 'FAR_PLANE';
    __touch(17208);
    Shader.MAIN_NEAR_PLANE = 'NEAR_PLANE';
    __touch(17209);
    Shader.MAIN_FAR_PLANE = 'FAR_PLANE';
    __touch(17210);
    Shader.MAIN_DEPTH_SCALE = 'DEPTH_SCALE';
    __touch(17211);
    Shader.TIME = 'TIME';
    __touch(17212);
    Shader.TPF = 'TPF';
    __touch(17213);
    Shader.RESOLUTION = 'RESOLUTION';
    __touch(17214);
    Shader.DIFFUSE_MAP = 'DIFFUSE_MAP';
    __touch(17215);
    Shader.NORMAL_MAP = 'NORMAL_MAP';
    __touch(17216);
    Shader.SPECULAR_MAP = 'SPECULAR_MAP';
    __touch(17217);
    Shader.LIGHT_MAP = 'LIGHT_MAP';
    __touch(17218);
    Shader.SHADOW_MAP = 'SHADOW_MAP';
    __touch(17219);
    Shader.AO_MAP = 'AO_MAP';
    __touch(17220);
    Shader.EMISSIVE_MAP = 'EMISSIVE_MAP';
    __touch(17221);
    Shader.DEPTH_MAP = 'DEPTH_MAP';
    __touch(17222);
    Shader.DEFAULT_AMBIENT = [
        0.1,
        0.1,
        0.1,
        1
    ];
    __touch(17223);
    Shader.DEFAULT_EMISSIVE = [
        0,
        0,
        0,
        0
    ];
    __touch(17224);
    Shader.DEFAULT_DIFFUSE = [
        0.8,
        0.8,
        0.8,
        1
    ];
    __touch(17225);
    Shader.DEFAULT_SPECULAR = [
        0.6,
        0.6,
        0.6,
        1
    ];
    __touch(17226);
    Shader.DEFAULT_SHININESS = 64;
    __touch(17227);
    Shader.prototype.defaultCallbacks = {};
    __touch(17228);
    setupDefaultCallbacks(Shader.prototype.defaultCallbacks);
    __touch(17229);
    return Shader;
    __touch(17230);
});
__touch(17167);