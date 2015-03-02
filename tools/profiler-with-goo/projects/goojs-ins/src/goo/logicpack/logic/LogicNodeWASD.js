define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10610);
    function LogicNodeWASD() {
        LogicNode.call(this);
        __touch(10621);
        this.logicInterface = LogicNodeWASD.logicInterface;
        __touch(10622);
        this.type = 'LogicNodeWASD';
        __touch(10623);
        var preventRepeat = {};
        __touch(10624);
        this.eventListenerDown = function (event) {
            var character = String.fromCharCode(event.which).toLowerCase();
            __touch(10627);
            if (preventRepeat[character]) {
                return;
                __touch(10629);
            }
            var keyEvent = LogicNodeWASD.downKeys[character];
            __touch(10628);
            if (keyEvent) {
                preventRepeat[character] = true;
                __touch(10630);
                LogicLayer.fireEvent(this.logicInstance, keyEvent);
                __touch(10631);
            }
        }.bind(this);
        __touch(10625);
        this.eventListenerUp = function (event) {
            var character = String.fromCharCode(event.which).toLowerCase();
            __touch(10632);
            if (preventRepeat[character]) {
                preventRepeat[character] = false;
                __touch(10634);
            }
            var keyEvent = LogicNodeWASD.upKeys[character];
            __touch(10633);
            if (keyEvent) {
                LogicLayer.fireEvent(this.logicInstance, keyEvent);
                __touch(10635);
            }
        }.bind(this);
        __touch(10626);
    }
    __touch(10611);
    LogicNodeWASD.prototype = Object.create(LogicNode.prototype);
    __touch(10612);
    LogicNodeWASD.editorName = 'WASD';
    __touch(10613);
    LogicNodeWASD.prototype.onSystemStarted = function () {
        document.addEventListener('keydown', this.eventListenerDown);
        __touch(10636);
        document.addEventListener('keyup', this.eventListenerUp);
        __touch(10637);
    };
    __touch(10614);
    LogicNodeWASD.prototype.onSystemStopped = function () {
        document.removeEventListener('keydown', this.eventListenerDown);
        __touch(10638);
        document.removeEventListener('keyup', this.eventListenerUp);
        __touch(10639);
    };
    __touch(10615);
    LogicNodeWASD.logicInterface = new LogicInterface();
    __touch(10616);
    LogicNodeWASD.downKeys = {
        'w': LogicNodeWASD.logicInterface.addOutputEvent('W-down'),
        'a': LogicNodeWASD.logicInterface.addOutputEvent('A-down'),
        's': LogicNodeWASD.logicInterface.addOutputEvent('S-down'),
        'd': LogicNodeWASD.logicInterface.addOutputEvent('D-down')
    };
    __touch(10617);
    LogicNodeWASD.upKeys = {
        'w': LogicNodeWASD.logicInterface.addOutputEvent('W-up'),
        'a': LogicNodeWASD.logicInterface.addOutputEvent('A-up'),
        's': LogicNodeWASD.logicInterface.addOutputEvent('S-up'),
        'd': LogicNodeWASD.logicInterface.addOutputEvent('D-up')
    };
    __touch(10618);
    LogicNodes.registerType('LogicNodeWASD', LogicNodeWASD);
    __touch(10619);
    return LogicNodeWASD;
    __touch(10620);
});
__touch(10609);