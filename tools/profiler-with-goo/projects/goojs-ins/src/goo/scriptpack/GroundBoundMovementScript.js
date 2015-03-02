define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(19256);
    var calcVec = new Vector3();
    __touch(19257);
    var _defaults = {
        gravity: -9.81,
        worldFloor: -Infinity,
        jumpImpulse: 95,
        accLerp: 0.1,
        rotLerp: 0.1,
        modForward: 1,
        modStrafe: 0.7,
        modBack: 0.4,
        modTurn: 0.3
    };
    __touch(19258);
    function GroundBoundMovementScript(properties) {
        properties = properties || {};
        __touch(19282);
        for (var key in _defaults) {
            if (typeof _defaults[key] === 'boolean') {
                this[key] = properties[key] !== undefined ? properties[key] === true : _defaults[key];
                __touch(19292);
            } else if (!isNaN(_defaults[key])) {
                this[key] = !isNaN(properties[key]) ? properties[key] : _defaults[key];
                __touch(19293);
            } else if (_defaults[key] instanceof Vector3) {
                this[key] = properties[key] ? new Vector3(properties[key]) : new Vector3().set(_defaults[key]);
                __touch(19294);
            } else {
                this[key] = properties[key] || _defaults[key];
                __touch(19295);
            }
        }
        __touch(19283);
        this.groundContact = 1;
        __touch(19284);
        this.targetVelocity = new Vector3();
        __touch(19285);
        this.targetHeading = new Vector3();
        __touch(19286);
        this.acceleration = new Vector3();
        __touch(19287);
        this.torque = new Vector3();
        __touch(19288);
        this.groundHeight = 0;
        __touch(19289);
        this.groundNormal = new Vector3();
        __touch(19290);
        this.controlState = {
            run: 0,
            strafe: 0,
            jump: 0,
            yaw: 0,
            roll: 0,
            pitch: 0
        };
        __touch(19291);
    }
    __touch(19259);
    GroundBoundMovementScript.prototype.setTerrainSystem = function (terrainScript) {
        this.terrainScript = terrainScript;
        __touch(19296);
    };
    __touch(19260);
    GroundBoundMovementScript.prototype.getTerrainSystem = function () {
        return this.terrainScript;
        __touch(19297);
    };
    __touch(19261);
    GroundBoundMovementScript.prototype.getTerrainHeight = function (translation) {
        var height = this.getTerrainSystem().getTerrainHeightAt(translation.data);
        __touch(19298);
        if (height === null) {
            height = this.worldFloor;
            __touch(19300);
        }
        return height;
        __touch(19299);
    };
    __touch(19262);
    GroundBoundMovementScript.prototype.getTerrainNormal = function (translation) {
        return this.getTerrainSystem().getTerrainNormalAt(translation.data);
        __touch(19301);
    };
    __touch(19263);
    GroundBoundMovementScript.prototype.applyForward = function (amount) {
        this.controlState.run = amount;
        __touch(19302);
    };
    __touch(19264);
    GroundBoundMovementScript.prototype.applyStrafe = function (amount) {
        this.controlState.strafe = amount;
        __touch(19303);
    };
    __touch(19265);
    GroundBoundMovementScript.prototype.applyJump = function (amount) {
        this.controlState.jump = amount;
        __touch(19304);
    };
    __touch(19266);
    GroundBoundMovementScript.prototype.applyTurn = function (amount) {
        this.controlState.yaw = amount;
        __touch(19305);
    };
    __touch(19267);
    GroundBoundMovementScript.prototype.applyJumpImpulse = function (up) {
        if (this.groundContact) {
            if (this.controlState.jump) {
                up = this.jumpImpulse;
                __touch(19307);
                this.controlState.jump = 0;
                __touch(19308);
            } else {
                up = 0;
                __touch(19309);
            }
        }
        return up;
        __touch(19306);
    };
    __touch(19268);
    GroundBoundMovementScript.prototype.applyDirectionalModulation = function (strafe, up, run) {
        strafe *= this.modStrafe;
        __touch(19310);
        if (run > 0) {
            run *= this.modForward;
            __touch(19312);
        } else {
            run *= this.modBack;
            __touch(19313);
        }
        this.targetVelocity.set(strafe, this.applyJumpImpulse(up), run);
        __touch(19311);
    };
    __touch(19269);
    GroundBoundMovementScript.prototype.applyTorqueModulation = function (pitch, yaw, roll) {
        this.targetHeading.set(pitch, yaw * this.modTurn, roll);
        __touch(19314);
    };
    __touch(19270);
    GroundBoundMovementScript.prototype.applyGroundNormalInfluence = function () {
        var groundModX = Math.abs(Math.cos(this.groundNormal.data[0]));
        __touch(19315);
        var groundModZ = Math.abs(Math.cos(this.groundNormal.data[2]));
        __touch(19316);
        this.targetVelocity.data[0] *= groundModX;
        __touch(19317);
        this.targetVelocity.data[2] *= groundModZ;
        __touch(19318);
    };
    __touch(19271);
    GroundBoundMovementScript.prototype.updateTargetVectors = function (transform) {
        this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run);
        __touch(19319);
        transform.rotation.applyPost(this.targetVelocity);
        __touch(19320);
        this.applyGroundNormalInfluence();
        __touch(19321);
        this.applyTorqueModulation(this.controlState.pitch, this.controlState.yaw, this.controlState.roll);
        __touch(19322);
    };
    __touch(19272);
    GroundBoundMovementScript.prototype.computeAcceleration = function (entity, current, target) {
        calcVec.set(target);
        __touch(19323);
        entity.transformComponent.transform.rotation.applyPost(calcVec);
        __touch(19324);
        calcVec.sub(current);
        __touch(19325);
        calcVec.lerp(target, this.accLerp);
        __touch(19326);
        calcVec.data[1] = target.data[1];
        __touch(19327);
        return calcVec;
        __touch(19328);
    };
    __touch(19273);
    GroundBoundMovementScript.prototype.computeTorque = function (current, target) {
        calcVec.set(target);
        __touch(19329);
        calcVec.sub(current);
        __touch(19330);
        calcVec.lerp(target, this.rotLerp);
        __touch(19331);
        return calcVec;
        __touch(19332);
    };
    __touch(19274);
    GroundBoundMovementScript.prototype.updateVelocities = function (entity) {
        var currentVelocity = entity.movementComponent.getVelocity();
        __touch(19333);
        var currentRotVel = entity.movementComponent.getRotationVelocity();
        __touch(19334);
        this.acceleration.set(this.computeAcceleration(entity, currentVelocity, this.targetVelocity));
        __touch(19335);
        this.torque.set(this.computeTorque(currentRotVel, this.targetHeading));
        __touch(19336);
    };
    __touch(19275);
    GroundBoundMovementScript.prototype.applyAccelerations = function (entity) {
        entity.movementComponent.addVelocity(this.acceleration);
        __touch(19337);
        entity.movementComponent.addRotationVelocity(this.torque);
        __touch(19338);
    };
    __touch(19276);
    GroundBoundMovementScript.prototype.updateGroundNormal = function (transform) {
        this.groundNormal.set(this.getTerrainNormal(transform.translation));
        __touch(19339);
    };
    __touch(19277);
    GroundBoundMovementScript.prototype.checkGroundContact = function (entity, transform) {
        this.groundHeight = this.getTerrainHeight(transform.translation);
        __touch(19340);
        if (transform.translation.data[1] <= this.groundHeight) {
            this.groundContact = 1;
            __touch(19341);
            this.updateGroundNormal(transform);
            __touch(19342);
        } else {
            this.groundContact = 0;
            __touch(19343);
        }
    };
    __touch(19278);
    GroundBoundMovementScript.prototype.applyGroundContact = function (entity, transform) {
        if (this.groundHeight >= transform.translation.data[1]) {
            transform.translation.data[1] = this.groundHeight;
            __touch(19344);
            if (entity.movementComponent.velocity.data[1] < 0) {
                entity.movementComponent.velocity.data[1] = 0;
                __touch(19345);
            }
        }
    };
    __touch(19279);
    GroundBoundMovementScript.prototype.run = function (entity) {
        var transform = entity.transformComponent.transform;
        __touch(19346);
        this.checkGroundContact(entity, transform);
        __touch(19347);
        this.updateTargetVectors(transform);
        __touch(19348);
        this.updateVelocities(entity);
        __touch(19349);
        this.applyAccelerations(entity);
        __touch(19350);
        this.applyGroundContact(entity, transform);
        __touch(19351);
    };
    __touch(19280);
    return GroundBoundMovementScript;
    __touch(19281);
});
__touch(19255);