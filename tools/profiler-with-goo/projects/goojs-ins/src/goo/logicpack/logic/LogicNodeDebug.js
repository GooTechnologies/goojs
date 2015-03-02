define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10168);
    function LogicNodeDebug() {
        LogicNode.call(this);
        __touch(10179);
        this.logicInterface = LogicNodeDebug.logicInterface;
        __touch(10180);
        this.type = 'LogicNodeDebug';
        __touch(10181);
        this._time = 0;
        __touch(10182);
    }
    __touch(10169);
    LogicNodeDebug.prototype = Object.create(LogicNode.prototype);
    __touch(10170);
    LogicNodeDebug.editorName = 'Debug';
    __touch(10171);
    LogicNodeDebug.prototype.onInputChanged = function (instDesc, portID, value) {
        console.log('LogicNodeDebug (' + this.logicInstance.name + ') value port ' + portID + ' = [' + value + ']');
        __touch(10183);
    };
    __touch(10172);
    LogicNodeDebug.prototype.onEvent = function (instDesc, portID) {
        console.log('LogicNodeDebug (' + this.logicInstance.name + ') event on port ' + portID);
        __touch(10184);
    };
    __touch(10173);
    LogicNodeDebug.logicInterface = new LogicInterface();
    __touch(10174);
    LogicNodeDebug.inportEvent = LogicNodeDebug.logicInterface.addInputEvent('Event');
    __touch(10175);
    LogicNodeDebug.inportFloat = LogicNodeDebug.logicInterface.addInputProperty('FloatValue', 'float', 0);
    __touch(10176);
    LogicNodes.registerType('LogicNodeDebug', LogicNodeDebug);
    __touch(10177);
    return LogicNodeDebug;
    __touch(10178);
});
__touch(10167);