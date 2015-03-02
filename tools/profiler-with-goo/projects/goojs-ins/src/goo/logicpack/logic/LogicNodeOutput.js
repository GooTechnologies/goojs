define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10411);
    function LogicNodeOutput() {
        LogicNode.call(this);
        __touch(10423);
        this.logicInterface = LogicNodeOutput.logicInterface;
        __touch(10424);
        this.type = 'LogicNodeOutput';
        __touch(10425);
        this.realOutport = null;
        __touch(10426);
    }
    __touch(10412);
    LogicNodeOutput.prototype = Object.create(LogicNode.prototype);
    __touch(10413);
    LogicNodeOutput.editorName = 'Output';
    __touch(10414);
    LogicNodeOutput.prototype.onInputChanged = function (instDesc, portID, value) {
        LogicLayer.writeValueToLayerOutput(instDesc, this.realOutport, value);
        __touch(10427);
    };
    __touch(10415);
    LogicNodeOutput.prototype.onEvent = function () {
    };
    __touch(10416);
    LogicNode.prototype.onConfigure = function (newConfig) {
        this.realOutport = LogicInterface.createDynamicOutput(newConfig.Name);
        __touch(10428);
    };
    __touch(10417);
    LogicNodes.registerType('LogicNodeOutput', LogicNodeOutput);
    __touch(10418);
    LogicNodeOutput.logicInterface = new LogicInterface();
    __touch(10419);
    LogicNodeOutput.inportOutput = LogicNodeOutput.logicInterface.addInputProperty('Output', 'any');
    __touch(10420);
    LogicNodeOutput.logicInterface.addConfigEntry({
        name: 'Name',
        type: 'string',
        label: 'Name'
    });
    __touch(10421);
    return LogicNodeOutput;
    __touch(10422);
});
__touch(10410);