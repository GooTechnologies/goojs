define([
    'goo/util/gizmopack/Gizmo',
    'goo/renderer/MeshData',
    'goo/util/MeshBuilder',
    'goo/shapes/Box',
    'goo/math/Transform',
    'goo/renderer/Renderer',
    'goo/math/Vector3',
    'goo/math/MathUtils'
], function (Gizmo, MeshData, MeshBuilder, Box, Transform, Renderer, Vector3, MathUtils) {
    'use strict';
    __touch(23123);
    function ScaleGizmo(gizmoRenderSystem) {
        Gizmo.call(this, 'ScaleGizmo', gizmoRenderSystem);
        __touch(23135);
        this._boxMesh = new Box(1.4, 1.4, 1.4);
        __touch(23136);
        this._arrowMesh = this._buildArrowMesh();
        __touch(23137);
        this._scale = 1;
        __touch(23138);
        this._transformScale = new Vector3();
        __touch(23139);
        this._transformScale.setd(1, 1, 1);
        __touch(23140);
        this._buildBox();
        __touch(23141);
        this._buildArrow(0);
        __touch(23142);
        this._buildArrow(1);
        __touch(23143);
        this._buildArrow(2);
        __touch(23144);
    }
    __touch(23124);
    ScaleGizmo.prototype = Object.create(Gizmo.prototype);
    __touch(23125);
    ScaleGizmo.prototype.activate = function (props) {
        Gizmo.prototype.activate.call(this, props);
        __touch(23145);
        if (this._activeHandle.axis !== 3) {
            this._setPlane();
            __touch(23146);
            this._setLine();
            __touch(23147);
        }
    };
    __touch(23126);
    ScaleGizmo.prototype.copyTransform = function (transform) {
        Gizmo.prototype.copyTransform.call(this, transform);
        __touch(23148);
        this._transformScale.setv(transform.scale);
        __touch(23149);
    };
    __touch(23127);
    ScaleGizmo.prototype.process = function () {
        var op = this._mouse.oldPosition;
        __touch(23150);
        var p = this._mouse.position;
        __touch(23151);
        if (this._activeHandle.axis === 3) {
            this._scaleUniform();
            __touch(23156);
        } else {
            this._scaleNonUniform();
            __touch(23157);
        }
        op[0] = p[0];
        __touch(23152);
        op[1] = p[1];
        __touch(23153);
        this.updateTransforms();
        __touch(23154);
        this.dirty = false;
        __touch(23155);
        if (this.onChange instanceof Function) {
            this.onChange(this._transformScale);
            __touch(23158);
        }
    };
    __touch(23128);
    ScaleGizmo.prototype._scaleUniform = function () {
        var op = this._mouse.oldPosition;
        __touch(23159);
        var p = this._mouse.position;
        __touch(23160);
        var scale = Math.pow(1 + p[0] + op[1] - op[0] - p[1], this._scale);
        __touch(23161);
        var boundEntityTranslation = this.gizmoRenderSystem.entity.transformComponent.worldTransform.translation;
        __touch(23162);
        var mainCameraTranslation = Renderer.mainCamera.translation;
        __touch(23163);
        var cameraEntityDistance = mainCameraTranslation.distance(boundEntityTranslation);
        __touch(23164);
        scale += cameraEntityDistance / 200000 * MathUtils.sign(scale - 1);
        __touch(23165);
        this._transformScale.muld(scale, scale, scale);
        __touch(23166);
    };
    __touch(23129);
    ScaleGizmo.prototype._scaleNonUniform = function () {
        var p = this._mouse.position;
        __touch(23167);
        var op = this._mouse.oldPosition;
        __touch(23168);
        Renderer.mainCamera.getPickRay(op[0], op[1], 1, 1, this._oldRay);
        __touch(23169);
        Renderer.mainCamera.getPickRay(p[0], p[1], 1, 1, this._newRay);
        __touch(23170);
        var oldWorldPos = this._v0, worldPos = this._v1, line = this._line, result = this._result;
        __touch(23171);
        this._plane.rayIntersect(this._oldRay, oldWorldPos);
        __touch(23172);
        this._plane.rayIntersect(this._newRay, worldPos);
        __touch(23173);
        result.setv(worldPos).subv(oldWorldPos);
        __touch(23174);
        result.div(this.transform.scale).scale(0.07);
        __touch(23175);
        var d = result.dot(line);
        __touch(23176);
        result.setv(line).muld(d, d, d);
        __touch(23177);
        var scale = Math.pow(1 + d, this._scale);
        __touch(23178);
        switch (this._activeHandle.axis) {
        case 0:
            this._transformScale.data[0] *= scale;
            break;
        case 1:
            this._transformScale.data[1] *= scale;
            break;
        case 2:
            this._transformScale.data[2] *= scale;
            break;
        }
        __touch(23179);
    };
    __touch(23130);
    ScaleGizmo.prototype._buildBox = function () {
        this.addRenderable({
            meshData: this._boxMesh,
            materials: [this._buildMaterialForAxis(3)],
            transform: new Transform(),
            id: Gizmo.registerHandle({
                type: 'Scale',
                axis: 3
            })
        });
        __touch(23180);
    };
    __touch(23131);
    ScaleGizmo.prototype._buildArrow = function (dim) {
        var transform = new Transform();
        __touch(23181);
        if (dim === 0) {
            transform.setRotationXYZ(0, Math.PI / 2, 0);
            __touch(23183);
        } else if (dim === 1) {
            transform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
            __touch(23184);
        }
        this.addRenderable({
            meshData: this._arrowMesh,
            materials: [this._buildMaterialForAxis(dim)],
            transform: transform,
            id: Gizmo.registerHandle({
                type: 'Scale',
                axis: dim
            })
        });
        __touch(23182);
    };
    __touch(23132);
    ScaleGizmo.prototype._buildArrowMesh = function () {
        var meshBuilder = new MeshBuilder();
        __touch(23185);
        var mesh1Data = new Box();
        __touch(23186);
        var mesh2Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
        __touch(23187);
        mesh2Data.getAttributeBuffer(MeshData.POSITION).set([
            0,
            0,
            0,
            0,
            0,
            1
        ]);
        __touch(23188);
        mesh2Data.getIndexBuffer().set([
            0,
            1
        ]);
        __touch(23189);
        mesh2Data.indexLengths = null;
        __touch(23190);
        mesh2Data.indexModes = ['Lines'];
        __touch(23191);
        var transform = new Transform();
        __touch(23192);
        transform.translation.setd(0, 0, 8);
        __touch(23193);
        transform.update();
        __touch(23194);
        meshBuilder.addMeshData(mesh1Data, transform);
        __touch(23195);
        var transform = new Transform();
        __touch(23196);
        transform.scale.setd(1, 1, 8);
        __touch(23197);
        transform.update();
        __touch(23198);
        meshBuilder.addMeshData(mesh2Data, transform);
        __touch(23199);
        var mergedMeshData = meshBuilder.build()[0];
        __touch(23200);
        return mergedMeshData;
        __touch(23201);
    };
    __touch(23133);
    return ScaleGizmo;
    __touch(23134);
});
__touch(23122);