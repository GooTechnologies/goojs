define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/EntityUtils'
], function (Action, EntityUtils) {
    'use strict';
    __touch(7063);
    function RemoveParticlesAction() {
        Action.apply(this, arguments);
        __touch(7070);
    }
    __touch(7064);
    RemoveParticlesAction.prototype = Object.create(Action.prototype);
    __touch(7065);
    RemoveParticlesAction.prototype.constructor = RemoveParticlesAction;
    __touch(7066);
    RemoveParticlesAction.external = {
        name: 'Remove Particles',
        type: 'fx',
        description: 'Removes any particle emitter attached to the entity',
        parameters: [],
        transitions: []
    };
    __touch(7067);
    RemoveParticlesAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7071);
        entity.children().each(function (child) {
            if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
                child.removeFromWorld();
                __touch(7073);
            }
        });
        __touch(7072);
    };
    __touch(7068);
    return RemoveParticlesAction;
    __touch(7069);
});
__touch(7062);