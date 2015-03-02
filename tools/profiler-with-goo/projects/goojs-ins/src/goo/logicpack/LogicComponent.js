define([
    'goo/logic/LogicInterface',
    'goo/logic/LogicLayer',
    'goo/logic/LogicNodes',
    'goo/entities/components/Component'
], function (LogicInterface, LogicLayer, LogicNodes, Component) {
    'use strict';
    __touch(9832);
    function LogicComponent(entity) {
        Component.call(this);
        __touch(9838);
        this.type = 'LogicComponent';
        __touch(9839);
        this.parent = null;
        __touch(9840);
        this.logicInstance = null;
        __touch(9841);
        this.logicLayer = null;
        __touch(9842);
        this.nodes = {};
        __touch(9843);
        this._entity = entity;
        __touch(9844);
    }
    __touch(9833);
    LogicComponent.prototype = Object.create(Component.prototype);
    __touch(9834);
    LogicComponent.prototype.configure = function (conf) {
        for (var x in this.nodes) {
            if (this.nodes[x].onSystemStopped !== undefined) {
                this.nodes[x].onSystemStopped(false);
                __touch(9849);
            }
        }
        __touch(9845);
        this.logicLayer = new LogicLayer(this._entity);
        __touch(9846);
        this.nodes = {};
        __touch(9847);
        for (var k in conf.logicNodes) {
            var ln = conf.logicNodes[k];
            __touch(9850);
            var Fn = LogicNodes.getClass(ln.type);
            __touch(9851);
            var obj = new Fn();
            __touch(9852);
            obj.configure(ln);
            __touch(9853);
            obj.addToLogicLayer(this.logicLayer, ln.id);
            __touch(9854);
            this.nodes[k] = obj;
            __touch(9855);
        }
        __touch(9848);
    };
    __touch(9835);
    LogicComponent.prototype.process = function (tpf) {
        if (this.logicLayer !== null) {
            this.logicLayer.process(tpf);
            __touch(9856);
        }
    };
    __touch(9836);
    return LogicComponent;
    __touch(9837);
});
__touch(9831);