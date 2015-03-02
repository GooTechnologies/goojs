define([
    'goo/math/Vector3',
    'goo/math/Vector4',
    'goo/math/Matrix4x4',
    'goo/math/Plane',
    'goo/math/MathUtils',
    'goo/math/Ray',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere',
    'goo/renderer/bounds/BoundingVolume'
], function (Vector3, Vector4, Matrix4x4, Plane, MathUtils, Ray, BoundingBox, BoundingSphere, BoundingVolume) {
    'use strict';
    __touch(15421);
    function Camera(fov, aspect, near, far) {
        fov = typeof fov !== 'undefined' ? fov : 45;
        __touch(15470);
        aspect = typeof aspect !== 'undefined' ? aspect : 1;
        __touch(15471);
        near = typeof near !== 'undefined' ? near : 1;
        __touch(15472);
        far = typeof far !== 'undefined' ? far : 1000;
        __touch(15473);
        this.translation = new Vector3(0, 0, 0);
        __touch(15474);
        this._left = new Vector3(-1, 0, 0);
        __touch(15475);
        this._up = new Vector3(0, 1, 0);
        __touch(15476);
        this._direction = new Vector3(0, 0, -1);
        __touch(15477);
        this._frustumNear = this.near = 1;
        __touch(15478);
        this._frustumFar = this.far = 2;
        __touch(15479);
        this._frustumLeft = this.left = -0.5;
        __touch(15480);
        this._frustumRight = this.right = 0.5;
        __touch(15481);
        this._frustumTop = this.top = 0.5;
        __touch(15482);
        this._frustumBottom = this.bottom = -0.5;
        __touch(15483);
        this._coeffLeft = [];
        __touch(15484);
        this._coeffRight = [];
        __touch(15485);
        this._coeffBottom = [];
        __touch(15486);
        this._coeffTop = [];
        __touch(15487);
        this._viewPortLeft = 0;
        __touch(15488);
        this._viewPortRight = 1;
        __touch(15489);
        this._viewPortTop = 1;
        __touch(15490);
        this._viewPortBottom = 0;
        __touch(15491);
        this._worldPlane = [];
        __touch(15492);
        for (var i = 0; i < Camera.FRUSTUM_PLANES; i++) {
            this._worldPlane[i] = new Plane();
            __touch(15518);
        }
        this.projectionMode = Camera.Perspective;
        __touch(15493);
        this.lockedRatio = false;
        __touch(15494);
        this.aspect = aspect;
        __touch(15495);
        this._updateMVMatrix = true;
        __touch(15496);
        this._updateInverseMVMatrix = true;
        __touch(15497);
        this._updatePMatrix = true;
        __touch(15498);
        this._updateMVPMatrix = true;
        __touch(15499);
        this._updateInverseMVPMatrix = true;
        __touch(15500);
        this.modelView = new Matrix4x4();
        __touch(15501);
        this.modelViewInverse = new Matrix4x4();
        __touch(15502);
        this.projection = new Matrix4x4();
        __touch(15503);
        this.modelViewProjection = new Matrix4x4();
        __touch(15504);
        this.modelViewProjectionInverse = new Matrix4x4();
        __touch(15505);
        this._planeState = 0;
        __touch(15506);
        this._clipPlane = new Vector4();
        __touch(15507);
        this._qCalc = new Vector4();
        __touch(15508);
        this._corners = [];
        __touch(15509);
        for (var i = 0; i < 8; i++) {
            this._corners.push(new Vector3());
            __touch(15519);
        }
        this._extents = new Vector3();
        __touch(15510);
        this.vNearPlaneCenter = new Vector3();
        __touch(15511);
        this.vFarPlaneCenter = new Vector3();
        __touch(15512);
        this.calcLeft = new Vector3();
        __touch(15513);
        this.calcUp = new Vector3();
        __touch(15514);
        this.changedProperties = true;
        __touch(15515);
        this.setFrustumPerspective(fov, aspect, near, far);
        __touch(15516);
        this.onFrameChange();
        __touch(15517);
    }
    __touch(15422);
    var newDirection = new Vector3();
    __touch(15423);
    Camera.LEFT_PLANE = 0;
    __touch(15424);
    Camera.RIGHT_PLANE = 1;
    __touch(15425);
    Camera.BOTTOM_PLANE = 2;
    __touch(15426);
    Camera.TOP_PLANE = 3;
    __touch(15427);
    Camera.FAR_PLANE = 4;
    __touch(15428);
    Camera.NEAR_PLANE = 5;
    __touch(15429);
    Camera.FRUSTUM_PLANES = 6;
    __touch(15430);
    Camera.Perspective = 0;
    __touch(15431);
    Camera.Parallel = 1;
    __touch(15432);
    Camera.Custom = 2;
    __touch(15433);
    Camera.Outside = 0;
    __touch(15434);
    Camera.Inside = 1;
    __touch(15435);
    Camera.Intersects = 2;
    __touch(15436);
    Camera.prototype.normalize = function () {
        this._left.normalize();
        __touch(15520);
        this._up.normalize();
        __touch(15521);
        this._direction.normalize();
        __touch(15522);
        this.onFrameChange();
        __touch(15523);
    };
    __touch(15437);
    Camera.prototype.setProjectionMode = function (projectionMode) {
        this.projectionMode = projectionMode;
        __touch(15524);
        this.update();
        __touch(15525);
    };
    __touch(15438);
    Camera.prototype.setFrustumPerspective = function (fov, aspect, near, far) {
        if (fov !== undefined && fov !== null) {
            this.fov = fov;
            __touch(15526);
        }
        if (aspect !== undefined && aspect !== null) {
            this.aspect = aspect;
            __touch(15527);
        }
        if (near !== undefined && near !== null) {
            this.near = near;
            __touch(15528);
        }
        if (far !== undefined && far !== null) {
            this.far = far;
            __touch(15529);
        }
        if (this.fov !== undefined) {
            var h = Math.tan(this.fov * MathUtils.DEG_TO_RAD * 0.5) * this.near;
            __touch(15530);
            var w = h * this.aspect;
            __touch(15531);
            this._frustumLeft = -w;
            __touch(15532);
            this._frustumRight = w;
            __touch(15533);
            this._frustumBottom = -h;
            __touch(15534);
            this._frustumTop = h;
            __touch(15535);
            this._frustumNear = this.near;
            __touch(15536);
            this._frustumFar = this.far;
            __touch(15537);
            this.onFrustumChange();
            __touch(15538);
        }
    };
    __touch(15439);
    Camera.prototype.setFrustum = function (near, far, left, right, top, bottom, aspect) {
        if (near !== undefined && near !== null) {
            this.near = near;
            __touch(15546);
        }
        if (far !== undefined && far !== null) {
            this.far = far;
            __touch(15547);
        }
        if (left !== undefined && left !== null) {
            this.left = left;
            __touch(15548);
        }
        if (right !== undefined && right !== null) {
            this.right = right;
            __touch(15549);
        }
        if (top !== undefined && top !== null) {
            this.top = top;
            __touch(15550);
        }
        if (bottom !== undefined && bottom !== null) {
            this.bottom = bottom;
            __touch(15551);
        }
        if (aspect !== undefined && aspect !== null) {
            this.aspect = aspect;
            __touch(15552);
        }
        this._frustumNear = this.near;
        __touch(15539);
        this._frustumFar = this.far;
        __touch(15540);
        this._frustumLeft = this.left * this.aspect;
        __touch(15541);
        this._frustumRight = this.right * this.aspect;
        __touch(15542);
        this._frustumTop = this.top;
        __touch(15543);
        this._frustumBottom = this.bottom;
        __touch(15544);
        this.onFrustumChange();
        __touch(15545);
    };
    __touch(15440);
    Camera.prototype.copy = function (source) {
        this.translation.setv(source.translation);
        __touch(15553);
        this._left.setv(source._left);
        __touch(15554);
        this._up.setv(source._up);
        __touch(15555);
        this._direction.setv(source._direction);
        __touch(15556);
        this.fov = source.fov;
        __touch(15557);
        this.aspect = source.aspect;
        __touch(15558);
        this.near = source.near;
        __touch(15559);
        this.far = source.far;
        __touch(15560);
        this.left = source.left;
        __touch(15561);
        this.up = source.up;
        __touch(15562);
        this.top = source.top;
        __touch(15563);
        this.bottom = source.bottom;
        __touch(15564);
        this._frustumLeft = source._frustumLeft;
        __touch(15565);
        this._frustumRight = source._frustumRight;
        __touch(15566);
        this._frustumBottom = source._frustumBottom;
        __touch(15567);
        this._frustumTop = source._frustumTop;
        __touch(15568);
        this._frustumNear = source._frustumNear;
        __touch(15569);
        this._frustumFar = source._frustumFar;
        __touch(15570);
        this.projectionMode = source.projectionMode;
        __touch(15571);
        this.onFrustumChange();
        __touch(15572);
        this.onFrameChange();
        __touch(15573);
    };
    __touch(15441);
    Camera.prototype.setFrame = function (location, left, up, direction) {
        this._left.setv(left);
        __touch(15574);
        this._up.setv(up);
        __touch(15575);
        this._direction.setv(direction);
        __touch(15576);
        this.translation.setv(location);
        __touch(15577);
        this.onFrameChange();
        __touch(15578);
    };
    __touch(15442);
    Camera.prototype.lookAt = function (pos, worldUpVector) {
        newDirection.setv(pos).subv(this.translation).normalize();
        __touch(15579);
        if (newDirection.equals(this._direction)) {
            return;
            __touch(15585);
        }
        this._direction.setv(newDirection);
        __touch(15580);
        this._up.setv(worldUpVector).normalize();
        __touch(15581);
        if (this._up.equals(Vector3.ZERO)) {
            this._up.setv(Vector3.UNIT_Y);
            __touch(15586);
        }
        this._left.setv(this._up).cross(this._direction).normalize();
        __touch(15582);
        if (this._left.equals(Vector3.ZERO)) {
            if (this._direction.x !== 0) {
                this._left.set_d(this._direction.y, -this._direction.x, 0);
                __touch(15587);
            } else {
                this._left.set_d(0, this._direction.z, -this._direction.y);
                __touch(15588);
            }
        }
        this._up.setv(this._direction).cross(this._left).normalize();
        __touch(15583);
        this.onFrameChange();
        __touch(15584);
    };
    __touch(15443);
    Camera.prototype.update = function () {
        this.onFrustumChange();
        __touch(15589);
        this.onFrameChange();
        __touch(15590);
    };
    __touch(15444);
    Camera.prototype.contains = function (bound) {
        if (!bound) {
            return Camera.Inside;
            __touch(15593);
        }
        var rVal = Camera.Inside;
        __touch(15591);
        for (var planeCounter = Camera.FRUSTUM_PLANES - 1; planeCounter >= 0; planeCounter--) {
            switch (bound.whichSide(this._worldPlane[planeCounter])) {
            case BoundingVolume.Inside:
                return Camera.Outside;
            case BoundingVolume.Outside:
                break;
            case BoundingVolume.Intersects:
                rVal = Camera.Intersects;
                break;
            }
            __touch(15594);
        }
        return rVal;
        __touch(15592);
    };
    __touch(15445);
    Camera.prototype.onFrustumChange = function () {
        if (this.projectionMode === Camera.Perspective) {
            var nearSquared = this._frustumNear * this._frustumNear;
            __touch(15600);
            var leftSquared = this._frustumLeft * this._frustumLeft;
            __touch(15601);
            var rightSquared = this._frustumRight * this._frustumRight;
            __touch(15602);
            var bottomSquared = this._frustumBottom * this._frustumBottom;
            __touch(15603);
            var topSquared = this._frustumTop * this._frustumTop;
            __touch(15604);
            var inverseLength = 1 / Math.sqrt(nearSquared + leftSquared);
            __touch(15605);
            this._coeffLeft[0] = -this._frustumNear * inverseLength;
            __touch(15606);
            this._coeffLeft[1] = -this._frustumLeft * inverseLength;
            __touch(15607);
            inverseLength = 1 / Math.sqrt(nearSquared + rightSquared);
            __touch(15608);
            this._coeffRight[0] = this._frustumNear * inverseLength;
            __touch(15609);
            this._coeffRight[1] = this._frustumRight * inverseLength;
            __touch(15610);
            inverseLength = 1 / Math.sqrt(nearSquared + bottomSquared);
            __touch(15611);
            this._coeffBottom[0] = this._frustumNear * inverseLength;
            __touch(15612);
            this._coeffBottom[1] = -this._frustumBottom * inverseLength;
            __touch(15613);
            inverseLength = 1 / Math.sqrt(nearSquared + topSquared);
            __touch(15614);
            this._coeffTop[0] = -this._frustumNear * inverseLength;
            __touch(15615);
            this._coeffTop[1] = this._frustumTop * inverseLength;
            __touch(15616);
        } else if (this.projectionMode === Camera.Parallel) {
            if (this._frustumRight > this._frustumLeft) {
                this._coeffLeft[0] = -1;
                __touch(15617);
                this._coeffLeft[1] = 0;
                __touch(15618);
                this._coeffRight[0] = 1;
                __touch(15619);
                this._coeffRight[1] = 0;
                __touch(15620);
            } else {
                this._coeffLeft[0] = 1;
                __touch(15621);
                this._coeffLeft[1] = 0;
                __touch(15622);
                this._coeffRight[0] = -1;
                __touch(15623);
                this._coeffRight[1] = 0;
                __touch(15624);
            }
            if (this._frustumTop > this._frustumBottom) {
                this._coeffBottom[0] = -1;
                __touch(15625);
                this._coeffBottom[1] = 0;
                __touch(15626);
                this._coeffTop[0] = 1;
                __touch(15627);
                this._coeffTop[1] = 0;
                __touch(15628);
            } else {
                this._coeffBottom[0] = 1;
                __touch(15629);
                this._coeffBottom[1] = 0;
                __touch(15630);
                this._coeffTop[0] = -1;
                __touch(15631);
                this._coeffTop[1] = 0;
                __touch(15632);
            }
        }
        this._updatePMatrix = true;
        __touch(15595);
        this._updateMVPMatrix = true;
        __touch(15596);
        this._updateInverseMVMatrix = true;
        __touch(15597);
        this._updateInverseMVPMatrix = true;
        __touch(15598);
        this.changedProperties = true;
        __touch(15599);
    };
    __touch(15446);
    Camera.prototype.onFrameChange = function () {
        var plane;
        __touch(15633);
        plane = this._worldPlane[Camera.LEFT_PLANE];
        __touch(15634);
        plane.normal.x = this._left.x * this._coeffLeft[0] + this._direction.x * this._coeffLeft[1];
        __touch(15635);
        plane.normal.y = this._left.y * this._coeffLeft[0] + this._direction.y * this._coeffLeft[1];
        __touch(15636);
        plane.normal.z = this._left.z * this._coeffLeft[0] + this._direction.z * this._coeffLeft[1];
        __touch(15637);
        plane.constant = Vector3.dotv(this.translation, plane.normal);
        __touch(15638);
        plane = this._worldPlane[Camera.RIGHT_PLANE];
        __touch(15639);
        plane.normal.x = this._left.x * this._coeffRight[0] + this._direction.x * this._coeffRight[1];
        __touch(15640);
        plane.normal.y = this._left.y * this._coeffRight[0] + this._direction.y * this._coeffRight[1];
        __touch(15641);
        plane.normal.z = this._left.z * this._coeffRight[0] + this._direction.z * this._coeffRight[1];
        __touch(15642);
        plane.constant = Vector3.dotv(this.translation, plane.normal);
        __touch(15643);
        plane = this._worldPlane[Camera.BOTTOM_PLANE];
        __touch(15644);
        plane.normal.x = this._up.x * this._coeffBottom[0] + this._direction.x * this._coeffBottom[1];
        __touch(15645);
        plane.normal.y = this._up.y * this._coeffBottom[0] + this._direction.y * this._coeffBottom[1];
        __touch(15646);
        plane.normal.z = this._up.z * this._coeffBottom[0] + this._direction.z * this._coeffBottom[1];
        __touch(15647);
        plane.constant = Vector3.dotv(this.translation, plane.normal);
        __touch(15648);
        plane = this._worldPlane[Camera.TOP_PLANE];
        __touch(15649);
        plane.normal.x = this._up.x * this._coeffTop[0] + this._direction.x * this._coeffTop[1];
        __touch(15650);
        plane.normal.y = this._up.y * this._coeffTop[0] + this._direction.y * this._coeffTop[1];
        __touch(15651);
        plane.normal.z = this._up.z * this._coeffTop[0] + this._direction.z * this._coeffTop[1];
        __touch(15652);
        plane.constant = Vector3.dotv(this.translation, plane.normal);
        __touch(15653);
        if (this.projectionMode === Camera.Parallel) {
            if (this._frustumRight > this._frustumLeft) {
                this._worldPlane[Camera.LEFT_PLANE].constant += this._frustumLeft;
                __touch(15669);
                this._worldPlane[Camera.RIGHT_PLANE].constant -= this._frustumRight;
                __touch(15670);
            } else {
                this._worldPlane[Camera.LEFT_PLANE].constant -= this._frustumLeft;
                __touch(15671);
                this._worldPlane[Camera.RIGHT_PLANE].constant += this._frustumRight;
                __touch(15672);
            }
            if (this._frustumBottom > this._frustumTop) {
                this._worldPlane[Camera.TOP_PLANE].constant += this._frustumTop;
                __touch(15673);
                this._worldPlane[Camera.BOTTOM_PLANE].constant -= this._frustumBottom;
                __touch(15674);
            } else {
                this._worldPlane[Camera.TOP_PLANE].constant -= this._frustumTop;
                __touch(15675);
                this._worldPlane[Camera.BOTTOM_PLANE].constant += this._frustumBottom;
                __touch(15676);
            }
        }
        var dirDotLocation = this._direction.dot(this.translation);
        __touch(15654);
        plane = this._worldPlane[Camera.FAR_PLANE];
        __touch(15655);
        plane.normal.x = -this._direction.x;
        __touch(15656);
        plane.normal.y = -this._direction.y;
        __touch(15657);
        plane.normal.z = -this._direction.z;
        __touch(15658);
        plane.constant = -(dirDotLocation + this._frustumFar);
        __touch(15659);
        plane = this._worldPlane[Camera.NEAR_PLANE];
        __touch(15660);
        plane.normal.x = this._direction.x;
        __touch(15661);
        plane.normal.y = this._direction.y;
        __touch(15662);
        plane.normal.z = this._direction.z;
        __touch(15663);
        plane.constant = dirDotLocation + this._frustumNear;
        __touch(15664);
        this._updateMVMatrix = true;
        __touch(15665);
        this._updateMVPMatrix = true;
        __touch(15666);
        this._updateInverseMVMatrix = true;
        __touch(15667);
        this._updateInverseMVPMatrix = true;
        __touch(15668);
    };
    __touch(15447);
    Camera.prototype.updateProjectionMatrix = function () {
        if (this.projectionMode === Camera.Parallel) {
            this.projection.setIdentity();
            __touch(15677);
            var d = this.projection.data;
            __touch(15678);
            d[0] = 2 / (this._frustumRight - this._frustumLeft);
            __touch(15679);
            d[5] = 2 / (this._frustumTop - this._frustumBottom);
            __touch(15680);
            d[10] = -2 / (this._frustumFar - this._frustumNear);
            __touch(15681);
            d[12] = -(this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
            __touch(15682);
            d[13] = -(this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
            __touch(15683);
            d[14] = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
            __touch(15684);
        } else if (this.projectionMode === Camera.Perspective) {
            this.projection.setIdentity();
            __touch(15685);
            var d = this.projection.data;
            __touch(15686);
            d[0] = 2 * this._frustumNear / (this._frustumRight - this._frustumLeft);
            __touch(15687);
            d[5] = 2 * this._frustumNear / (this._frustumTop - this._frustumBottom);
            __touch(15688);
            d[8] = (this._frustumRight + this._frustumLeft) / (this._frustumRight - this._frustumLeft);
            __touch(15689);
            d[9] = (this._frustumTop + this._frustumBottom) / (this._frustumTop - this._frustumBottom);
            __touch(15690);
            d[10] = -(this._frustumFar + this._frustumNear) / (this._frustumFar - this._frustumNear);
            __touch(15691);
            d[11] = -1;
            __touch(15692);
            d[14] = -(2 * this._frustumFar * this._frustumNear) / (this._frustumFar - this._frustumNear);
            __touch(15693);
            d[15] = -0;
            __touch(15694);
        }
    };
    __touch(15448);
    Camera.prototype.updateModelViewMatrix = function () {
        this.modelView.setIdentity();
        __touch(15695);
        var d = this.modelView.data;
        __touch(15696);
        d[0] = -this._left.x;
        __touch(15697);
        d[4] = -this._left.y;
        __touch(15698);
        d[8] = -this._left.z;
        __touch(15699);
        d[1] = this._up.x;
        __touch(15700);
        d[5] = this._up.y;
        __touch(15701);
        d[9] = this._up.z;
        __touch(15702);
        d[2] = -this._direction.x;
        __touch(15703);
        d[6] = -this._direction.y;
        __touch(15704);
        d[10] = -this._direction.z;
        __touch(15705);
        d[12] = this._left.dot(this.translation);
        __touch(15706);
        d[13] = -this._up.dot(this.translation);
        __touch(15707);
        d[14] = this._direction.dot(this.translation);
        __touch(15708);
    };
    __touch(15449);
    Camera.prototype.getPickRay = function (screenX, screenY, screenWidth, screenHeight, store) {
        if (!store) {
            store = new Ray();
            __touch(15712);
        }
        this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, 0, store.origin);
        __touch(15709);
        this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, 0.3, store.direction).subv(store.origin).normalize();
        __touch(15710);
        return store;
        __touch(15711);
    };
    __touch(15450);
    Camera.prototype.getWorldPosition = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
        if (this.projectionMode === Camera.Parallel) {
            zDepth = (zDepth - this.near) / (this.far - this.near);
            __touch(15714);
        } else {
            zDepth = this.far / (this.far - this.near) + this.far * this.near / (this.near - this.far) / zDepth;
            __touch(15715);
        }
        return this.getWorldCoordinates(screenX, screenY, screenWidth, screenHeight, zDepth, store);
        __touch(15713);
    };
    __touch(15451);
    Camera.prototype.getWorldCoordinates = function (screenX, screenY, screenWidth, screenHeight, zDepth, store) {
        if (!store) {
            store = new Vector3();
            __touch(15727);
        }
        this.checkInverseModelViewProjection();
        __touch(15716);
        var position = new Vector4();
        __touch(15717);
        var x = (screenX / screenWidth - this._viewPortLeft) / (this._viewPortRight - this._viewPortLeft) * 2 - 1;
        __touch(15718);
        var y = ((screenHeight - screenY) / screenHeight - this._viewPortBottom) / (this._viewPortTop - this._viewPortBottom) * 2 - 1;
        __touch(15719);
        position.setd(x, y, zDepth * 2 - 1, 1);
        __touch(15720);
        this.modelViewProjectionInverse.applyPost(position);
        __touch(15721);
        position.mul(1 / position.w);
        __touch(15722);
        store.x = position.x;
        __touch(15723);
        store.y = position.y;
        __touch(15724);
        store.z = position.z;
        __touch(15725);
        return store;
        __touch(15726);
    };
    __touch(15452);
    Camera.prototype.getScreenCoordinates = function (worldPosition, screenWidth, screenHeight, store) {
        store = this.getNormalizedDeviceCoordinates(worldPosition, store);
        __touch(15728);
        store.x = (store.x + 1) * (this._viewPortRight - this._viewPortLeft) / 2 * screenWidth;
        __touch(15729);
        store.y = (1 - store.y) * (this._viewPortTop - this._viewPortBottom) / 2 * screenHeight;
        __touch(15730);
        store.z = (store.z + 1) / 2;
        __touch(15731);
        return store;
        __touch(15732);
    };
    __touch(15453);
    Camera.prototype.getFrustumCoordinates = function (worldPosition, store) {
        store = this.getNormalizedDeviceCoordinates(worldPosition, store);
        __touch(15733);
        store.x = (store.x + 1) * (this._frustumRight - this._frustumLeft) / 2 + this._frustumLeft;
        __touch(15734);
        store.y = (store.y + 1) * (this._frustumTop - this._frustumBottom) / 2 + this._frustumBottom;
        __touch(15735);
        store.z = (store.z + 1) * (this._frustumFar - this._frustumNear) / 2 + this._frustumNear;
        __touch(15736);
        return store;
        __touch(15737);
    };
    __touch(15454);
    Camera.prototype.getNormalizedDeviceCoordinates = function (worldPosition, store) {
        if (!store) {
            store = new Vector3();
            __touch(15747);
        }
        this.checkModelViewProjection();
        __touch(15738);
        var position = new Vector4();
        __touch(15739);
        position.setd(worldPosition.x, worldPosition.y, worldPosition.z, 1);
        __touch(15740);
        this.modelViewProjection.applyPost(position);
        __touch(15741);
        position.mul(1 / position.w);
        __touch(15742);
        store.x = position.x;
        __touch(15743);
        store.y = position.y;
        __touch(15744);
        store.z = position.z;
        __touch(15745);
        return store;
        __touch(15746);
    };
    __touch(15455);
    Camera.prototype.checkModelView = function () {
        if (this._updateMVMatrix) {
            this.updateModelViewMatrix();
            __touch(15748);
            this._updateMVMatrix = false;
            __touch(15749);
        }
    };
    __touch(15456);
    Camera.prototype.checkProjection = function () {
        if (this._updatePMatrix) {
            this.updateProjectionMatrix();
            __touch(15750);
            this._updatePMatrix = false;
            __touch(15751);
        }
    };
    __touch(15457);
    Camera.prototype.checkModelViewProjection = function () {
        if (this._updateMVPMatrix) {
            this.checkModelView();
            __touch(15752);
            this.checkProjection();
            __touch(15753);
            this.modelViewProjection.copy(this.getProjectionMatrix()).combine(this.getViewMatrix());
            __touch(15754);
            this._updateMVPMatrix = false;
            __touch(15755);
        }
    };
    __touch(15458);
    Camera.prototype.checkInverseModelView = function () {
        if (this._updateInverseMVMatrix) {
            this.checkModelView();
            __touch(15756);
            Matrix4x4.invert(this.modelView, this.modelViewInverse);
            __touch(15757);
            this._updateInverseMVMatrix = false;
            __touch(15758);
        }
    };
    __touch(15459);
    Camera.prototype.checkInverseModelViewProjection = function () {
        if (this._updateInverseMVPMatrix) {
            this.checkModelViewProjection();
            __touch(15759);
            Matrix4x4.invert(this.modelViewProjection, this.modelViewProjectionInverse);
            __touch(15760);
            this._updateInverseMVPMatrix = false;
            __touch(15761);
        }
    };
    __touch(15460);
    Camera.prototype.getViewMatrix = function () {
        this.checkModelView();
        __touch(15762);
        return this.modelView;
        __touch(15763);
    };
    __touch(15461);
    Camera.prototype.getProjectionMatrix = function () {
        this.checkProjection();
        __touch(15764);
        return this.projection;
        __touch(15765);
    };
    __touch(15462);
    Camera.prototype.getViewProjectionMatrix = function () {
        this.checkModelViewProjection();
        __touch(15766);
        return this.modelViewProjection;
        __touch(15767);
    };
    __touch(15463);
    Camera.prototype.getViewInverseMatrix = function () {
        this.checkInverseModelView();
        __touch(15768);
        return this.modelViewInverse;
        __touch(15769);
    };
    __touch(15464);
    Camera.prototype.getViewProjectionInverseMatrix = function () {
        this.checkInverseModelViewProjection();
        __touch(15770);
        return this.modelViewProjectionInverse;
        __touch(15771);
    };
    __touch(15465);
    Camera.prototype.pack = function (sceneBounds) {
        var center = sceneBounds.center;
        __touch(15772);
        var corners = this._corners;
        __touch(15773);
        var extents = this._extents;
        __touch(15774);
        for (var i = 0; i < corners.length; i++) {
            corners[i].set(center);
            __touch(15796);
        }
        if (sceneBounds instanceof BoundingBox) {
            extents.setd(sceneBounds.xExtent, sceneBounds.yExtent, sceneBounds.zExtent);
            __touch(15797);
        } else if (sceneBounds instanceof BoundingSphere) {
            extents.setd(sceneBounds.radius, sceneBounds.radius, sceneBounds.radius);
            __touch(15798);
        }
        corners[0].add_d(extents.x, extents.y, extents.z);
        __touch(15775);
        corners[1].add_d(extents.x, -extents.y, extents.z);
        __touch(15776);
        corners[2].add_d(extents.x, extents.y, -extents.z);
        __touch(15777);
        corners[3].add_d(extents.x, -extents.y, -extents.z);
        __touch(15778);
        corners[4].add_d(-extents.x, extents.y, extents.z);
        __touch(15779);
        corners[5].add_d(-extents.x, -extents.y, extents.z);
        __touch(15780);
        corners[6].add_d(-extents.x, extents.y, -extents.z);
        __touch(15781);
        corners[7].add_d(-extents.x, -extents.y, -extents.z);
        __touch(15782);
        var mvMatrix = this.getViewMatrix();
        __touch(15783);
        var optimalCameraNear = Number.MAX_VALUE;
        __touch(15784);
        var optimalCameraFar = -Number.MAX_VALUE;
        __touch(15785);
        var position = new Vector4();
        __touch(15786);
        for (var i = 0; i < corners.length; i++) {
            position.setd(corners[i].x, corners[i].y, corners[i].z, 1);
            __touch(15799);
            mvMatrix.applyPre(position);
            __touch(15800);
            optimalCameraNear = Math.min(-position.z, optimalCameraNear);
            __touch(15801);
            optimalCameraFar = Math.max(-position.z, optimalCameraFar);
            __touch(15802);
        }
        optimalCameraNear = Math.min(Math.max(this._frustumNear, optimalCameraNear), this._frustumFar);
        __touch(15787);
        optimalCameraFar = Math.max(optimalCameraNear, Math.min(this._frustumFar, optimalCameraFar));
        __touch(15788);
        var change = optimalCameraNear / this._frustumNear;
        __touch(15789);
        this._frustumLeft = this._frustumLeft * change;
        __touch(15790);
        this._frustumRight = this._frustumRight * change;
        __touch(15791);
        this._frustumTop = this._frustumTop * change;
        __touch(15792);
        this._frustumBottom = this._frustumBottom * change;
        __touch(15793);
        this._frustumNear = optimalCameraNear;
        __touch(15794);
        this._frustumFar = optimalCameraFar;
        __touch(15795);
    };
    __touch(15466);
    Camera.prototype.calculateFrustumCorners = function (fNear, fFar) {
        fNear = fNear !== undefined ? fNear : this._frustumNear;
        __touch(15803);
        fFar = fFar !== undefined ? fFar : this._frustumFar;
        __touch(15804);
        var fNearPlaneHeight = (this._frustumTop - this._frustumBottom) * fNear * 0.5 / this._frustumNear;
        __touch(15805);
        var fNearPlaneWidth = (this._frustumRight - this._frustumLeft) * fNear * 0.5 / this._frustumNear;
        __touch(15806);
        var fFarPlaneHeight = (this._frustumTop - this._frustumBottom) * fFar * 0.5 / this._frustumNear;
        __touch(15807);
        var fFarPlaneWidth = (this._frustumRight - this._frustumLeft) * fFar * 0.5 / this._frustumNear;
        __touch(15808);
        if (this.projectionMode === Camera.Parallel) {
            fNearPlaneHeight = (this._frustumTop - this._frustumBottom) * 0.5;
            __touch(15831);
            fNearPlaneWidth = (this._frustumRight - this._frustumLeft) * 0.5;
            __touch(15832);
            fFarPlaneHeight = (this._frustumTop - this._frustumBottom) * 0.5;
            __touch(15833);
            fFarPlaneWidth = (this._frustumRight - this._frustumLeft) * 0.5;
            __touch(15834);
        }
        var vNearPlaneCenter = this.vNearPlaneCenter;
        __touch(15809);
        var vFarPlaneCenter = this.vFarPlaneCenter;
        __touch(15810);
        var direction = this.calcLeft;
        __touch(15811);
        direction.setv(this._direction).mul(fNear);
        __touch(15812);
        vNearPlaneCenter.setv(this.translation).addv(direction);
        __touch(15813);
        direction.setv(this._direction).mul(fFar);
        __touch(15814);
        vFarPlaneCenter.setv(this.translation).addv(direction);
        __touch(15815);
        var left = this.calcLeft;
        __touch(15816);
        var up = this.calcUp;
        __touch(15817);
        left.setv(this._left).mul(fNearPlaneWidth);
        __touch(15818);
        up.setv(this._up).mul(fNearPlaneHeight);
        __touch(15819);
        this._corners[0].setv(vNearPlaneCenter).subv(left).subv(up);
        __touch(15820);
        this._corners[1].setv(vNearPlaneCenter).addv(left).subv(up);
        __touch(15821);
        this._corners[2].setv(vNearPlaneCenter).addv(left).addv(up);
        __touch(15822);
        this._corners[3].setv(vNearPlaneCenter).subv(left).addv(up);
        __touch(15823);
        left.setv(this._left).mul(fFarPlaneWidth);
        __touch(15824);
        up.setv(this._up).mul(fFarPlaneHeight);
        __touch(15825);
        this._corners[4].setv(vFarPlaneCenter).subv(left).subv(up);
        __touch(15826);
        this._corners[5].setv(vFarPlaneCenter).addv(left).subv(up);
        __touch(15827);
        this._corners[6].setv(vFarPlaneCenter).addv(left).addv(up);
        __touch(15828);
        this._corners[7].setv(vFarPlaneCenter).subv(left).addv(up);
        __touch(15829);
        return this._corners;
        __touch(15830);
    };
    __touch(15467);
    Camera.prototype.setToObliqueMatrix = function (clipPlane) {
        var transformedClipPlane = this._clipPlane.setv(clipPlane);
        __touch(15835);
        transformedClipPlane.w = 0;
        __touch(15836);
        this.getViewMatrix().applyPost(transformedClipPlane);
        __touch(15837);
        transformedClipPlane.w = this.translation.y * clipPlane.y - clipPlane.w;
        __touch(15838);
        this._updatePMatrix = true;
        __touch(15839);
        var projection = this.getProjectionMatrix();
        __touch(15840);
        this._qCalc.setd((MathUtils.sign(transformedClipPlane.x) + projection[8]) / projection[0], (MathUtils.sign(transformedClipPlane.y) + projection[9]) / projection[5], -1, (1 + projection[10]) / projection[14]);
        __touch(15841);
        transformedClipPlane.mul(2 / Vector4.dot(transformedClipPlane, this._qCalc));
        __touch(15842);
        projection[2] = transformedClipPlane.x;
        __touch(15843);
        projection[6] = transformedClipPlane.y;
        __touch(15844);
        projection[10] = transformedClipPlane.z + 1;
        __touch(15845);
        projection[14] = transformedClipPlane.w;
        __touch(15846);
        this._updateMVPMatrix = true;
        __touch(15847);
        this._updateInverseMVPMatrix = true;
        __touch(15848);
    };
    __touch(15468);
    return Camera;
    __touch(15469);
});
__touch(15420);