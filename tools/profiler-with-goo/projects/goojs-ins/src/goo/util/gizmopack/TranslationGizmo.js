define([
    'goo/util/gizmopack/Gizmo',
    'goo/renderer/MeshData',
    'goo/util/MeshBuilder',
    'goo/shapes/Disk',
    'goo/shapes/Quad',
    'goo/math/Transform',
    'goo/renderer/Renderer'
], function (Gizmo, MeshData, MeshBuilder, Disk, Quad, Transform, Renderer) {
    'use strict';
    __touch(23203);
    function TranslationGizmo() {
        Gizmo.call(this, 'TranslationGizmo');
        __touch(23214);
        this._quadMesh = new Quad(2, 2);
        __touch(23215);
        this._arrowMesh = this._buildArrowMesh();
        __touch(23216);
        this._buildArrow(0);
        __touch(23217);
        this._buildArrow(1);
        __touch(23218);
        this._buildArrow(2);
        __touch(23219);
    }
    __touch(23204);
    TranslationGizmo.prototype = Object.create(Gizmo.prototype);
    __touch(23205);
    TranslationGizmo.prototype.activate = function (props) {
        Gizmo.prototype.activate.call(this, props);
        __touch(23220);
        this._setPlane();
        __touch(23221);
        if (this._activeHandle.type === 'Axis') {
            this._setLine();
            __touch(23222);
        }
    };
    __touch(23206);
    TranslationGizmo.prototype.process = function () {
        var op = this._mouse.oldPosition;
        __touch(23223);
        var p = this._mouse.position;
        __touch(23224);
        Renderer.mainCamera.getPickRay(op[0], op[1], 1, 1, this._oldRay);
        __touch(23225);
        Renderer.mainCamera.getPickRay(p[0], p[1], 1, 1, this._newRay);
        __touch(23226);
        if (this._activeHandle.type === 'Plane') {
            this._moveOnPlane();
            __touch(23231);
        } else if (this._activeHandle.type === 'Axis') {
            this._moveOnLine();
            __touch(23232);
        }
        op[0] = p[0];
        __touch(23227);
        op[1] = p[1];
        __touch(23228);
        this.updateTransforms();
        __touch(23229);
        this.dirty = false;
        __touch(23230);
        if (this.onChange instanceof Function) {
            this.onChange(this.transform.translation);
            __touch(23233);
        }
    };
    __touch(23207);
    TranslationGizmo.prototype.copyTransform = function (transform, global) {
        Gizmo.prototype.copyTransform.call(this, transform);
        __touch(23234);
        if (transform && global) {
            this.transform.rotation.setIdentity();
            __touch(23235);
            this.updateTransforms();
            __touch(23236);
        }
    };
    __touch(23208);
    TranslationGizmo.prototype._moveOnPlane = function () {
        var oldWorldPos = this._v0, worldPos = this._v1, moveVector = this._result;
        __touch(23237);
        this._plane.rayIntersect(this._oldRay, oldWorldPos, true);
        __touch(23238);
        this._plane.rayIntersect(this._newRay, worldPos, true);
        __touch(23239);
        moveVector.setv(worldPos).subv(oldWorldPos);
        __touch(23240);
        this.transform.translation.add(moveVector);
        __touch(23241);
    };
    __touch(23209);
    TranslationGizmo.prototype._moveOnLine = function () {
        var oldWorldPos = this._v0, worldPos = this._v1, moveVector = this._result, line = this._line;
        __touch(23242);
        this._plane.rayIntersect(this._oldRay, oldWorldPos, true);
        __touch(23243);
        this._plane.rayIntersect(this._newRay, worldPos, true);
        __touch(23244);
        moveVector.setv(worldPos).subv(oldWorldPos);
        __touch(23245);
        var d = moveVector.dot(line);
        __touch(23246);
        moveVector.setv(line).muld(d, d, d);
        __touch(23247);
        this.transform.translation.addv(moveVector);
        __touch(23248);
    };
    __touch(23210);
    TranslationGizmo.prototype._buildArrow = function (dim) {
        var arrowTransform = new Transform();
        __touch(23249);
        var quadTransform = new Transform();
        __touch(23250);
        var size = 1;
        __touch(23251);
        quadTransform.scale.setd(size, size, size);
        __touch(23252);
        if (dim === 2) {
            quadTransform.translation.setd(size, size, 0);
            __touch(23255);
        } else if (dim === 0) {
            quadTransform.translation.setd(0, size, size);
            __touch(23256);
            quadTransform.setRotationXYZ(0, Math.PI / 2, 0);
            __touch(23257);
            arrowTransform.setRotationXYZ(0, Math.PI / 2, 0);
            __touch(23258);
        } else if (dim === 1) {
            quadTransform.translation.setd(size, 0, size);
            __touch(23259);
            quadTransform.setRotationXYZ(Math.PI / 2, 0, 0);
            __touch(23260);
            arrowTransform.setRotationXYZ(Math.PI * 3 / 2, 0, 0);
            __touch(23261);
        }
        this.addRenderable({
            meshData: this._arrowMesh,
            materials: [this._buildMaterialForAxis(dim)],
            transform: arrowTransform,
            id: Gizmo.registerHandle({
                type: 'Axis',
                axis: dim
            }),
            thickness: 0.6
        });
        __touch(23253);
        this.addRenderable({
            meshData: this._quadMesh,
            materials: [this._buildMaterialForAxis(dim, 0.6)],
            transform: quadTransform,
            id: Gizmo.registerHandle({
                type: 'Plane',
                axis: dim
            })
        });
        __touch(23254);
    };
    __touch(23211);
    TranslationGizmo.prototype._buildArrowMesh = function () {
        var meshBuilder = new MeshBuilder();
        __touch(23262);
        var mesh1Data = new Disk(32, 0.6, 2.3);
        __touch(23263);
        var mesh2Data = new Disk(32, 0.6);
        __touch(23264);
        var mesh3Data = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 2, 2);
        __touch(23265);
        mesh3Data.getAttributeBuffer(MeshData.POSITION).set([
            0,
            0,
            0,
            0,
            0,
            7
        ]);
        __touch(23266);
        mesh3Data.getIndexBuffer().set([
            0,
            1
        ]);
        __touch(23267);
        mesh3Data.indexLengths = null;
        __touch(23268);
        mesh3Data.indexModes = ['Lines'];
        __touch(23269);
        var transform = new Transform();
        __touch(23270);
        transform.translation.setd(0, 0, 7);
        __touch(23271);
        transform.update();
        __touch(23272);
        meshBuilder.addMeshData(mesh1Data, transform);
        __touch(23273);
        transform.setRotationXYZ(0, Math.PI, 0);
        __touch(23274);
        transform.update();
        __touch(23275);
        meshBuilder.addMeshData(mesh2Data, transform);
        __touch(23276);
        var transform = new Transform();
        __touch(23277);
        transform.update();
        __touch(23278);
        meshBuilder.addMeshData(mesh3Data, transform);
        __touch(23279);
        var mergedMeshData = meshBuilder.build()[0];
        __touch(23280);
        return mergedMeshData;
        __touch(23281);
    };
    __touch(23212);
    return TranslationGizmo;
    __touch(23213);
});
__touch(23202);