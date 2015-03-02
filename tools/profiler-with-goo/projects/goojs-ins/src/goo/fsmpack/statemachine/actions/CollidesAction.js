define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/fsmpack/proximity/ProximitySystem'
], function (Action, ProximitySystem) {
    'use strict';
    __touch(6435);
    function CollidesAction() {
        Action.apply(this, arguments);
        __touch(6443);
        this.everyFrame = true;
        __touch(6444);
    }
    __touch(6436);
    CollidesAction.prototype = Object.create(Action.prototype);
    __touch(6437);
    CollidesAction.prototype.constructor = CollidesAction;
    __touch(6438);
    CollidesAction.external = {
        key: 'Collides',
        name: 'Collision',
        type: 'collision',
        description: 'Checks for collisions or non-collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag objects using the \'Tag\' action.',
        canTransition: true,
        parameters: [{
                name: 'Tag',
                key: 'tag',
                type: 'string',
                control: 'dropdown',
                description: 'Checks for collisions with other objects having this tag',
                'default': 'red',
                options: [
                    'red',
                    'blue',
                    'green',
                    'yellow'
                ]
            }],
        transitions: [
            {
                key: 'collides',
                name: 'On Collision',
                description: 'State to transition to when a collision occurs'
            },
            {
                key: 'notCollides',
                name: 'On Divergence',
                description: 'State to transition to when a collision is not occurring'
            }
        ]
    };
    __touch(6439);
    CollidesAction.prototype.ready = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6445);
        var world = entity._world;
        __touch(6446);
        if (!world.getSystem('ProximitySystem')) {
            world.setSystem(new ProximitySystem());
            __touch(6447);
        }
    };
    __touch(6440);
    CollidesAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6448);
        var world = entity._world;
        __touch(6449);
        var proximitySystem = world.getSystem('ProximitySystem');
        __touch(6450);
        var collection = proximitySystem.getFor(this.tag);
        __touch(6451);
        var collides = false;
        __touch(6452);
        entity.traverse(function (entity) {
            var worldBound;
            __touch(6454);
            if (entity.meshRendererComponent && !entity.particleComponent) {
                worldBound = entity.meshRendererComponent.worldBound;
                __touch(6455);
                for (var i = 0; i < collection.length; i++) {
                    collection[i].traverse(function (entity) {
                        if (entity.meshRendererComponent && entity.meshRendererComponent.worldBound && !entity.particleComponent && worldBound.intersects(entity.meshRendererComponent.worldBound)) {
                            collides = true;
                            __touch(6457);
                            return false;
                            __touch(6458);
                        }
                    });
                    __touch(6456);
                    if (collides) {
                        return false;
                        __touch(6459);
                    }
                }
            }
        });
        __touch(6453);
        if (collides) {
            fsm.send(this.transitions.collides);
            __touch(6460);
        } else {
            fsm.send(this.transitions.notCollides);
            __touch(6461);
        }
    };
    __touch(6441);
    return CollidesAction;
    __touch(6442);
});
__touch(6434);