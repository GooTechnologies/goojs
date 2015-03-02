define([
    'goo/entities/systems/System',
    'goo/entities/World'
], function (System, World) {
    'use strict';
    __touch(3153);
    function AnimationSystem() {
        System.call(this, 'AnimationSystem', ['AnimationComponent']);
        __touch(3161);
    }
    __touch(3154);
    AnimationSystem.prototype = Object.create(System.prototype);
    __touch(3155);
    AnimationSystem.prototype.process = function () {
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(3162);
            var animationComponent = entity.animationComponent;
            __touch(3163);
            animationComponent.update(World.time);
            __touch(3164);
            animationComponent.apply(entity.transformComponent);
            __touch(3165);
            animationComponent.postUpdate();
            __touch(3166);
        }
    };
    __touch(3156);
    AnimationSystem.prototype.pause = function () {
        this.passive = true;
        __touch(3167);
        for (var i = 0; i < this._activeEntities.length; i++) {
            this._activeEntities[i].animationComponent.pause();
            __touch(3168);
        }
    };
    __touch(3157);
    AnimationSystem.prototype.stop = function () {
        this.passive = true;
        __touch(3169);
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(3170);
            entity.animationComponent.stop();
            __touch(3171);
        }
    };
    __touch(3158);
    AnimationSystem.prototype.resume = function () {
        this.passive = false;
        __touch(3172);
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(3173);
            entity.animationComponent.resume();
            __touch(3174);
        }
    };
    __touch(3159);
    return AnimationSystem;
    __touch(3160);
});
__touch(3152);