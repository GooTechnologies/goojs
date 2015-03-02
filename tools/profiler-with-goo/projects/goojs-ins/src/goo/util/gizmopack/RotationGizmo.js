define([
    'goo/util/gizmopack/Gizmo',
    'goo/shapes/Sphere',
    'goo/shapes/Torus',
    'goo/math/Vector3',
    'goo/math/Matrix3x3',
    'goo/math/Transform',
    'goo/renderer/Renderer',
    'goo/math/Ray'
], function (Gizmo, Sphere, Torus, Vector3, Matrix3x3, Transform, Renderer, Ray) {
    'use strict';
    __touch(23017);
    function RotationGizmo() {
        Gizmo.call(this, 'RotationGizmo');
        __touch(23030);
        this._ballMesh = new Sphere(32, 32, 1.1);
        __touch(23031);
        this._torusMesh = new Torus(64, 8, 0.1, 2.5);
        __touch(23032);
        this._buildBall();
        __touch(23033);
        this._buildTorus(0);
        __touch(23034);
        this._buildTorus(1);
        __touch(23035);
        this._buildTorus(2);
        __touch(23036);
        this._rotation = new Matrix3x3();
        __touch(23037);
        this._rotationScale = 4;
        __touch(23038);
        this._axis = new Vector3();
        __touch(23039);
        this._direction = new Vector3();
        __touch(23040);
        this._ray = new Ray();
        __touch(23041);
        this._m1 = new Matrix3x3();
        __touch(23042);
        this._m2 = new Matrix3x3();
        __touch(23043);
        this.snap = false;
        __touch(23044);
        this.accumulatedRotationX = 0;
        __touch(23045);
        this.accumulatedRotationY = 0;
        __touch(23046);
        this.accumulatedRotationThorX = 0;
        __touch(23047);
        this.accumulatedRotationThorY = 0;
        __touch(23048);
        this.accumulatedRotationThorZ = 0;
        __touch(23049);
        this.oldAngleX = 0;
        __touch(23050);
        this.oldAngleY = 0;
        __touch(23051);
        this.oldAngleZ = 0;
        __touch(23052);
    }
    __touch(23018);
    RotationGizmo.prototype = Object.create(Gizmo.prototype);
    __touch(23019);
    RotationGizmo.prototype.activate = function (props) {
        Gizmo.prototype.activate.call(this, props);
        __touch(23053);
        var worldCenter = this._v0, pickedPoint = this._v1, rotationDirection = this._v2, axis = this._axis, ray = this._ray;
        __touch(23054);
        if (this._activeHandle.axis < 3) {
            axis.setv([
                Vector3.UNIT_X,
                Vector3.UNIT_Y,
                Vector3.UNIT_Z
            ][this._activeHandle.axis]);
            __touch(23055);
            this.transform.rotation.applyPost(axis);
            __touch(23056);
            worldCenter.setv(Vector3.ZERO);
            __touch(23057);
            this.transform.matrix.applyPostPoint(worldCenter);
            __touch(23058);
            Renderer.mainCamera.getPickRay(props.x, props.y, 1, 1, ray);
            __touch(23059);
            pickedPoint.setv(ray.origin).subv(worldCenter);
            __touch(23060);
            var d = pickedPoint.length() * 0.9;
            __touch(23061);
            pickedPoint.setv(ray.direction).muld(d, d, d).addv(ray.origin);
            __touch(23062);
            rotationDirection.setv(pickedPoint).subv(worldCenter);
            __touch(23063);
            Vector3.cross(axis, rotationDirection, rotationDirection);
            __touch(23064);
            rotationDirection.addv(pickedPoint);
            __touch(23065);
            Renderer.mainCamera.getScreenCoordinates(rotationDirection, 1, 1, this._direction);
            __touch(23066);
            this._direction.sub_d(props.x, props.y, 0);
            __touch(23067);
            this._direction.z = 0;
            __touch(23068);
            this._direction.normalize();
            __touch(23069);
        }
    };
    __touch(23020);
    RotationGizmo.prototype.process = function () {
        var op = this._mouse.oldPosition;
        __touch(23070);
        var p = this._mouse.position;
        __touch(23071);
        var dx = p[0] - op[0];
        __touch(23072);
        var dy = p[1] - op[1];
        __touch(23073);
        if (this._activeHandle.axis === 3) {
            this._rotateOnScreen(dx, dy);
            __touch(23078);
        } else {
            this._rotateOnAxis(dx, dy);
            __touch(23079);
        }
        op[0] = p[0];
        __touch(23074);
        op[1] = p[1];
        __touch(23075);
        this.updateTransforms();
        __touch(23076);
        this.dirty = false;
        __touch(23077);
        if (this.onChange instanceof Function) {
            this.onChange(this.transform.rotation);
            __touch(23080);
        }
    };
    __touch(23021);
    RotationGizmo.prototype._rotateOnScreen = function (dx, dy) {
        this._rotation.setIdentity();
        __touch(23081);
        if (this.snap && false) {
            this.accumulatedRotationY += dx * this._rotationScale;
            __touch(23089);
            this.accumulatedRotationX += dy * this._rotationScale;
            __touch(23090);
            var angleLimit = Math.PI / 8;
            __touch(23091);
            if (this.accumulatedRotationX > angleLimit) {
                this.accumulatedRotationX -= angleLimit;
                __touch(23092);
                this._rotation.rotateX(angleLimit);
                __touch(23093);
            } else if (this.accumulatedRotationX < 0) {
                this.accumulatedRotationX += angleLimit;
                __touch(23094);
                this._rotation.rotateX(-angleLimit);
                __touch(23095);
            }
            if (this.accumulatedRotationY > angleLimit) {
                this.accumulatedRotationY -= angleLimit;
                __touch(23096);
                this._rotation.rotateY(angleLimit);
                __touch(23097);
            } else if (this.accumulatedRotationY < 0) {
                this.accumulatedRotationY += angleLimit;
                __touch(23098);
                this._rotation.rotateY(-angleLimit);
                __touch(23099);
            }
        } else {
            this._rotation.rotateY(dx * this._rotationScale);
            __touch(23100);
            this._rotation.rotateX(dy * this._rotationScale);
            __touch(23101);
        }
        var camMat = Renderer.mainCamera.getViewMatrix().data;
        __touch(23082);
        var camRotation = this._m1, screenRotation = this._m2;
        __touch(23083);
        camRotation.set(camMat[0], camMat[1], camMat[2], camMat[4], camMat[5], camMat[6], camMat[8], camMat[9], camMat[10]);
        __touch(23084);
        screenRotation.set(camRotation).invert();
        __touch(23085);
        screenRotation.combine(this._rotation);
        __touch(23086);
        screenRotation.combine(camRotation);
        __touch(23087);
        Matrix3x3.combine(screenRotation, this.transform.rotation, this.transform.rotation);
        __touch(23088);
    };
    __touch(23022);
    function inclinedType2(size, t) {
        return function (x) {
            var z = x % size;
            __touch(23103);
            z += z < 0 ? size : 0;
            __touch(23104);
            if (z < t) {
                return x - z;
                __touch(23106);
            } else if (z > size - t) {
                return x + size - z;
                __touch(23107);
            }
            return x;
            __touch(23105);
        };
        __touch(23102);
    }
    __touch(23023);
    var inclined8thpi = inclinedType2(Math.PI / 4, Math.PI / 16);
    __touch(23024);
    var tranFun = inclined8thpi;
    __touch(23025);
    RotationGizmo.prototype._rotateOnAxis = function (dx, dy) {
        this._rotation.setIdentity();
        __touch(23108);
        var sum = dx * this._direction.x + dy * this._direction.y;
        __touch(23109);
        sum *= this._rotationScale;
        __touch(23110);
        if (this.snap) {
            switch (this._activeHandle.axis) {
            case 0:
                this.accumulatedRotationThorX += sum;
                var newAngleX = tranFun(this.accumulatedRotationThorX);
                this._rotation.rotateX(newAngleX - this.oldAngleX);
                this.oldAngleX = newAngleX;
                break;
            case 1:
                this.accumulatedRotationThorY += sum;
                var newAngleY = tranFun(this.accumulatedRotationThorY);
                this._rotation.rotateY(newAngleY - this.oldAngleY);
                this.oldAngleY = newAngleY;
                break;
            case 2:
                this.accumulatedRotationThorZ += sum;
                var newAngleZ = tranFun(this.accumulatedRotationThorZ);
                this._rotation.rotateZ(newAngleZ - this.oldAngleZ);
                this.oldAngleZ = newAngleZ;
                break;
            }
            __touch(23112);
        } else {
            switch (this._activeHandle.axis) {
            case 0:
                this.accumulatedRotationThorX += sum;
                var newAngleX = this.accumulatedRotationThorX;
                this._rotation.rotateX(newAngleX - this.oldAngleX);
                this.oldAngleX = newAngleX;
                break;
            case 1:
                this.accumulatedRotationThorY += sum;
                var newAngleY = this.accumulatedRotationThorY;
                this._rotation.rotateY(newAngleY - this.oldAngleY);
                this.oldAngleY = newAngleY;
                break;
            case 2:
                this.accumulatedRotationThorZ += sum;
                var newAngleZ = this.accumulatedRotationThorZ;
                this._rotation.rotateZ(newAngleZ - this.oldAngleZ);
                this.oldAngleZ = newAngleZ;
                break;
            }
            __touch(23113);
        }
        Matrix3x3.combine(this.transform.rotation, this._rotation, this.transform.rotation);
        __touch(23111);
    };
    __touch(23026);
    RotationGizmo.prototype._buildBall = function () {
        var transform = new Transform();
        __touch(23114);
        transform.scale.setd(1.2, 1.2, 1.2);
        __touch(23115);
        this.addRenderable({
            meshData: this._ballMesh,
            materials: [this._buildMaterialForAxis(3, 0.6)],
            transform: new Transform(),
            id: Gizmo.registerHandle({
                type: 'Rotate',
                axis: 3
            })
        });
        __touch(23116);
    };
    __touch(23027);
    RotationGizmo.prototype._buildTorus = function (dim) {
        var transform = new Transform();
        __touch(23117);
        transform.scale.setd(1.7, 1.7, 1.7);
        __touch(23118);
        if (dim === 0) {
            transform.setRotationXYZ(0, Math.PI / 2, 0);
            __touch(23120);
        } else if (dim === 1) {
            transform.setRotationXYZ(Math.PI / 2, 0, 0);
            __touch(23121);
        }
        this.addRenderable({
            meshData: this._torusMesh,
            materials: [this._buildMaterialForAxis(dim)],
            transform: transform,
            id: Gizmo.registerHandle({
                type: 'Rotate',
                axis: dim
            }),
            thickness: 0.35
        });
        __touch(23119);
    };
    __touch(23028);
    return RotationGizmo;
    __touch(23029);
});
__touch(23016);