define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6688);
    function InBoxAction() {
        Action.apply(this, arguments);
        __touch(6696);
    }
    __touch(6689);
    InBoxAction.prototype = Object.create(Action.prototype);
    __touch(6690);
    InBoxAction.prototype.constructor = InBoxAction;
    __touch(6691);
    InBoxAction.external = {
        name: 'In Box',
        type: 'collision',
        description: 'Performs a transition based on whether an entity is inside a user defined box volume or not.' + 'The volume is defined by setting two points which, when connected, form a diagonal through the box volume.',
        canTransition: true,
        parameters: [
            {
                name: 'Point1',
                key: 'point1',
                type: 'position',
                description: 'First box point',
                'default': [
                    -1,
                    -1,
                    -1
                ]
            },
            {
                name: 'Point2',
                key: 'point2',
                type: 'position',
                description: 'Second box point',
                'default': [
                    1,
                    1,
                    1
                ]
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': true
            }
        ],
        transitions: [
            {
                key: 'inside',
                name: 'Inside',
                description: 'State to transition to if the entity is inside the box'
            },
            {
                key: 'outside',
                name: 'Outside',
                description: 'State to transition to if the entity is outside the box'
            }
        ]
    };
    __touch(6692);
    function checkInside(pos, pt1, pt2) {
        var inside = false;
        __touch(6697);
        var inOnAxis = function (pos, pt1, pt2) {
            if (pt1 > pt2) {
                if (pos < pt1 && pos > pt2) {
                    return true;
                    __touch(6704);
                }
            } else if (pt2 > pt1) {
                if (pos < pt2 && pos > pt1) {
                    return true;
                    __touch(6705);
                }
            } else {
                if (pos === pt2) {
                    return true;
                    __touch(6706);
                }
            }
            return false;
            __touch(6703);
        };
        __touch(6698);
        var isInsideX = inOnAxis(pos[0], pt1[0], pt2[0]);
        __touch(6699);
        var isInsideY = inOnAxis(pos[1], pt1[1], pt2[1]);
        __touch(6700);
        var isInsideZ = inOnAxis(pos[2], pt1[2], pt2[2]);
        __touch(6701);
        if (isInsideX && isInsideY && isInsideZ) {
            inside = true;
            __touch(6707);
        }
        return inside;
        __touch(6702);
    }
    __touch(6693);
    InBoxAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6708);
        var translation = entity.transformComponent.worldTransform.translation;
        __touch(6709);
        var inside = checkInside(translation.data, this.point1, this.point2);
        __touch(6710);
        if (inside) {
            fsm.send(this.transitions.inside);
            __touch(6711);
        } else {
            fsm.send(this.transitions.outside);
            __touch(6712);
        }
    };
    __touch(6694);
    return InBoxAction;
    __touch(6695);
});
__touch(6687);