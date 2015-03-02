define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/fsmpack/statemachine/StateMachineComponent',
    'goo/util/rsvp',
    'goo/util/ObjectUtil'
], function (ComponentHandler, StateMachineComponent, RSVP, _) {
    'use strict';
    __touch(5921);
    function StateMachineComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(5929);
        this._type = 'StateMachineComponent';
        __touch(5930);
    }
    __touch(5922);
    StateMachineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(5923);
    StateMachineComponentHandler.prototype.constructor = StateMachineComponentHandler;
    __touch(5924);
    ComponentHandler._registerClass('stateMachine', StateMachineComponentHandler);
    __touch(5925);
    StateMachineComponentHandler.prototype._create = function () {
        return new StateMachineComponent();
        __touch(5931);
    };
    __touch(5926);
    StateMachineComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(5932);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(5937);
            }
            var promises = [];
            __touch(5934);
            _.forEach(config.machines, function (machineCfg) {
                promises.push(that._load(machineCfg.machineRef, options));
                __touch(5938);
            }, null, 'sortValue');
            __touch(5935);
            return RSVP.all(promises).then(function (machines) {
                for (var i = 0; i < machines.length; i++) {
                    if (component._machines.indexOf(machines[i]) === -1) {
                        component.addMachine(machines[i]);
                        __touch(5940);
                    }
                }
                for (var i = 0; i < component._machines.length; i++) {
                    if (machines.indexOf(component._machines[i]) === -1) {
                        component.removeMachine(component._machines[i]);
                        __touch(5941);
                    }
                }
                return component;
                __touch(5939);
            });
            __touch(5936);
        });
        __touch(5933);
    };
    __touch(5927);
    return StateMachineComponentHandler;
    __touch(5928);
});
__touch(5920);