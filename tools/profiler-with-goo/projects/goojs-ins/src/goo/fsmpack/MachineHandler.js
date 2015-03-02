define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil',
    'goo/fsmpack/statemachine/State',
    'goo/fsmpack/statemachine/Machine',
    'goo/fsmpack/statemachine/actions/Actions',
    'goo/util/rsvp'
], function (ConfigHandler, PromiseUtil, _, State, Machine, Actions, RSVP) {
    'use strict';
    __touch(5858);
    function MachineHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(5870);
    }
    __touch(5859);
    MachineHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(5860);
    MachineHandler.prototype.constructor = MachineHandler;
    __touch(5861);
    ConfigHandler._registerClass('machine', MachineHandler);
    __touch(5862);
    MachineHandler.prototype._remove = function (ref) {
        var machine = this._objects[ref];
        __touch(5871);
        if (machine) {
            machine.removeFromParent();
            __touch(5873);
        }
        delete this._objects[ref];
        __touch(5872);
    };
    __touch(5863);
    MachineHandler.prototype._create = function () {
        return new Machine();
        __touch(5874);
    };
    __touch(5864);
    MachineHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(5875);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (machine) {
            if (!machine) {
                return;
                __touch(5882);
            }
            machine.name = config.name;
            __touch(5877);
            for (var key in machine._states) {
                if (!config.states[key]) {
                    machine.removeState(key);
                    __touch(5883);
                }
            }
            __touch(5878);
            var promises = [];
            __touch(5879);
            for (var key in config.states) {
                promises.push(that._updateState(machine, config.states[key], options));
                __touch(5884);
            }
            __touch(5880);
            return RSVP.all(promises).then(function () {
                machine.setInitialState(config.initialState);
                __touch(5885);
                return machine;
                __touch(5886);
            });
            __touch(5881);
        });
        __touch(5876);
    };
    __touch(5865);
    MachineHandler.prototype._updateActions = function (state, stateConfig) {
        for (var i = 0; i < state._actions.length; i++) {
            var action = state._actions[i];
            __touch(5890);
            if (!stateConfig.actions || !stateConfig.actions[action.id]) {
                state.removeAction(action);
                __touch(5891);
                i--;
                __touch(5892);
            }
        }
        var actions = [];
        __touch(5887);
        _.forEach(stateConfig.actions, function (actionConfig) {
            var action = state.getAction(actionConfig.id);
            __touch(5893);
            if (!action) {
                var Action = Actions.actionForType(actionConfig.type);
                __touch(5895);
                action = new Action(actionConfig.id, actionConfig.options);
                __touch(5896);
                if (action.onCreate) {
                    action.onCreate(state.proxy);
                    __touch(5897);
                }
            } else {
                action.configure(actionConfig.options);
                __touch(5898);
            }
            actions.push(action);
            __touch(5894);
        }, null, 'sortValue');
        __touch(5888);
        state._actions = actions;
        __touch(5889);
    };
    __touch(5866);
    MachineHandler.prototype._updateTransitions = function (state, stateConfig) {
        state._transitions = {};
        __touch(5899);
        for (var key in stateConfig.transitions) {
            var transition = stateConfig.transitions[key];
            __touch(5901);
            state.setTransition(transition.id, transition.targetState);
            __touch(5902);
        }
        __touch(5900);
    };
    __touch(5867);
    MachineHandler.prototype._updateState = function (machine, stateConfig, options) {
        var that = this;
        __touch(5903);
        var state;
        __touch(5904);
        if (machine._states && machine._states[stateConfig.id]) {
            state = machine._states[stateConfig.id];
            __touch(5911);
        } else {
            state = new State(stateConfig.id);
            __touch(5912);
            machine.addState(state);
            __touch(5913);
        }
        state.name = stateConfig.name;
        __touch(5905);
        this._updateActions(state, stateConfig);
        __touch(5906);
        this._updateTransitions(state, stateConfig);
        __touch(5907);
        for (var i = 0; i < state._machines; i++) {
            var childMachine = state._machines[i];
            __touch(5914);
            if (!stateConfig.childMachines[childMachine.id]) {
                state.removeMachine(childMachine);
                __touch(5915);
                i--;
                __touch(5916);
            }
        }
        var promises = [];
        __touch(5908);
        for (var key in stateConfig.childMachines) {
            promises.push(this._load(stateConfig.childMachines[key].machineRef, options));
            __touch(5917);
        }
        __touch(5909);
        return RSVP.all(promises).then(function (machines) {
            for (var i = 0; i < machines; i++) {
                state.addMachine(machines[i]);
                __touch(5919);
            }
            return state;
            __touch(5918);
        });
        __touch(5910);
    };
    __touch(5868);
    return MachineHandler;
    __touch(5869);
});
__touch(5857);