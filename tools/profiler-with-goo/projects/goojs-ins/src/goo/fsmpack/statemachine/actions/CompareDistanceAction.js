define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/math/Vector3',
    'goo/renderer/Renderer'
], function (Action, Vector3, Renderer) {
    'use strict';
    __touch(6463);
    function CompareDistanceAction() {
        Action.apply(this, arguments);
        __touch(6470);
    }
    __touch(6464);
    CompareDistanceAction.prototype = Object.create(Action.prototype);
    __touch(6465);
    CompareDistanceAction.prototype.constructor = CompareDistanceAction;
    __touch(6466);
    CompareDistanceAction.external = {
        key: 'Compare Distance',
        name: 'Camera Distance',
        type: 'collision',
        description: 'Performs a transition based on the distance to the main camera or to a location',
        canTransition: true,
        parameters: [
            {
                name: 'Current camera',
                key: 'camera',
                type: 'boolean',
                description: 'Measure the distance to the current camera or to an arbitrary point',
                'default': true
            },
            {
                name: 'Position',
                key: 'position',
                type: 'position',
                description: 'Position to measure the distance to; Will be ignored if previous option is selected',
                'default': [
                    0,
                    0,
                    0
                ]
            },
            {
                name: 'Value',
                key: 'value',
                type: 'number',
                description: 'Value to compare to',
                'default': 0
            },
            {
                name: 'Tolerance',
                key: 'tolerance',
                type: 'number',
                'default': 0.1
            },
            {
                name: 'Type',
                key: 'distanceType',
                type: 'string',
                control: 'dropdown',
                description: 'The type of distance',
                'default': 'Euclidean',
                options: [
                    'Euclidean',
                    'Manhattan'
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
                key: 'less',
                name: 'Less',
                description: 'State to transition to if the measured distance is smaller than the specified value'
            },
            {
                key: 'equal',
                name: 'Equal',
                description: 'State to transition to if the measured distance is about the same as the specified value'
            },
            {
                key: 'greater',
                name: 'Greater',
                description: 'State to transition to if the measured distance is greater than the specified value'
            }
        ]
    };
    __touch(6467);
    CompareDistanceAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6471);
        var translation = entity.transformComponent.worldTransform.translation;
        __touch(6472);
        var delta;
        __touch(6473);
        if (this.camera) {
            delta = Vector3.sub(translation, Renderer.mainCamera.translation);
            __touch(6476);
        } else {
            delta = Vector3.sub(translation, new Vector3(this.position));
            __touch(6477);
        }
        var distance;
        __touch(6474);
        if (this.type === 'Euclidean') {
            distance = delta.length();
            __touch(6478);
        } else {
            distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
            __touch(6479);
        }
        var diff = this.value - distance;
        __touch(6475);
        if (Math.abs(diff) <= this.tolerance) {
            fsm.send(this.transitions.equal);
            __touch(6480);
        } else if (diff > 0) {
            fsm.send(this.transitions.less);
            __touch(6481);
        } else {
            fsm.send(this.transitions.greater);
            __touch(6482);
        }
    };
    __touch(6468);
    return CompareDistanceAction;
    __touch(6469);
});
__touch(6462);