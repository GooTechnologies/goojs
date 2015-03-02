define(function () {
    'use strict';
    __touch(2627);
    function TriggerData() {
        this._currentTriggers = [];
        __touch(2631);
        this._currentIndex = -1;
        __touch(2632);
        this.armed = false;
        __touch(2633);
    }
    __touch(2628);
    TriggerData.prototype.arm = function (index, triggers) {
        if (triggers === null || triggers.length === 0) {
            this._currentTriggers.length = 0;
            __touch(2635);
            this.armed = false;
            __touch(2636);
        } else if (index !== this._currentIndex) {
            this._currentTriggers.length = 0;
            __touch(2637);
            for (var i = 0, max = triggers.length; i < max; i++) {
                if (triggers[i] && triggers[i] !== '') {
                    this._currentTriggers.push(triggers[i]);
                    __touch(2639);
                }
            }
            this.armed = true;
            __touch(2638);
        }
        this._currentIndex = index;
        __touch(2634);
    };
    __touch(2629);
    return TriggerData;
    __touch(2630);
});
__touch(2626);