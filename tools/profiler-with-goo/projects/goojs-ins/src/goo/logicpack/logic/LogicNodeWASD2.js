define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10641);
    function LogicNodeWASD2() {
        LogicNode.call(this);
        __touch(10651);
        this.logicInterface = LogicNodeWASD2.logicInterface;
        __touch(10652);
        this.type = 'LogicNodeWASD2';
        __touch(10653);
        var preventRepeat = {};
        __touch(10654);
        this.eventListenerDown = function (event) {
            var character = String.fromCharCode(event.which).toLowerCase();
            __touch(10657);
            if (preventRepeat[character]) {
                return;
                __touch(10659);
            }
            var keyEvent = LogicNodeWASD2.downKeys[character];
            __touch(10658);
            if (keyEvent) {
                preventRepeat[character] = true;
                __touch(10660);
                LogicLayer.writeValue(this.logicInstance, keyEvent.port, keyEvent.value);
                __touch(10661);
            }
        }.bind(this);
        __touch(10655);
        this.eventListenerUp = function (event) {
            var character = String.fromCharCode(event.which).toLowerCase();
            __touch(10662);
            if (preventRepeat[character]) {
                preventRepeat[character] = false;
                __touch(10664);
            }
            var keyEvent = LogicNodeWASD2.downKeys[character];
            __touch(10663);
            if (keyEvent) {
                LogicLayer.writeValue(this.logicInstance, keyEvent.port, 0);
                __touch(10665);
            }
        }.bind(this);
        __touch(10656);
    }
    __touch(10642);
    LogicNodeWASD2.prototype = Object.create(LogicNode.prototype);
    __touch(10643);
    LogicNodeWASD2.editorName = 'WASD2';
    __touch(10644);
    LogicNodeWASD2.prototype.onSystemStarted = function () {
        document.addEventListener('keydown', this.eventListenerDown);
        __touch(10666);
        document.addEventListener('keyup', this.eventListenerUp);
        __touch(10667);
    };
    __touch(10645);
    LogicNodeWASD2.prototype.onSystemStopped = function () {
        document.removeEventListener('keydown', this.eventListenerDown);
        __touch(10668);
        document.removeEventListener('keyup', this.eventListenerUp);
        __touch(10669);
    };
    __touch(10646);
    LogicNodeWASD2.logicInterface = new LogicInterface();
    __touch(10647);
    LogicNodeWASD2.downKeys = {
        'w': {
            port: LogicNodeWASD2.logicInterface.addOutputProperty('W', 'float', 0),
            value: 1
        },
        'a': {
            port: LogicNodeWASD2.logicInterface.addOutputProperty('A', 'float', 0),
            value: 1
        },
        's': {
            port: LogicNodeWASD2.logicInterface.addOutputProperty('S', 'float', 0),
            value: -1
        },
        'd': {
            port: LogicNodeWASD2.logicInterface.addOutputProperty('D', 'float', 0),
            value: -1
        }
    };
    __touch(10648);
    LogicNodes.registerType('LogicNodeWASD2', LogicNodeWASD2);
    __touch(10649);
    return LogicNodeWASD2;
    __touch(10650);
});
__touch(10640);