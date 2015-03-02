define([], function () {
    'use strict';
    __touch(19816);
    function RotationScript() {
        var mouseState, actualState, entity;
        __touch(19820);
        function setup(parameters, env) {
            mouseState = {
                x: 0,
                y: 0
            };
            __touch(19826);
            actualState = {
                x: 0,
                y: 0
            };
            __touch(19827);
            entity = env.entity;
            __touch(19828);
            document.addEventListener('mousemove', onMouseMove);
            __touch(19829);
        }
        __touch(19821);
        function update(parameters) {
            actualState.x += (mouseState.x - actualState.x) * parameters.fraction;
            __touch(19830);
            actualState.y += (mouseState.y - actualState.y) * parameters.fraction;
            __touch(19831);
            entity.setRotation(actualState.y / 200, actualState.x / 200, 0);
            __touch(19832);
        }
        __touch(19822);
        function onMouseMove(e) {
            mouseState.x = e.x;
            __touch(19833);
            mouseState.y = e.y;
            __touch(19834);
        }
        __touch(19823);
        function cleanup() {
            document.removeEventListener('mousemove', onMouseMove);
            __touch(19835);
        }
        __touch(19824);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19825);
    }
    __touch(19817);
    RotationScript.externals = {
        key: 'RotationScript',
        name: 'Mouse Rotation',
        description: '',
        parameters: [{
                key: 'fraction',
                name: 'Speed',
                'default': 0.01,
                type: 'float',
                control: 'slider',
                min: 0.01,
                max: 1
            }]
    };
    __touch(19818);
    return RotationScript;
    __touch(19819);
});
__touch(19815);