define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/math/Vector3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
    'use strict';
    __touch(10148);
    function LogicNodeConstVec3() {
        LogicNode.call(this);
        __touch(10161);
        this.logicInterface = LogicNodeConstVec3.logicInterface;
        __touch(10162);
        this.type = 'LogicNodeConstVec3';
        __touch(10163);
    }
    __touch(10149);
    LogicNodeConstVec3.prototype = Object.create(LogicNode.prototype);
    __touch(10150);
    LogicNodeConstVec3.editorName = 'ConstVec3';
    __touch(10151);
    LogicNodeConstVec3.prototype.onConfigure = function (newConfig) {
        if (newConfig.value !== undefined) {
            this.value = newConfig.value;
            __touch(10164);
            LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
            __touch(10165);
        }
    };
    __touch(10152);
    LogicNodeConstVec3.prototype.onSystemStarted = function () {
        LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
        __touch(10166);
    };
    __touch(10153);
    LogicNodes.registerType('LogicNodeConstVec3', LogicNodeConstVec3);
    __touch(10154);
    LogicNodeConstVec3.logicInterface = new LogicInterface();
    __touch(10155);
    LogicNodeConstVec3.outportVec = LogicNodeConstVec3.logicInterface.addOutputProperty('xyz', 'Vector3');
    __touch(10156);
    LogicNodeConstVec3.logicInterface.addConfigEntry({
        name: 'x',
        type: 'float',
        label: 'X'
    });
    __touch(10157);
    LogicNodeConstVec3.logicInterface.addConfigEntry({
        name: 'y',
        type: 'float',
        label: 'Y'
    });
    __touch(10158);
    LogicNodeConstVec3.logicInterface.addConfigEntry({
        name: 'z',
        type: 'float',
        label: 'Z'
    });
    __touch(10159);
    return LogicNodeConstVec3;
    __touch(10160);
});
__touch(10147);