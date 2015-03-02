define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10218);
    function LogicNodeInput() {
        LogicNode.call(this);
        __touch(10229);
        this.logicInterface = LogicNodeInput.logicInterface;
        __touch(10230);
        this.type = 'LogicNodeInput';
        __touch(10231);
        this.dummyInport = null;
        __touch(10232);
    }
    __touch(10219);
    LogicNodeInput.prototype = Object.create(LogicNode.prototype);
    __touch(10220);
    LogicNodeInput.editorName = 'Input';
    __touch(10221);
    LogicNodeInput.prototype.onConfigure = function (newConfig) {
        this.dummyInport = LogicInterface.createDynamicInput(newConfig.Name);
        __touch(10233);
    };
    __touch(10222);
    LogicNodeInput.prototype.onInputChanged = function (instDesc, portID, value) {
        LogicLayer.writeValue(this.logicInstance, LogicNodeInput.outportInput, value);
        __touch(10234);
    };
    __touch(10223);
    LogicNodes.registerType('LogicNodeInput', LogicNodeInput);
    __touch(10224);
    LogicNodeInput.logicInterface = new LogicInterface();
    __touch(10225);
    LogicNodeInput.outportInput = LogicNodeInput.logicInterface.addOutputProperty('Input', 'any');
    __touch(10226);
    LogicNodeInput.logicInterface.addConfigEntry({
        name: 'Name',
        type: 'string',
        label: 'Name'
    });
    __touch(10227);
    return LogicNodeInput;
    __touch(10228);
});
__touch(10217);