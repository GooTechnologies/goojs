define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(21431);
    function TimelineSystem() {
        System.call(this, 'TimelineSystem', ['TimelineComponent']);
        __touch(21440);
    }
    __touch(21432);
    TimelineSystem.prototype = Object.create(System.prototype);
    __touch(21433);
    TimelineSystem.prototype.constructor = TimelineSystem;
    __touch(21434);
    TimelineSystem.prototype.process = function (entities, tpf) {
        if (this.resetRequest) {
            var component;
            __touch(21441);
            this.resetRequest = false;
            __touch(21442);
            for (var i = 0; i < entities.length; i++) {
                component = entities[i].timelineComponent;
                __touch(21446);
                component.setTime(0);
                __touch(21447);
            }
            this.time = 0;
            __touch(21443);
            if (window.TWEEN) {
                window.TWEEN.removeAll();
                __touch(21448);
            }
            this.passive = true;
            __touch(21444);
            return;
            __touch(21445);
        }
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(21449);
            entity.timelineComponent.update(tpf);
            __touch(21450);
        }
    };
    __touch(21435);
    TimelineSystem.prototype.pause = function () {
        this.passive = true;
        __touch(21451);
        this.paused = true;
        __touch(21452);
    };
    __touch(21436);
    TimelineSystem.prototype.play = function () {
        this.passive = false;
        __touch(21453);
        if (!this.paused) {
            this.entered = true;
            __touch(21455);
        }
        this.paused = false;
        __touch(21454);
    };
    __touch(21437);
    TimelineSystem.prototype.reset = function () {
        this.passive = false;
        __touch(21456);
        this.resetRequest = true;
        __touch(21457);
        this.paused = false;
        __touch(21458);
    };
    __touch(21438);
    return TimelineSystem;
    __touch(21439);
});
__touch(21430);