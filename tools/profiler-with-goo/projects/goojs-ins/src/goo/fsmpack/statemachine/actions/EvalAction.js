define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6571);
    function EvalAction() {
        Action.apply(this, arguments);
        __touch(6579);
        this.expressionFunction = null;
        __touch(6580);
    }
    __touch(6572);
    EvalAction.prototype = Object.create(Action.prototype);
    __touch(6573);
    EvalAction.prototype.constructor = EvalAction;
    __touch(6574);
    EvalAction.external = {
        name: 'Eval',
        description: 'Evaluates a JS expression',
        parameters: [{
                name: 'expression',
                key: 'expression',
                type: 'string',
                description: 'JavaScript expression to evaluate',
                'default': ''
            }],
        transitions: []
    };
    __touch(6575);
    EvalAction.prototype._setup = function () {
        this.expressionFunction = new Function('goo', this.expression);
        __touch(6581);
    };
    __touch(6576);
    EvalAction.prototype._run = function (fsm) {
        if (this.expressionFunction) {
            try {
                this.expressionFunction(fsm.getEvalProxy());
                __touch(6583);
            } catch (e) {
                console.warn('Eval code error: ' + e.message);
                __touch(6584);
            }
            __touch(6582);
        }
    };
    __touch(6577);
    return EvalAction;
    __touch(6578);
});
__touch(6570);