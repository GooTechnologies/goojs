define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7480);
    function TestSpeedAction(settings) {
        this.type = 'TestSpeedAction';
        __touch(7486);
        this.everyFrame = settings.everyFrame || true;
        __touch(7487);
        settings = settings || {};
        __touch(7488);
        this.entity = settings.entity || null;
        __touch(7489);
        this.rangeMin = settings.rangeMin || 0;
        __touch(7490);
        this.rangeMax = settings.rangeMax || Math.PI;
        __touch(7491);
        this.eventInRange = settings.eventInRange || 'inRange';
        __touch(7492);
        this.eventOutRange = settings.eventOutRange || 'outRange';
        __touch(7493);
    }
    __touch(7481);
    TestSpeedAction.prototype = Object.create(Action.prototype);
    __touch(7482);
    TestSpeedAction.external = [
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
    __touch(7483);
    TestSpeedAction.prototype.onUpdate = function (fsm) {
        if (this.entity !== null && this.entity.body) {
            var speed = this.entity.body.GetLinearVelocity().Length();
            __touch(7494);
            if (speed >= this.rangeMin && speed <= this.rangeMax) {
                fsm.handle(this.eventInRange);
                __touch(7495);
            } else {
                fsm.handle(this.eventOutRange);
                __touch(7496);
            }
        }
    };
    __touch(7484);
    return TestSpeedAction;
    __touch(7485);
});
__touch(7479);