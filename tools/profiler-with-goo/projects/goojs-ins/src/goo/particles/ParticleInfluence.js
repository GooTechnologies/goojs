define(function () {
    'use strict';
    __touch(14305);
    function ParticleInfluence(settings) {
        settings = settings || {};
        __touch(14308);
        this.prepare = settings.prepare ? settings.prepare : function () {
        };
        __touch(14309);
        this.apply = settings.apply ? settings.apply : function () {
        };
        __touch(14310);
        this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
        __touch(14311);
    }
    __touch(14306);
    return ParticleInfluence;
    __touch(14307);
});
__touch(14304);