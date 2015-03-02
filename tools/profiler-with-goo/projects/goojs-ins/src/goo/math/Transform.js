define([
    'goo/math/Vector3',
    'goo/math/Matrix3x3',
    'goo/math/Matrix4x4'
], function (Vector3, Matrix3x3, Matrix4x4) {
    'use strict';
    __touch(12210);
    function Transform() {
        this.matrix = new Matrix4x4();
        __touch(12228);
        this.normalMatrix = new Matrix4x4();
        __touch(12229);
        this.translation = new Vector3();
        __touch(12230);
        this.rotation = new Matrix3x3();
        __touch(12231);
        this.scale = new Vector3(1, 1, 1);
        __touch(12232);
    }
    __touch(12211);
    var tmpVec = new Vector3();
    __touch(12212);
    var tmpVec2 = new Vector3();
    __touch(12213);
    var tmpMat1 = new Matrix3x3();
    __touch(12214);
    Transform.combine = function (lhs, rhs, target) {
        target = target || new Transform();
        __touch(12233);
        tmpVec.setv(rhs.translation);
        __touch(12234);
        lhs.rotation.applyPost(tmpVec);
        __touch(12235);
        tmpVec.mulv(lhs.scale);
        __touch(12236);
        tmpVec.addv(lhs.translation);
        __touch(12237);
        tmpVec2.setv(rhs.scale);
        __touch(12238);
        tmpVec2.mulv(lhs.scale);
        __touch(12239);
        Matrix3x3.combine(lhs.rotation, rhs.rotation, tmpMat1);
        __touch(12240);
        target.rotation.copy(tmpMat1);
        __touch(12241);
        target.scale.setv(tmpVec2);
        __touch(12242);
        target.translation.setv(tmpVec);
        __touch(12243);
        target.update();
        __touch(12244);
        return target;
        __touch(12245);
    };
    __touch(12215);
    Transform.prototype.combine = function (rhs) {
        return Transform.combine(this, rhs, this);
        __touch(12246);
    };
    __touch(12216);
    Transform.prototype.multiply = function (a, b) {
        Matrix4x4.combine(a.matrix, b.matrix, this.matrix);
        __touch(12247);
        tmpMat1.data.set(a.rotation.data);
        __touch(12248);
        this.rotation.data.set(b.rotation.data);
        __touch(12249);
        Matrix3x3.combine(tmpMat1, this.rotation, this.rotation);
        __touch(12250);
        this.translation.setv(b.translation);
        __touch(12251);
        this.translation.mulv(a.scale);
        __touch(12252);
        tmpMat1.applyPost(this.translation).addv(a.translation);
        __touch(12253);
        tmpVec.setv(a.scale).mulv(b.scale);
        __touch(12254);
        this.scale.setv(tmpVec);
        __touch(12255);
    };
    __touch(12217);
    Transform.prototype.setIdentity = function () {
        this.matrix.setIdentity();
        __touch(12256);
        this.translation.setv(Vector3.ZERO);
        __touch(12257);
        this.rotation.setIdentity();
        __touch(12258);
        this.scale.setv(Vector3.ONE);
        __touch(12259);
    };
    __touch(12218);
    Transform.prototype.applyForward = function (point, store) {
        store.setv(point);
        __touch(12260);
        this.matrix.applyPostPoint(store);
        __touch(12261);
        return store;
        __touch(12262);
    };
    __touch(12219);
    Transform.prototype.applyForwardVector = function (vector, store) {
        store.copy(vector);
        __touch(12263);
        store.set(store.x * this.scale.x, store.y * this.scale.y, store.z * this.scale.z);
        __touch(12264);
        this.rotation.applyPost(store);
        __touch(12265);
        return store;
        __touch(12266);
    };
    __touch(12220);
    Transform.prototype.update = function () {
        var target = this.matrix.data;
        __touch(12267);
        var rotation = this.rotation.data;
        __touch(12268);
        var scale = this.scale.data;
        __touch(12269);
        var translation = this.translation.data;
        __touch(12270);
        target[0] = scale[0] * rotation[0];
        __touch(12271);
        target[1] = scale[0] * rotation[1];
        __touch(12272);
        target[2] = scale[0] * rotation[2];
        __touch(12273);
        target[3] = 0;
        __touch(12274);
        target[4] = scale[1] * rotation[3];
        __touch(12275);
        target[5] = scale[1] * rotation[4];
        __touch(12276);
        target[6] = scale[1] * rotation[5];
        __touch(12277);
        target[7] = 0;
        __touch(12278);
        target[8] = scale[2] * rotation[6];
        __touch(12279);
        target[9] = scale[2] * rotation[7];
        __touch(12280);
        target[10] = scale[2] * rotation[8];
        __touch(12281);
        target[11] = 0;
        __touch(12282);
        target[12] = translation[0];
        __touch(12283);
        target[13] = translation[1];
        __touch(12284);
        target[14] = translation[2];
        __touch(12285);
        target[15] = 1;
        __touch(12286);
    };
    __touch(12221);
    Transform.prototype.copy = function (transform) {
        this.matrix.copy(transform.matrix);
        __touch(12287);
        this.translation.setv(transform.translation);
        __touch(12288);
        this.rotation.copy(transform.rotation);
        __touch(12289);
        this.scale.setv(transform.scale);
        __touch(12290);
    };
    __touch(12222);
    Transform.prototype.setRotationXYZ = function (x, y, z) {
        this.rotation.fromAngles(x, y, z);
        __touch(12291);
    };
    __touch(12223);
    Transform.prototype.lookAt = function (position, up) {
        if (!up) {
            up = Vector3.UNIT_Y;
            __touch(12294);
        }
        tmpVec.setv(position).subv(this.translation).normalize();
        __touch(12292);
        this.rotation.lookAt(tmpVec, up);
        __touch(12293);
    };
    __touch(12224);
    Transform.prototype.invert = function (store) {
        var result = store;
        __touch(12295);
        if (!result) {
            result = new Transform();
            __touch(12304);
        }
        result.matrix.copy(this.matrix);
        __touch(12296);
        result.matrix.invert();
        __touch(12297);
        var newRotation = result.rotation.copy(this.rotation);
        __touch(12298);
        newRotation.transpose();
        __touch(12299);
        result.scale.setv(Vector3.ONE).div(this.scale);
        __touch(12300);
        result.translation.copy(this.translation).invert().mulv(result.scale);
        __touch(12301);
        result.rotation.applyPost(result.translation);
        __touch(12302);
        return result;
        __touch(12303);
    };
    __touch(12225);
    Transform.prototype.toString = function () {
        return '' + this.matrix;
        __touch(12305);
    };
    __touch(12226);
    return Transform;
    __touch(12227);
});
__touch(12209);