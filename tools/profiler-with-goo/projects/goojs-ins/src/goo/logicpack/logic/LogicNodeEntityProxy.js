define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10186);
    function LogicNodeEntityProxy() {
        LogicNode.call(this);
        __touch(10195);
        this.logicInterface = LogicNodeEntityProxy.logicInterface;
        __touch(10196);
        this.type = 'LogicNodeEntityProxy';
        __touch(10197);
    }
    __touch(10187);
    LogicNodeEntityProxy.prototype = Object.create(LogicNode.prototype);
    __touch(10188);
    LogicNodeEntityProxy.editorName = 'EntityProxy';
    __touch(10189);
    LogicNodeEntityProxy.prototype.onConfigure = function (config) {
        this.entityRef = config.entityRef;
        __touch(10198);
    };
    __touch(10190);
    LogicNodeEntityProxy.logicInterface = new LogicInterface('Component Proxy');
    __touch(10191);
    LogicNodeEntityProxy.logicInterface.addConfigEntry({
        name: 'entityRef',
        type: 'entityRef',
        label: 'Entity'
    });
    __touch(10192);
    LogicNodes.registerType('LogicNodeEntityProxy', LogicNodeEntityProxy);
    __touch(10193);
    return LogicNodeEntityProxy;
    __touch(10194);
});
__touch(10185);