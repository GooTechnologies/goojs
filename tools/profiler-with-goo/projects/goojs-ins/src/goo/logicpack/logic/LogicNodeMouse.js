define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10334);
    function LogicNodeMouse() {
        LogicNode.call(this);
        __touch(10349);
        this.logicInterface = LogicNodeMouse.logicInterface;
        __touch(10350);
        this.type = 'LogicNodeMouse';
        __touch(10351);
        this.eventMouseMove = function (event) {
            var mx = event.clientX;
            __touch(10354);
            var my = event.clientY;
            __touch(10355);
            var dx = mx - this.x;
            __touch(10356);
            var dy = my - this.y;
            __touch(10357);
            LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portX, mx);
            __touch(10358);
            LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portY, my);
            __touch(10359);
            LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDX, dx);
            __touch(10360);
            LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDY, dy);
            __touch(10361);
        }.bind(this);
        __touch(10352);
        this.eventMouseDown = function (event) {
            if (event.button === 0) {
                LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventLmb);
                __touch(10362);
            }
            if (event.button === 2) {
                LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventRmb);
                __touch(10363);
            }
        }.bind(this);
        __touch(10353);
    }
    __touch(10335);
    LogicNodeMouse.prototype = Object.create(LogicNode.prototype);
    __touch(10336);
    LogicNodeMouse.editorName = 'Mouse';
    __touch(10337);
    LogicNodeMouse.prototype.onSystemStarted = function () {
        this.x = 0;
        __touch(10364);
        this.y = 0;
        __touch(10365);
        document.addEventListener('mousemove', this.eventMouseMove, false);
        __touch(10366);
        document.addEventListener('mousedown', this.eventMouseDown, false);
        __touch(10367);
    };
    __touch(10338);
    LogicNodeMouse.prototype.onSystemStopped = function () {
        document.removeEventListener('mousemove', this.eventMouseMove);
        __touch(10368);
        document.removeEventListener('mousedown', this.eventMouseDown);
        __touch(10369);
    };
    __touch(10339);
    LogicNodeMouse.logicInterface = new LogicInterface();
    __touch(10340);
    LogicNodeMouse.portX = LogicNodeMouse.logicInterface.addOutputProperty('x', 'float', 0);
    __touch(10341);
    LogicNodeMouse.portY = LogicNodeMouse.logicInterface.addOutputProperty('y', 'float', 0);
    __touch(10342);
    LogicNodeMouse.portDX = LogicNodeMouse.logicInterface.addOutputProperty('dx', 'float', 0);
    __touch(10343);
    LogicNodeMouse.portDY = LogicNodeMouse.logicInterface.addOutputProperty('dy', 'float', 0);
    __touch(10344);
    LogicNodeMouse.outEventLmb = LogicNodeMouse.logicInterface.addOutputEvent('lmb');
    __touch(10345);
    LogicNodeMouse.outEventRmb = LogicNodeMouse.logicInterface.addOutputEvent('rmb');
    __touch(10346);
    LogicNodes.registerType('LogicNodeMouse', LogicNodeMouse);
    __touch(10347);
    return LogicNodeMouse;
    __touch(10348);
});
__touch(10333);