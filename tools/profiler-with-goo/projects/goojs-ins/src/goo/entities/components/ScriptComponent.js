define([
    'goo/entities/components/Component',
    'goo/entities/SystemBus',
    'goo/scripts/Scripts',
    'goo/util/ObjectUtil'
], function (Component, SystemBus, Scripts, _) {
    'use strict';
    __touch(4898);
    function ScriptComponent(scripts) {
        this.type = 'ScriptComponent';
        __touch(4908);
        this._gooClasses = Scripts.getClasses();
        __touch(4909);
        if (scripts instanceof Array) {
            this.scripts = scripts;
            __touch(4910);
        } else if (scripts) {
            this.scripts = [scripts];
            __touch(4911);
        } else {
            this.scripts = [];
            __touch(4912);
        }
    }
    __touch(4899);
    ScriptComponent.prototype = Object.create(Component.prototype);
    __touch(4900);
    ScriptComponent.prototype.constructor = ScriptComponent;
    __touch(4901);
    ScriptComponent.prototype.setup = function (entity) {
        var systemContext = entity._world.getSystem('ScriptSystem').context;
        __touch(4913);
        var componentContext = Object.create(systemContext);
        __touch(4914);
        _.extend(componentContext, {
            entity: entity,
            entityData: {}
        });
        __touch(4915);
        for (var i = 0; i < this.scripts.length; i++) {
            var script = this.scripts[i];
            __touch(4916);
            if (!script.context) {
                script.context = Object.create(componentContext);
                __touch(4917);
                if (script.parameters && script.parameters.enabled !== undefined) {
                    script.enabled = script.parameters.enabled;
                    __touch(4918);
                } else {
                    script.enabled = true;
                    __touch(4919);
                }
                if (script.setup && script.enabled) {
                    try {
                        script.setup(script.parameters, script.context, this._gooClasses);
                        __touch(4921);
                    } catch (e) {
                        this._handleError(script, e, 'setup');
                        __touch(4922);
                    }
                    __touch(4920);
                }
            }
        }
    };
    __touch(4902);
    ScriptComponent.prototype.run = function (entity) {
        for (var i = 0; i < this.scripts.length; i++) {
            var script = this.scripts[i];
            __touch(4923);
            if (script && script.run && (script.enabled === undefined || script.enabled)) {
                try {
                    script.run(entity, entity._world.tpf, script.context, script.parameters);
                    __touch(4925);
                } catch (e) {
                }
                __touch(4924);
            } else if (script.update && (script.enabled === undefined || script.enabled)) {
                try {
                    script.update(script.parameters, script.context, this._gooClasses);
                    __touch(4927);
                } catch (e) {
                    this._handleError(script, e, 'update');
                    __touch(4928);
                }
                __touch(4926);
            }
        }
    };
    __touch(4903);
    ScriptComponent.prototype.cleanup = function () {
        for (var i = 0; i < this.scripts.length; i++) {
            var script = this.scripts[i];
            __touch(4929);
            if (script.context) {
                if (script.cleanup) {
                    try {
                        script.cleanup(script.parameters, script.context, this._gooClasses);
                        __touch(4933);
                    } catch (e) {
                        this._handleError(script, e, 'cleanup');
                        __touch(4934);
                    }
                    __touch(4932);
                }
                script.enabled = false;
                __touch(4930);
                script.context = null;
                __touch(4931);
            }
        }
    };
    __touch(4904);
    ScriptComponent.prototype._handleError = function (script, error, phase) {
        script.enabled = false;
        __touch(4935);
        var err = {
            id: script.id,
            errors: [{
                    message: error.message || error,
                    phase: phase
                }]
        };
        __touch(4936);
        var m = error.stack.split('\n')[1].match(/(\d+):\d+\)$/);
        __touch(4937);
        if (m) {
            err.errors[0].line = parseInt(m[1], 10) - 1;
            __touch(4940);
        }
        console.error(err.errors[0].message, err);
        __touch(4938);
        SystemBus.emit('goo.scriptError', err);
        __touch(4939);
    };
    __touch(4905);
    ScriptComponent.applyOnEntity = function (obj, entity) {
        if (obj instanceof Function || obj && obj.run instanceof Function || obj && obj.update instanceof Function) {
            var scriptComponent;
            __touch(4941);
            if (!entity.scriptComponent) {
                scriptComponent = new ScriptComponent();
                __touch(4944);
                entity.setComponent(scriptComponent);
                __touch(4945);
            } else {
                scriptComponent = entity.scriptComponent;
                __touch(4946);
            }
            scriptComponent.scripts.push(obj.run instanceof Function || obj.update instanceof Function ? obj : { run: obj });
            __touch(4942);
            return true;
            __touch(4943);
        }
    };
    __touch(4906);
    return ScriptComponent;
    __touch(4907);
});
__touch(4897);