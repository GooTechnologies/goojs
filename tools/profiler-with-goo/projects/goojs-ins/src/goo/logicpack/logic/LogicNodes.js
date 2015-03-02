define(function () {
    'use strict';
    __touch(10671);
    function LogicNodes() {
    }
    __touch(10672);
    LogicNodes.types = {};
    __touch(10673);
    LogicNodes.registerType = function (name, fn) {
        LogicNodes.types[name] = {
            fn: fn,
            name: name,
            editorName: fn.editorName
        };
        __touch(10679);
    };
    __touch(10674);
    LogicNodes.getInterfaceByName = function (name) {
        if (LogicNodes.types[name] !== undefined) {
            return LogicNodes.types[name].fn.logicInterface;
            __touch(10681);
        }
        return null;
        __touch(10680);
    };
    __touch(10675);
    LogicNodes.getClass = function (name) {
        if (LogicNodes.types[name] === undefined) {
            return function () {
                console.error('LogicNode type [' + name + '] does not exist.');
                __touch(10684);
                return null;
                __touch(10685);
            };
            __touch(10683);
        }
        return LogicNodes.types[name].fn;
        __touch(10682);
    };
    __touch(10676);
    LogicNodes.getAllTypes = function () {
        var out = [];
        __touch(10686);
        for (var n in LogicNodes.types) {
            out.push(LogicNodes.types[n]);
            __touch(10689);
        }
        __touch(10687);
        return out;
        __touch(10688);
    };
    __touch(10677);
    return LogicNodes;
    __touch(10678);
});
__touch(10670);