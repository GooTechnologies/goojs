define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7824);
    function WASDAction() {
        Action.apply(this, arguments);
        __touch(7834);
        this.updated = false;
        __touch(7835);
        this.keysPressed = {};
        __touch(7836);
        this.eventListener = function (event) {
            var keyname = WASDAction._keys[event.which];
            __touch(7838);
            if (keyname !== undefined) {
                this.updated = true;
                __touch(7839);
                this.keysPressed[keyname] = true;
                __touch(7840);
            }
        }.bind(this);
        __touch(7837);
    }
    __touch(7825);
    WASDAction.prototype = Object.create(Action.prototype);
    __touch(7826);
    WASDAction.prototype.configure = function (settings) {
        this.everyFrame = true;
        __touch(7841);
        this.targets = settings.transitions;
        __touch(7842);
    };
    __touch(7827);
    WASDAction._keys = {
        87: 'w',
        65: 'a',
        83: 's',
        68: 'd'
    };
    __touch(7828);
    WASDAction.external = function () {
        var transitions = [];
        __touch(7843);
        for (var keycode in WASDAction._keys) {
            var keyname = WASDAction._keys[keycode];
            __touch(7846);
            transitions.push({
                key: keyname,
                name: 'Key ' + keyname.toUpperCase(),
                description: 'Key \'' + keyname + '\' pressed'
            });
            __touch(7847);
        }
        __touch(7844);
        return {
            key: 'WASD Keys Listener',
            name: 'WASD Keys',
            type: 'controls',
            description: 'Transitions to other states when the WASD keys are pressed',
            canTransition: true,
            parameters: [],
            transitions: transitions
        };
        __touch(7845);
    }();
    __touch(7829);
    WASDAction.prototype._setup = function () {
        document.addEventListener('keydown', this.eventListener);
        __touch(7848);
    };
    __touch(7830);
    WASDAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(7849);
            for (var keyname in this.keysPressed) {
                var target = this.targets[keyname];
                __touch(7852);
                if (typeof target === 'string') {
                    fsm.send(target);
                    __touch(7853);
                }
            }
            __touch(7850);
            this.keysPressed = [];
            __touch(7851);
        }
    };
    __touch(7831);
    WASDAction.prototype.exit = function () {
        document.removeEventListener('keydown', this.eventListener);
        __touch(7854);
    };
    __touch(7832);
    return WASDAction;
    __touch(7833);
});
__touch(7823);