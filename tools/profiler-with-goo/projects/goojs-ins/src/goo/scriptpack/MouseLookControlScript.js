define([
    'goo/scripts/Scripts',
    'goo/math/Vector3',
    'goo/math/MathUtils',
    'goo/util/GameUtils'
], function (Scripts, Vector3, MathUtils, GameUtils) {
    'use strict';
    __touch(19521);
    function MouseLookControlScript() {
        var buttonPressed = false;
        __touch(19525);
        var lastX = 0, lastY = 0, x = 0, y = 0;
        __touch(19526);
        var angles;
        __touch(19527);
        var button;
        __touch(19528);
        var _environment;
        __touch(19529);
        var _parameters;
        __touch(19530);
        var _initialAzimuth;
        __touch(19531);
        function mouseDown(e) {
            if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
                if (button === -1 || e.button === button) {
                    buttonPressed = true;
                    __touch(19541);
                    lastX = x = e.clientX;
                    __touch(19542);
                    lastY = y = e.clientY;
                    __touch(19543);
                }
            }
        }
        __touch(19532);
        function mouseDown2() {
            if (!document.pointerLockElement) {
                GameUtils.requestPointerLock();
                __touch(19544);
            }
        }
        __touch(19533);
        function mouseMove(e) {
            if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
                if (buttonPressed) {
                    if (e.movementX !== undefined) {
                        x += e.movementX;
                        __touch(19545);
                        y += e.movementY;
                        __touch(19546);
                    } else {
                        x = e.clientX;
                        __touch(19547);
                        y = e.clientY;
                        __touch(19548);
                    }
                }
            }
        }
        __touch(19534);
        function mouseUp() {
            buttonPressed = false;
            __touch(19549);
        }
        __touch(19535);
        function pointerLockChange() {
            buttonPressed = !!document.pointerLockElement;
            __touch(19550);
            if (document.pointerLockElement) {
                _environment.domElement.removeEventListener('mousedown', mouseDown2);
                __touch(19551);
            } else {
                _environment.domElement.addEventListener('mousedown', mouseDown2);
                __touch(19552);
            }
        }
        __touch(19536);
        function setup(parameters, environment) {
            _environment = environment;
            __touch(19553);
            _parameters = parameters;
            __touch(19554);
            button = [
                'Any',
                'Left',
                'Middle',
                'Right',
                'None'
            ].indexOf(parameters.button) - 1;
            __touch(19555);
            if (button < -1) {
                button = -1;
                __touch(19561);
            }
            var domElement = environment.domElement;
            __touch(19556);
            if (button === 3) {
                document.addEventListener('pointerlockchange', pointerLockChange);
                __touch(19562);
                document.addEventListener('mousemove', mouseMove);
                __touch(19563);
                domElement.addEventListener('mousedown', mouseDown2);
                __touch(19564);
                GameUtils.requestPointerLock();
                __touch(19565);
            } else {
                domElement.addEventListener('mousedown', mouseDown);
                __touch(19566);
                domElement.addEventListener('mouseup', mouseUp);
                __touch(19567);
                domElement.addEventListener('mouseleave', mouseUp);
                __touch(19568);
                domElement.addEventListener('mousemove', mouseMove);
                __touch(19569);
            }
            angles = new Vector3();
            __touch(19557);
            var rotation = environment.entity.transformComponent.transform.rotation;
            __touch(19558);
            rotation.toAngles(angles);
            __touch(19559);
            _initialAzimuth = angles.data[1];
            __touch(19560);
        }
        __touch(19537);
        function update(parameters, environment) {
            if (x === lastX && y === lastY) {
                return;
                __touch(19587);
            }
            var deltaX = x - lastX;
            __touch(19570);
            var deltaY = y - lastY;
            __touch(19571);
            var entity = environment.entity;
            __touch(19572);
            var rotation = entity.transformComponent.transform.rotation;
            __touch(19573);
            rotation.toAngles(angles);
            __touch(19574);
            var pitch = angles.data[0];
            __touch(19575);
            var yaw = angles.data[1];
            __touch(19576);
            var maxAscent = parameters.maxAscent * MathUtils.DEG_TO_RAD;
            __touch(19577);
            var minAscent = parameters.minAscent * MathUtils.DEG_TO_RAD;
            __touch(19578);
            pitch = MathUtils.clamp(pitch - deltaY * parameters.speed / 200, minAscent, maxAscent);
            __touch(19579);
            var maxAzimuth = parameters.maxAzimuth * MathUtils.DEG_TO_RAD - _initialAzimuth;
            __touch(19580);
            var minAzimuth = parameters.minAzimuth * MathUtils.DEG_TO_RAD - _initialAzimuth;
            __touch(19581);
            yaw -= deltaX * parameters.speed / 200;
            __touch(19582);
            if (parameters.clampAzimuth) {
                yaw = MathUtils.radialClamp(yaw, minAzimuth, maxAzimuth);
                __touch(19588);
            }
            rotation.fromAngles(pitch, yaw, 0);
            __touch(19583);
            entity.transformComponent.setUpdated();
            __touch(19584);
            lastX = x;
            __touch(19585);
            lastY = y;
            __touch(19586);
        }
        __touch(19538);
        function cleanup(parameters, environment) {
            var domElement = environment.domElement;
            __touch(19589);
            if (button === 3) {
                GameUtils.exitPointerLock();
                __touch(19590);
                document.removeEventListener('mousemove', mouseMove);
                __touch(19591);
                domElement.removeEventListener('mousedown', mouseDown2);
                __touch(19592);
                document.removeEventListener('pointerlockchange', pointerLockChange);
                __touch(19593);
            } else {
                domElement.removeEventListener('mousemove', mouseMove);
                __touch(19594);
                domElement.removeEventListener('mousedown', mouseDown);
                __touch(19595);
                domElement.removeEventListener('mouseup', mouseUp);
                __touch(19596);
                domElement.removeEventListener('mouseleave', mouseUp);
                __touch(19597);
            }
        }
        __touch(19539);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19540);
    }
    __touch(19522);
    MouseLookControlScript.externals = {
        key: 'MouseLookScript',
        name: 'Mouse Look Control',
        description: 'Click and drag to change rotation of entity, usually a camera',
        parameters: [
            {
                key: 'whenUsed',
                type: 'boolean',
                name: 'When Camera Used',
                description: 'Script only runs when the camera to which it is added is being used.',
                'default': true
            },
            {
                key: 'button',
                name: 'Mouse button',
                type: 'string',
                control: 'select',
                'default': 'Left',
                options: [
                    'Any',
                    'Left',
                    'Middle',
                    'Right',
                    'None'
                ]
            },
            {
                key: 'speed',
                name: 'Turn Speed',
                type: 'float',
                control: 'slider',
                'default': 1,
                min: -10,
                max: 10,
                scale: 0.1
            },
            {
                key: 'maxAscent',
                name: 'Max Ascent',
                type: 'float',
                control: 'slider',
                'default': 89.95,
                min: -89.95,
                max: 89.95
            },
            {
                key: 'minAscent',
                name: 'Min Ascent',
                type: 'float',
                control: 'slider',
                'default': -89.95,
                min: -89.95,
                max: 89.95
            },
            {
                key: 'clampAzimuth',
                'default': false,
                type: 'boolean'
            },
            {
                key: 'minAzimuth',
                description: 'Maximum arc the camera can reach clockwise of the target point',
                'default': -90,
                type: 'int',
                control: 'slider',
                min: -180,
                max: 0
            },
            {
                key: 'maxAzimuth',
                description: 'Maximum arc the camera can reach counter-clockwise of the target point',
                'default': 90,
                type: 'int',
                control: 'slider',
                min: 0,
                max: 180
            }
        ]
    };
    __touch(19523);
    return MouseLookControlScript;
    __touch(19524);
});
__touch(19520);