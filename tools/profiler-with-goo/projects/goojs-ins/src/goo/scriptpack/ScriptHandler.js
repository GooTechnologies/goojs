define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/util/rsvp',
    'goo/scripts/OrbitCamControlScript',
    'goo/scriptpack/OrbitNPanControlScript',
    'goo/scriptpack/FlyControlScript',
    'goo/scriptpack/WASDControlScript',
    'goo/scriptpack/BasicControlScript',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil',
    'goo/entities/SystemBus',
    'goo/scripts/ScriptUtils',
    'goo/scripts/Scripts'
], function (ConfigHandler, RSVP, OrbitCamControlScript, OrbitNPanControlScript, FlyControlScript, WASDControlScript, BasicControlScript, PromiseUtil, _, SystemBus, ScriptUtils, Scripts) {
    'use strict';
    __touch(19901);
    var DEPENDENCY_LOAD_TIMEOUT = 6000;
    __touch(19902);
    function ScriptHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(19921);
        this._bodyCache = {};
        __touch(19922);
        this._dependencyPromises = {};
        __touch(19923);
        this._currentScriptLoading = null;
        __touch(19924);
        this._addGlobalErrorListener();
        __touch(19925);
    }
    __touch(19903);
    ScriptHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(19904);
    ScriptHandler.prototype.constructor = ScriptHandler;
    __touch(19905);
    ConfigHandler._registerClass('script', ScriptHandler);
    __touch(19906);
    ScriptHandler.prototype._create = function () {
        return {
            externals: {},
            setup: null,
            update: null,
            run: null,
            cleanup: null,
            parameters: {},
            name: null
        };
        __touch(19926);
    };
    __touch(19907);
    ScriptHandler.prototype._remove = function (ref) {
        var script = this._objects[ref];
        __touch(19927);
        if (script && script.cleanup && script.context) {
            try {
                script.cleanup(script.parameters, script.context, Scripts.getClasses());
                __touch(19931);
            } catch (e) {
            }
            __touch(19930);
        }
        delete this._objects[ref];
        __touch(19928);
        delete this._bodyCache[ref];
        __touch(19929);
    };
    __touch(19908);
    ScriptHandler.prototype._updateFromCustom = function (script, config) {
        if (this._bodyCache[config.id] === config.body) {
            return script;
            __touch(19945);
        }
        delete script.errors;
        __touch(19932);
        this._bodyCache[config.id] = config.body;
        __touch(19933);
        var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + config.id);
        __touch(19934);
        if (oldScriptElement) {
            oldScriptElement.parentNode.removeChild(oldScriptElement);
            __touch(19946);
        }
        if (!window._gooScriptFactories) {
            window._gooScriptFactories = {};
            __touch(19947);
        }
        var scriptFactoryStr = [
            'window._gooScriptFactories[\'' + config.id + '\'] = function () { \'use strict\';',
            config.body,
            ' var obj = {',
            '  externals: {}',
            ' };',
            ' if (typeof parameters !== "undefined") {',
            '  obj.externals.parameters = parameters;',
            ' }',
            ' if (typeof setup !== "undefined") {',
            '  obj.setup = setup;',
            ' }',
            ' if (typeof cleanup !== "undefined") {',
            '  obj.cleanup = cleanup;',
            ' }',
            ' if (typeof update !== "undefined") {',
            '  obj.update = update;',
            ' }',
            ' return obj;',
            '};'
        ].join('\n');
        __touch(19935);
        var newScriptElement = document.createElement('script');
        __touch(19936);
        newScriptElement.id = ScriptHandler.DOM_ID_PREFIX + config.id;
        __touch(19937);
        newScriptElement.innerHTML = scriptFactoryStr;
        __touch(19938);
        newScriptElement.async = false;
        __touch(19939);
        this._currentScriptLoading = config.id;
        __touch(19940);
        var parentElement = this.world.gooRunner.renderer.domElement.parentElement || document.body;
        __touch(19941);
        parentElement.appendChild(newScriptElement);
        __touch(19942);
        var newScript = window._gooScriptFactories[config.id];
        __touch(19943);
        if (newScript) {
            try {
                newScript = newScript();
                __touch(19950);
                script.id = config.id;
                __touch(19951);
                safeUp(newScript, script);
                __touch(19952);
                script.setup = newScript.setup;
                __touch(19953);
                script.update = newScript.update;
                __touch(19954);
                script.cleanup = newScript.cleanup;
                __touch(19955);
                script.parameters = {};
                __touch(19956);
                script.enabled = false;
                __touch(19957);
            } catch (e) {
                var err = { message: e.toString() };
                __touch(19958);
                var m = e.stack.split('\n')[1].match(/(\d+):\d+\)$/);
                __touch(19959);
                if (m) {
                    err.line = parseInt(m[1], 10) - 1;
                    __touch(19961);
                }
                setError(script, err);
                __touch(19960);
            }
            __touch(19948);
            this._currentScriptLoading = null;
            __touch(19949);
        }
        if (script.externals) {
            ScriptUtils.fillDefaultNames(script.externals.parameters);
            __touch(19962);
        }
        return script;
        __touch(19944);
    };
    __touch(19909);
    ScriptHandler.prototype._updateFromClass = function (script, config) {
        if (!script.externals || script.externals.name !== config.className) {
            var newScript = Scripts.create(config.className);
            __touch(19964);
            if (!newScript) {
                throw new Error('Unrecognized script name');
                __touch(19974);
            }
            script.id = config.id;
            __touch(19965);
            script.externals = newScript.externals;
            __touch(19966);
            script.setup = newScript.setup;
            __touch(19967);
            script.update = newScript.update;
            __touch(19968);
            script.run = newScript.run;
            __touch(19969);
            script.cleanup = newScript.cleanup;
            __touch(19970);
            script.parameters = newScript.parameters || {};
            __touch(19971);
            script.enabled = false;
            __touch(19972);
            ScriptUtils.fillDefaultNames(script.externals.parameters);
            __touch(19973);
        }
        return script;
        __touch(19963);
    };
    __touch(19910);
    ScriptHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(19975);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (script) {
            if (!script) {
                return;
                __touch(19979);
            }
            var promises = [];
            __touch(19977);
            if (config.body && config.dependencies) {
                delete script.dependencyErrors;
                __touch(19980);
                _.forEach(config.dependencies, function (dependencyConfig) {
                    promises.push(that._addDependency(script, dependencyConfig.url, config.id));
                    __touch(19982);
                }, null, 'sortValue');
                __touch(19981);
            }
            return RSVP.all(promises).then(function () {
                if (config.className) {
                    that._updateFromClass(script, config, options);
                    __touch(19986);
                } else if (config.body) {
                    that._updateFromCustom(script, config, options);
                    __touch(19987);
                }
                if (config.body) {
                    SystemBus.emit('goo.scriptExternals', {
                        id: config.id,
                        externals: script.externals
                    });
                    __touch(19988);
                }
                script.name = config.name;
                __touch(19983);
                if (script.errors || script.dependencyErrors) {
                    SystemBus.emit('goo.scriptError', {
                        id: ref,
                        errors: script.errors,
                        dependencyErrors: script.dependencyErrors
                    });
                    __touch(19989);
                    return script;
                    __touch(19990);
                } else {
                    SystemBus.emit('goo.scriptError', {
                        id: ref,
                        errors: null
                    });
                    __touch(19991);
                }
                _.extend(script.parameters, config.options);
                __touch(19984);
                return script;
                __touch(19985);
            });
            __touch(19978);
        });
        __touch(19976);
    };
    __touch(19911);
    ScriptHandler.prototype._addDependency = function (script, url, scriptId) {
        var that = this;
        __touch(19992);
        var scriptElem = document.querySelector('script[src="' + url + '"]');
        __touch(19993);
        if (scriptElem) {
            return this._dependencyPromises[url] || PromiseUtil.resolve();
            __touch(20000);
        }
        scriptElem = document.createElement('script');
        __touch(19994);
        scriptElem.src = url;
        __touch(19995);
        scriptElem.setAttribute('data-script-id', scriptId);
        __touch(19996);
        var parentElement = this.world.gooRunner.renderer.domElement.parentElement || document.body;
        __touch(19997);
        parentElement.appendChild(scriptElem);
        __touch(19998);
        return this._dependencyPromises[url] = PromiseUtil.createPromise(function (resolve, reject) {
            var handled = false;
            __touch(20001);
            scriptElem.onload = function () {
                resolve();
                __touch(20005);
                delete that._dependencyPromises[url];
                __touch(20006);
            };
            __touch(20002);
            function fireError(message) {
                var err = {
                    message: message,
                    file: url
                };
                __touch(20007);
                setError(script, err);
                __touch(20008);
                if (scriptElem.parentNode) {
                    scriptElem.parentNode.removeChild(scriptElem);
                    __touch(20011);
                }
                resolve();
                __touch(20009);
                delete that._dependencyPromises[url];
                __touch(20010);
            }
            __touch(20003);
            scriptElem.onerror = function (e) {
                handled = true;
                __touch(20012);
                if (timeoutHandler) {
                    clearTimeout(timeoutHandler);
                    __touch(20015);
                }
                console.error(e);
                __touch(20013);
                fireError('Could not load dependency');
                __touch(20014);
            };
            __touch(20004);
            if (!handled) {
                handled = true;
                __touch(20016);
                var timeoutHandler = setTimeout(function () {
                    fireError('Loading dependency failed (time out).');
                    __touch(20018);
                }, DEPENDENCY_LOAD_TIMEOUT);
                __touch(20017);
            }
        });
        __touch(19999);
    };
    __touch(19912);
    ScriptHandler.prototype._addGlobalErrorListener = function () {
        var that = this;
        __touch(20019);
        window.addEventListener('error', function (evt) {
            if (evt.filename) {
                var scriptElem = document.querySelector('script[src="' + evt.filename + '"]');
                __touch(20021);
                if (scriptElem) {
                    var scriptId = scriptElem.getAttribute('data-script-id');
                    __touch(20022);
                    var script = that._objects[scriptId];
                    __touch(20023);
                    if (script) {
                        var error = {
                            message: evt.message,
                            line: evt.lineno,
                            file: evt.filename
                        };
                        __touch(20025);
                        setError(script, error);
                        __touch(20026);
                    }
                    scriptElem.parentNode.removeChild(scriptElem);
                    __touch(20024);
                }
            }
            if (that._currentScriptLoading) {
                var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + that._currentScriptLoading);
                __touch(20027);
                if (oldScriptElement) {
                    oldScriptElement.parentNode.removeChild(oldScriptElement);
                    __touch(20033);
                }
                delete window._gooScriptFactories[that._currentScriptLoading];
                __touch(20028);
                var script = that._objects[that._currentScriptLoading];
                __touch(20029);
                var error = {
                    message: evt.message,
                    line: evt.lineno - 1
                };
                __touch(20030);
                setError(script, error);
                __touch(20031);
                that._currentScriptLoading = null;
                __touch(20032);
            }
        });
        __touch(20020);
    };
    __touch(19913);
    var types = [
        'string',
        'int',
        'float',
        'vec2',
        'vec3',
        'vec4',
        'boolean',
        'texture',
        'image',
        'sound',
        'camera',
        'entity',
        'animation'
    ];
    __touch(19914);
    var typesControls = {
        'string': ['key'],
        'int': [
            'spinner',
            'slider',
            'jointSelector'
        ],
        'float': [
            'spinner',
            'slider'
        ],
        'vec2': [],
        'vec3': ['color'],
        'vec4': ['color'],
        'boolean': ['checkbox'],
        'texture': [],
        'image': [],
        'sound': [],
        'camera': [],
        'entity': [],
        'animation': []
    };
    __touch(19915);
    for (var type in typesControls) {
        Array.prototype.push.apply(typesControls[type], [
            'dropdown',
            'select'
        ]);
        __touch(20034);
    }
    __touch(19916);
    function safeUp(script, outScript) {
        var errors = script.errors || [];
        __touch(20035);
        if (typeof script.externals !== 'object') {
            outScript.externals = {};
            __touch(20038);
            return;
            __touch(20039);
        }
        var externals = script.externals;
        __touch(20036);
        if (externals.parameters && !(externals.parameters instanceof Array)) {
            errors.push('externals.parameters needs to be an array');
            __touch(20040);
        }
        if (errors.length) {
            outScript.errors = errors;
            __touch(20041);
            return;
            __touch(20042);
        }
        if (!externals.parameters) {
            return;
            __touch(20043);
        }
        outScript.externals.parameters = [];
        __touch(20037);
        for (var i = 0; i < externals.parameters.length; i++) {
            var param = externals.parameters[i];
            __touch(20044);
            if (typeof param.key !== 'string' || param.key.length === 0) {
                errors.push({ message: 'Parameter "key" needs to be a non-empty string.' });
                __touch(20047);
                continue;
                __touch(20048);
            }
            if (param.name !== undefined && (typeof param.name !== 'string' || param.name.length === 0)) {
                errors.push({ message: 'Parameter "name" needs to be a non-empty string.' });
                __touch(20049);
                continue;
                __touch(20050);
            }
            if (types.indexOf(param.type) === -1) {
                errors.push({ message: 'Parameter "type" needs to be one of: ' + types.join(', ') + '.' });
                __touch(20051);
                continue;
                __touch(20052);
            }
            if (param.control !== undefined && (typeof param.control !== 'string' || param.control.length === 0)) {
                errors.push({ message: 'Parameter "control" needs to be a non-empty string.' });
                __touch(20053);
                continue;
                __touch(20054);
            }
            var allowedControls = typesControls[param.type];
            __touch(20045);
            if (param.control !== undefined && allowedControls.indexOf(param.control) === -1) {
                errors.push({ message: 'Parameter "control" needs to be one of: ' + allowedControls.join(', ') + '.' });
                __touch(20055);
                continue;
                __touch(20056);
            }
            if (param.options !== undefined && !(param.options instanceof Array)) {
                errors.push({ message: 'Parameter "key" needs to be array' });
                __touch(20057);
                continue;
                __touch(20058);
            }
            if (param.min !== undefined && typeof param.min !== 'number') {
                errors.push({ message: 'Parameter "min" needs to be a number.' });
                __touch(20059);
                continue;
                __touch(20060);
            }
            if (param.max !== undefined && typeof param.max !== 'number') {
                errors.push({ message: 'Parameter "max" needs to be a number.' });
                __touch(20061);
                continue;
                __touch(20062);
            }
            if (param.scale !== undefined && typeof param.scale !== 'number') {
                errors.push({ message: 'Parameter "scale" needs to be a number.' });
                __touch(20063);
                continue;
                __touch(20064);
            }
            if (param.decimals !== undefined && typeof param.decimals !== 'number') {
                errors.push({ message: 'Parameter "decimals" needs to be a number.' });
                __touch(20065);
                continue;
                __touch(20066);
            }
            if (param.precision !== undefined && typeof param.precision !== 'number') {
                errors.push({ message: 'Parameter "precision" needs to be a number.' });
                __touch(20067);
                continue;
                __touch(20068);
            }
            if (param.exponential !== undefined && typeof param.exponential !== 'boolean') {
                errors.push({ message: 'Parameter "exponential" needs to be a boolean.' });
                __touch(20069);
                continue;
                __touch(20070);
            }
            if (param['default'] === null || param['default'] === undefined) {
                param['default'] = ScriptUtils.defaultsByType[param.type];
                __touch(20071);
            }
            outScript.externals.parameters.push(param);
            __touch(20046);
        }
        if (errors.length) {
            outScript.errors = errors;
            __touch(20072);
        }
    }
    __touch(19917);
    function setError(script, error) {
        if (error.file) {
            var message = error.message;
            __touch(20073);
            if (error.line) {
                message += ' - on line ' + error.line;
                __touch(20076);
            }
            script.dependencyErrors = script.dependencyErrors || {};
            __touch(20074);
            script.dependencyErrors[error.file] = error;
            __touch(20075);
        } else {
            script.errors = script.errors || [];
            __touch(20077);
            var message = error.message;
            __touch(20078);
            if (error.line) {
                message += ' - on line ' + error.line;
                __touch(20086);
            }
            script.errors.push(error);
            __touch(20079);
            script.setup = null;
            __touch(20080);
            script.update = null;
            __touch(20081);
            script.run = null;
            __touch(20082);
            script.cleanup = null;
            __touch(20083);
            script.parameters = {};
            __touch(20084);
            script.enabled = false;
            __touch(20085);
        }
    }
    __touch(19918);
    ScriptHandler.DOM_ID_PREFIX = '_script_';
    __touch(19919);
    return ScriptHandler;
    __touch(19920);
});
__touch(19900);