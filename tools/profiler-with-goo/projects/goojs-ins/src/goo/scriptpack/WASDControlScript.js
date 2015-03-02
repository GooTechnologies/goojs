define([
    'goo/math/Vector3',
    'goo/scripts/Scripts',
    'goo/scripts/ScriptUtils'
], function (Vector3, Scripts, ScriptUtils) {
    'use strict';
    __touch(20109);
    function WASDControlScript() {
        var entity, transformComponent, transform;
        __touch(20113);
        var _parameters;
        __touch(20114);
        var moveState;
        __touch(20115);
        var fwdVector = new Vector3(0, 0, -1);
        __touch(20116);
        var leftVector = new Vector3(-1, 0, 0);
        __touch(20117);
        var moveVector = new Vector3();
        __touch(20118);
        var calcVector = new Vector3();
        __touch(20119);
        function updateMovementVector() {
            moveVector.x = moveState.strafeLeft - moveState.strafeRight;
            __touch(20128);
            moveVector.z = moveState.forward - moveState.back;
            __touch(20129);
        }
        __touch(20120);
        function keyDown(event) {
            if (event.altKey) {
                return;
                __touch(20131);
            }
            switch (ScriptUtils.keyForCode(event.keyCode)) {
            case _parameters.crawlKey:
                moveState.speed = _parameters.crawlSpeed;
                break;
            case _parameters.forwardKey:
                moveState.forward = 1;
                updateMovementVector();
                break;
            case _parameters.backKey:
                moveState.back = 1;
                updateMovementVector();
                break;
            case _parameters.strafeLeftKey:
                moveState.strafeLeft = 1;
                updateMovementVector();
                break;
            case _parameters.strafeRightKey:
                moveState.strafeRight = 1;
                updateMovementVector();
                break;
            }
            __touch(20130);
        }
        __touch(20121);
        function keyUp(event) {
            if (event.altKey) {
                return;
                __touch(20133);
            }
            switch (ScriptUtils.keyForCode(event.keyCode)) {
            case _parameters.crawlKey:
                moveState.speed = _parameters.walkSpeed;
                break;
            case _parameters.forwardKey:
                moveState.forward = 0;
                updateMovementVector();
                break;
            case _parameters.backKey:
                moveState.back = 0;
                updateMovementVector();
                break;
            case _parameters.strafeLeftKey:
                moveState.strafeLeft = 0;
                updateMovementVector();
                break;
            case _parameters.strafeRightKey:
                moveState.strafeRight = 0;
                updateMovementVector();
                break;
            }
            __touch(20132);
        }
        __touch(20122);
        function setupKeyControls(domElement) {
            domElement.setAttribute('tabindex', -1);
            __touch(20134);
            domElement.addEventListener('keydown', keyDown, false);
            __touch(20135);
            domElement.addEventListener('keyup', keyUp, false);
            __touch(20136);
        }
        __touch(20123);
        function setup(parameters, environment) {
            _parameters = parameters;
            __touch(20137);
            environment.moveState = moveState = {
                strafeLeft: 0,
                strafeRight: 0,
                forward: 0,
                back: 0,
                crawling: false,
                speed: parameters.walkSpeed
            };
            __touch(20138);
            entity = environment.entity;
            __touch(20139);
            transformComponent = entity.transformComponent;
            __touch(20140);
            transform = transformComponent.transform;
            __touch(20141);
            setupKeyControls(environment.domElement);
            __touch(20142);
        }
        __touch(20124);
        function update(parameters, environment) {
            if (moveVector.equals(Vector3.ZERO)) {
                return;
                __touch(20151);
            }
            if (parameters.whenUsed && environment.entity !== environment.activeCameraEntity) {
                return;
                __touch(20152);
            }
            calcVector.set(fwdVector.x * moveVector.z + leftVector.x * moveVector.x, fwdVector.y * moveVector.z + leftVector.y * moveVector.x, fwdVector.z * moveVector.z + leftVector.z * moveVector.x);
            __touch(20143);
            calcVector.normalize();
            __touch(20144);
            var moveMult = environment.world.tpf * moveState.speed;
            __touch(20145);
            calcVector.mul(moveMult);
            __touch(20146);
            var orient = transform.rotation;
            __touch(20147);
            orient.applyPost(calcVector);
            __touch(20148);
            transform.translation.add(calcVector);
            __touch(20149);
            transformComponent.setUpdated();
            __touch(20150);
        }
        __touch(20125);
        function cleanup(parameters, env) {
            env.domElement.removeEventListener('keydown', keyDown, false);
            __touch(20153);
            env.domElement.removeEventListener('keyup', keyUp, false);
            __touch(20154);
        }
        __touch(20126);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(20127);
    }
    __touch(20110);
    WASDControlScript.externals = {
        key: 'WASD',
        name: 'WASD Control',
        description: 'Enables moving via the WASD keys',
        parameters: [
            {
                key: 'whenUsed',
                type: 'boolean',
                name: 'When Camera Used',
                description: 'Script only runs when the camera to which it is added is being used.',
                'default': true
            },
            {
                key: 'crawlKey',
                type: 'string',
                control: 'key',
                'default': 'Shift'
            },
            {
                key: 'forwardKey',
                type: 'string',
                control: 'key',
                'default': 'W'
            },
            {
                key: 'backKey',
                type: 'string',
                control: 'key',
                'default': 'S'
            },
            {
                key: 'strafeLeftKey',
                type: 'string',
                control: 'key',
                'default': 'A'
            },
            {
                key: 'strafeRightKey',
                type: 'string',
                control: 'key',
                'default': 'D'
            },
            {
                key: 'walkSpeed',
                type: 'int',
                control: 'slider',
                'default': 10,
                min: 1,
                max: 100,
                exponential: true
            },
            {
                key: 'crawlSpeed',
                control: 'slider',
                type: 'int',
                'default': 1,
                min: 0.1,
                max: 10,
                exponential: true
            }
        ]
    };
    __touch(20111);
    return WASDControlScript;
    __touch(20112);
});
__touch(20108);