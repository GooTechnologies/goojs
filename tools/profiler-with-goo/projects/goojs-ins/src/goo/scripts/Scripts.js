define([
    'goo/scripts/ScriptUtils',
    'goo/util/ObjectUtil'
], function (ScriptUtils, _) {
    'use strict';
    __touch(20435);
    var _scripts = {};
    __touch(20436);
    var _gooClasses = {};
    __touch(20437);
    var Scripts = {};
    __touch(20438);
    Scripts.register = function (factoryFunction) {
        var key = factoryFunction.externals.key || factoryFunction.externals.name;
        __touch(20446);
        if (_scripts[key]) {
            console.warn('Script already registered for key ' + key);
            __touch(20449);
            return;
            __touch(20450);
        }
        ScriptUtils.fillDefaultNames(factoryFunction.externals.parameters);
        __touch(20447);
        _scripts[key] = factoryFunction;
        __touch(20448);
    };
    __touch(20439);
    Scripts.addClass = function (name, klass) {
        _gooClasses[name] = klass;
        __touch(20451);
    };
    __touch(20440);
    Scripts.getClasses = function () {
        return _gooClasses;
        __touch(20452);
    };
    __touch(20441);
    Scripts.getScript = function (key) {
        return _scripts[key];
        __touch(20453);
    };
    __touch(20442);
    Scripts.create = function (key, options) {
        var factoryFunction;
        __touch(20454);
        if (typeof key === 'string') {
            factoryFunction = _scripts[key];
            __touch(20460);
            if (!factoryFunction) {
                throw new Error('Script "' + key + '" is not registered');
                __touch(20461);
            }
        } else if (typeof key === 'function') {
            factoryFunction = key;
            __touch(20462);
        }
        var script = factoryFunction();
        __touch(20455);
        script.parameters = {};
        __touch(20456);
        script.environment = null;
        __touch(20457);
        script.externals = factoryFunction.externals;
        __touch(20458);
        if (factoryFunction.externals) {
            ScriptUtils.fillDefaultNames(script.externals.parameters);
            __touch(20463);
            ScriptUtils.fillDefaultValues(script.parameters, factoryFunction.externals.parameters);
            __touch(20464);
        }
        if (options) {
            _.extend(script.parameters, options);
            __touch(20465);
        }
        return script;
        __touch(20459);
    };
    __touch(20443);
    Scripts.allScripts = function () {
        var scripts = {};
        __touch(20466);
        var keys = Object.keys(_scripts);
        __touch(20467);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            __touch(20469);
            scripts[key] = _scripts[key];
            __touch(20470);
        }
        return scripts;
        __touch(20468);
    };
    __touch(20444);
    return Scripts;
    __touch(20445);
});
__touch(20434);