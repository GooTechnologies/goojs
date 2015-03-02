define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6403);
    function ArrowsAction() {
        Action.apply(this, arguments);
        __touch(6413);
        this.updated = false;
        __touch(6414);
        this.keysPressed = {};
        __touch(6415);
        this.eventListener = function (event) {
            var keyname = ArrowsAction._keys[event.which];
            __touch(6417);
            if (keyname !== undefined) {
                this.updated = true;
                __touch(6418);
                this.keysPressed[keyname] = true;
                __touch(6419);
            }
        }.bind(this);
        __touch(6416);
    }
    __touch(6404);
    ArrowsAction.prototype = Object.create(Action.prototype);
    __touch(6405);
    ArrowsAction.prototype.configure = function (settings) {
        this.everyFrame = true;
        __touch(6420);
        this.targets = settings.transitions;
        __touch(6421);
    };
    __touch(6406);
    ArrowsAction._keys = {
        38: 'up',
        37: 'left',
        40: 'down',
        39: 'right'
    };
    __touch(6407);
    ArrowsAction.external = function () {
        var transitions = [];
        __touch(6422);
        for (var keycode in ArrowsAction._keys) {
            var keyname = ArrowsAction._keys[keycode];
            __touch(6425);
            transitions.push({
                name: 'Key ' + keyname.toUpperCase(),
                key: keyname,
                description: 'Key \'' + keyname + '\' pressed'
            });
            __touch(6426);
        }
        __touch(6423);
        return {
            key: 'Arrow Keys Listener',
            name: 'Arrow Keys',
            type: 'controls',
            description: 'Transitions to other states when arrow keys are pressed',
            canTransition: true,
            parameters: [],
            transitions: transitions
        };
        __touch(6424);
    }();
    __touch(6408);
    ArrowsAction.prototype._setup = function () {
        document.addEventListener('keydown', this.eventListener);
        __touch(6427);
    };
    __touch(6409);
    ArrowsAction.prototype._run = function (fsm) {
        if (this.updated) {
            this.updated = false;
            __touch(6428);
            for (var keyname in this.keysPressed) {
                var target = this.targets[keyname];
                __touch(6431);
                if (typeof target === 'string') {
                    fsm.send(target);
                    __touch(6432);
                }
            }
            __touch(6429);
            this.keysPressed = [];
            __touch(6430);
        }
    };
    __touch(6410);
    ArrowsAction.prototype.exit = function () {
        document.removeEventListener('keydown', this.eventListener);
        __touch(6433);
    };
    __touch(6411);
    return ArrowsAction;
    __touch(6412);
});
__touch(6402);