define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7462);
    function TestAngleAction(settings) {
        settings = settings || {};
        __touch(7468);
        this.everyFrame = settings.everyFrame || true;
        __touch(7469);
        this.entity = settings.entity || null;
        __touch(7470);
        this.rangeMin = settings.rangeMin || 0;
        __touch(7471);
        this.rangeMax = settings.rangeMax || Math.PI;
        __touch(7472);
        this.eventInRange = settings.eventInRange || 'inRange';
        __touch(7473);
        this.eventOutRange = settings.eventOutRange || 'outRange';
        __touch(7474);
    }
    __touch(7463);
    TestAngleAction.prototype = Object.create(Action.prototype);
    __touch(7464);
    TestAngleAction.external = [
        {
            name: 'Entity',
            key: 'entity',
            type: 'entity'
        },
        {
            name: 'RangeMin',
            key: 'rangeMin',
            type: 'spinner'
        },
        {
            name: 'RangeMax',
            key: 'rangeMax',
            type: 'spinner'
        },
        {
            name: 'Event In Range',
            key: 'eventInRange',
            type: 'event'
        },
        {
            name: 'Event Out Of Range',
            key: 'eventOutRange',
            type: 'event'
        }
    ];
    __touch(7465);
    TestAngleAction.prototype.onUpdate = function (fsm) {
        if (this.entity !== null && this.entity.body) {
            var angle = this.entity.body.GetAngle() % (Math.PI * 2);
            __touch(7475);
            if (angle < 0) {
                angle = Math.PI * 2 + angle;
                __touch(7476);
            }
            if (angle >= this.rangeMin && angle <= this.rangeMax) {
                fsm.handle(this.eventInRange);
                __touch(7477);
            } else {
                fsm.handle(this.eventOutRange);
                __touch(7478);
            }
        }
    };
    __touch(7466);
    return TestAngleAction;
    __touch(7467);
});
__touch(7461);