define([
    'goo/math/Vector3',
    'goo/math/Matrix3x3'
], function (Vector3, Matrix3x3) {
    'use strict';
    __touch(18948);
    function BasicControlScript(properties) {
        properties = properties || {};
        __touch(18954);
        this.domElement = properties.domElement === undefined ? null : properties.domElement.domElement || properties.domElement;
        __touch(18955);
        this.name = 'BasicControlScript';
        __touch(18956);
        this.movementSpeed = 10;
        __touch(18957);
        this.rollSpeed = 2;
        __touch(18958);
        this.movementSpeedMultiplier = 1;
        __touch(18959);
        this.mouseStatus = 0;
        __touch(18960);
        this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
        __touch(18961);
        this.moveVector = new Vector3(0, 0, 0);
        __touch(18962);
        this.rotationVector = new Vector3(0, 0, 0);
        __touch(18963);
        this.multiplier = new Vector3(1, 1, 1);
        __touch(18964);
        this.rotationMatrix = new Matrix3x3();
        __touch(18965);
        this.tmpVec = new Vector3();
        __touch(18966);
        this.handleEvent = function (event) {
            if (typeof this[event.type] === 'function') {
                this[event.type](event);
                __touch(18978);
            }
        };
        __touch(18967);
        this.keydown = function (event) {
            if (event.altKey) {
                return;
                __touch(18982);
            }
            switch (event.keyCode) {
            case 16:
                this.movementSpeedMultiplier = 0.1;
                break;
            case 87:
                this.moveState.forward = 1;
                break;
            case 83:
                this.moveState.back = 1;
                break;
            case 65:
                this.moveState.left = 1;
                break;
            case 68:
                this.moveState.right = 1;
                break;
            case 82:
                this.moveState.up = 1;
                break;
            case 70:
                this.moveState.down = 1;
                break;
            case 38:
                this.moveState.pitchUp = 1;
                break;
            case 40:
                this.moveState.pitchDown = 1;
                break;
            case 37:
                this.moveState.yawLeft = 1;
                break;
            case 39:
                this.moveState.yawRight = 1;
                break;
            case 81:
                this.moveState.rollLeft = 1;
                break;
            case 69:
                this.moveState.rollRight = 1;
                break;
            }
            __touch(18979);
            this.updateMovementVector();
            __touch(18980);
            this.updateRotationVector();
            __touch(18981);
        };
        __touch(18968);
        this.keyup = function (event) {
            switch (event.keyCode) {
            case 16:
                this.movementSpeedMultiplier = 1;
                break;
            case 87:
                this.moveState.forward = 0;
                break;
            case 83:
                this.moveState.back = 0;
                break;
            case 65:
                this.moveState.left = 0;
                break;
            case 68:
                this.moveState.right = 0;
                break;
            case 82:
                this.moveState.up = 0;
                break;
            case 70:
                this.moveState.down = 0;
                break;
            case 38:
                this.moveState.pitchUp = 0;
                break;
            case 40:
                this.moveState.pitchDown = 0;
                break;
            case 37:
                this.moveState.yawLeft = 0;
                break;
            case 39:
                this.moveState.yawRight = 0;
                break;
            case 81:
                this.moveState.rollLeft = 0;
                break;
            case 69:
                this.moveState.rollRight = 0;
                break;
            }
            __touch(18983);
            this.updateMovementVector();
            __touch(18984);
            this.updateRotationVector();
            __touch(18985);
        };
        __touch(18969);
        this.mousedown = function (event) {
            if (this.domElement !== document) {
                this.domElement.focus();
                __touch(18995);
            }
            event.preventDefault();
            __touch(18986);
            event = event.touches && event.touches.length === 1 ? event.touches[0] : event;
            __touch(18987);
            this.mouseDownX = event.pageX;
            __touch(18988);
            this.mouseDownY = event.pageY;
            __touch(18989);
            this.mouseStatus = 1;
            __touch(18990);
            document.addEventListener('mousemove', this.mousemove, false);
            __touch(18991);
            document.addEventListener('mouseup', this.mouseup, false);
            __touch(18992);
            document.addEventListener('touchmove', this.mousemove, false);
            __touch(18993);
            document.addEventListener('touchend', this.mouseup, false);
            __touch(18994);
        }.bind(this);
        __touch(18970);
        this.mousemove = function (event) {
            if (this.mouseStatus > 0) {
                event = event.touches && event.touches.length === 1 ? event.touches[0] : event;
                __touch(18996);
                this.moveState.yawLeft = event.pageX - this.mouseDownX;
                __touch(18997);
                this.moveState.pitchDown = event.pageY - this.mouseDownY;
                __touch(18998);
                this.updateRotationVector();
                __touch(18999);
                this.mouseDownX = event.pageX;
                __touch(19000);
                this.mouseDownY = event.pageY;
                __touch(19001);
            }
        }.bind(this);
        __touch(18971);
        this.mouseup = function (event) {
            if (!this.mouseStatus) {
                return;
                __touch(19010);
            }
            event.preventDefault();
            __touch(19002);
            this.mouseStatus = 0;
            __touch(19003);
            this.moveState.yawLeft = this.moveState.pitchDown = 0;
            __touch(19004);
            this.updateRotationVector();
            __touch(19005);
            document.removeEventListener('mousemove', this.mousemove);
            __touch(19006);
            document.removeEventListener('mouseup', this.mouseup);
            __touch(19007);
            document.removeEventListener('touchmove', this.mousemove);
            __touch(19008);
            document.removeEventListener('touchend', this.mouseup);
            __touch(19009);
        }.bind(this);
        __touch(18972);
        this.updateMovementVector = function () {
            var forward = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;
            __touch(19011);
            this.moveVector.x = -this.moveState.left + this.moveState.right;
            __touch(19012);
            this.moveVector.y = -this.moveState.down + this.moveState.up;
            __touch(19013);
            this.moveVector.z = -forward + this.moveState.back;
            __touch(19014);
        };
        __touch(18973);
        this.updateRotationVector = function () {
            this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
            __touch(19015);
            this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft;
            __touch(19016);
            this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;
            __touch(19017);
        };
        __touch(18974);
        this.getContainerDimensions = function () {
            if (this.domElement !== document) {
                return {
                    size: [
                        this.domElement.offsetWidth,
                        this.domElement.offsetHeight
                    ],
                    offset: [
                        this.domElement.offsetLeft,
                        this.domElement.offsetTop
                    ]
                };
                __touch(19018);
            } else {
                return {
                    size: [
                        window.innerWidth,
                        window.innerHeight
                    ],
                    offset: [
                        0,
                        0
                    ]
                };
                __touch(19019);
            }
        };
        __touch(18975);
        if (this.domElement) {
            this.setupMouseControls();
            __touch(19020);
        }
        this.updateMovementVector();
        __touch(18976);
        this.updateRotationVector();
        __touch(18977);
    }
    __touch(18949);
    BasicControlScript.prototype.setupMouseControls = function () {
        this.domElement.setAttribute('tabindex', -1);
        __touch(19021);
        this.domElement.addEventListener('mousedown', this.mousedown, false);
        __touch(19022);
        this.domElement.addEventListener('touchstart', this.mousedown, false);
        __touch(19023);
        this.domElement.addEventListener('keydown', this.keydown.bind(this), false);
        __touch(19024);
        this.domElement.addEventListener('keyup', this.keyup.bind(this), false);
        __touch(19025);
    };
    __touch(18950);
    BasicControlScript.prototype.externals = function () {
        return [
            {
                variable: 'movementSpeed',
                type: 'number'
            },
            {
                variable: 'rollSpeed',
                type: 'number'
            }
        ];
        __touch(19026);
    };
    __touch(18951);
    BasicControlScript.prototype.run = function (entity, tpf, env) {
        if (env) {
            if (!this.domElement && env.domElement) {
                this.domElement = env.domElement;
                __touch(19032);
                this.setupMouseControls();
                __touch(19033);
            }
        }
        var transformComponent = entity.transformComponent;
        __touch(19027);
        var transform = transformComponent.transform;
        __touch(19028);
        var delta = entity._world.tpf;
        __touch(19029);
        var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
        __touch(19030);
        var rotMult = delta * this.rollSpeed * this.movementSpeedMultiplier;
        __touch(19031);
        if (!this.moveVector.equals(Vector3.ZERO) || !this.rotationVector.equals(Vector3.ZERO) || this.mouseStatus > 0) {
            transform.translation.x += this.moveVector.x * moveMult;
            __touch(19034);
            transform.translation.y += this.moveVector.y * moveMult;
            __touch(19035);
            transform.translation.z += this.moveVector.z * moveMult;
            __touch(19036);
            this.tmpVec.x += -this.rotationVector.x * rotMult * this.multiplier.x;
            __touch(19037);
            this.tmpVec.y += this.rotationVector.y * rotMult * this.multiplier.y;
            __touch(19038);
            this.tmpVec.z += this.rotationVector.z * rotMult * this.multiplier.z;
            __touch(19039);
            transform.rotation.fromAngles(this.tmpVec.x, this.tmpVec.y, this.tmpVec.z);
            __touch(19040);
            if (this.mouseStatus > 0) {
                this.moveState.yawLeft = 0;
                __touch(19042);
                this.moveState.pitchDown = 0;
                __touch(19043);
                this.updateRotationVector();
                __touch(19044);
            }
            transformComponent.setUpdated();
            __touch(19041);
        }
    };
    __touch(18952);
    return BasicControlScript;
    __touch(18953);
});
__touch(18947);