define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/ScriptComponent',
    'goo/util/rsvp',
    'goo/util/ObjectUtil',
    'goo/util/PromiseUtil',
    'goo/entities/SystemBus',
    'goo/scripts/Scripts',
    'goo/scripts/ScriptUtils'
], function (ComponentHandler, ScriptComponent, RSVP, _, PromiseUtil, SystemBus, Scripts, ScriptUtils) {
    'use strict';
    __touch(19837);
    function ScriptComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(19850);
        this._type = 'ScriptComponent';
        __touch(19851);
    }
    __touch(19838);
    ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(19839);
    ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
    __touch(19840);
    ComponentHandler._registerClass('script', ScriptComponentHandler);
    __touch(19841);
    ScriptComponentHandler.ENGINE_SCRIPT_PREFIX = 'GOO_ENGINE_SCRIPTS/';
    __touch(19842);
    ScriptComponentHandler.prototype._prepare = function () {
    };
    __touch(19843);
    ScriptComponentHandler.prototype._create = function () {
        return new ScriptComponent();
        __touch(19852);
    };
    __touch(19844);
    ScriptComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(19853);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(19858);
            }
            var promises = [];
            __touch(19855);
            _.forEach(config.scripts, function (scriptInstance) {
                var ref = scriptInstance.scriptRef;
                __touch(19859);
                var isEngineScript = ref.indexOf(ScriptComponentHandler.ENGINE_SCRIPT_PREFIX) === 0;
                __touch(19860);
                var promise = null;
                __touch(19861);
                if (isEngineScript) {
                    var scriptName = ref.slice(ScriptComponentHandler.ENGINE_SCRIPT_PREFIX.length);
                    __touch(19864);
                    promise = _createEngineScript(scriptName);
                    __touch(19865);
                } else {
                    promise = that._load(scriptInstance.scriptRef, { reload: true });
                    __touch(19866);
                }
                promise = promise.then(function (script) {
                    scriptInstance.options = scriptInstance.options || {};
                    __touch(19867);
                    if (script.parameters) {
                        _.defaults(scriptInstance.options, script.parameters);
                        __touch(19872);
                    }
                    if (script.externals && script.externals.parameters) {
                        ScriptUtils.fillDefaultValues(scriptInstance.options, script.externals.parameters);
                        __touch(19873);
                    }
                    var newScript = Object.create(script);
                    __touch(19868);
                    newScript.parameters = {};
                    __touch(19869);
                    newScript.enabled = false;
                    __touch(19870);
                    return that._setParameters(newScript.parameters, scriptInstance.options, script.externals, options).then(function () {
                        return newScript;
                        __touch(19874);
                    });
                    __touch(19871);
                });
                __touch(19862);
                promises.push(promise);
                __touch(19863);
            }, null, 'sortValue');
            __touch(19856);
            return RSVP.all(promises).then(function (scripts) {
                component.scripts = scripts;
                __touch(19875);
                return component;
                __touch(19876);
            });
            __touch(19857);
        });
        __touch(19854);
    };
    __touch(19845);
    ScriptComponentHandler.prototype._setParameters = function (parameters, config, externals, options) {
        if (!externals || !externals.parameters) {
            return PromiseUtil.resolve();
            __touch(19880);
        }
        var promises = [];
        __touch(19877);
        for (var i = 0; i < externals.parameters.length; i++) {
            var external = externals.parameters[i];
            __touch(19881);
            this._setParameter(parameters, config[external.key], external, options);
            __touch(19882);
        }
        parameters.enabled = config.enabled !== undefined ? config.enabled : true;
        __touch(19878);
        return RSVP.all(promises);
        __touch(19879);
    };
    __touch(19846);
    ScriptComponentHandler.prototype._setParameter = function (parameters, config, external, options) {
        var key = external.key;
        __touch(19883);
        if (external.type === 'texture') {
            if (!config || !config.textureRef || config.enabled === false) {
                parameters[key] = null;
                __touch(19884);
                return PromiseUtil.resolve();
                __touch(19885);
            } else {
                return this._load(config.textureRef, options).then(function (texture) {
                    parameters[key] = texture;
                    __touch(19887);
                });
                __touch(19886);
            }
        } else if (external.type === 'entity') {
            if (!config || !config.entityRef || config.enabled === false) {
                parameters[key] = null;
                __touch(19888);
                return PromiseUtil.resolve();
                __touch(19889);
            } else {
                return this._load(config.entityRef, options).then(function (entity) {
                    parameters[key] = entity;
                    __touch(19891);
                });
                __touch(19890);
            }
        } else {
            parameters[key] = _.extend(config);
            __touch(19892);
            return PromiseUtil.resolve();
            __touch(19893);
        }
    };
    __touch(19847);
    function _createEngineScript(scriptName) {
        var script = Scripts.create(scriptName);
        __touch(19894);
        if (!script) {
            throw new Error('Unrecognized script name');
            __touch(19899);
        }
        script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
        __touch(19895);
        script.enabled = false;
        __touch(19896);
        SystemBus.emit('goo.scriptExternals', {
            id: script.id,
            externals: script.externals
        });
        __touch(19897);
        return PromiseUtil.resolve(script);
        __touch(19898);
    }
    __touch(19848);
    return ScriptComponentHandler;
    __touch(19849);
});
__touch(19836);