define([
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere',
    'goo/math/Vector3'
], function (BoundingBox, BoundingSphere, Vector3) {
    'use strict';
    __touch(15171);
    function BoundingTree(boundType) {
        this.leftTree = null;
        __touch(15182);
        this.rightTree = null;
        __touch(15183);
        this.localBound = null;
        __touch(15184);
        this.worldBound = null;
        __touch(15185);
        this.boundType = boundType ? boundType : BoundingTree.BOUNDTYPE_BOX;
        __touch(15186);
    }
    __touch(15172);
    BoundingTree.BOUNDTYPE_SPHERE = 'sphere';
    __touch(15173);
    BoundingTree.BOUNDTYPE_BOX = 'box';
    __touch(15174);
    BoundingTree.MAX_PRIMITIVES_PER_LEAF = 16;
    __touch(15175);
    BoundingTree.prototype.construct = function (entity) {
        if (!entity.meshRendererComponent || !entity.meshDataComponent || !entity.transformComponent) {
            console.warn('Entity missing required components for boundingtree construction: ', entity);
            __touch(15189);
            return;
            __touch(15190);
        }
        var meshData = entity.meshDataComponent.meshData;
        __touch(15187);
        meshData.updatePrimitiveCounts();
        __touch(15188);
        if (meshData.getSectionCount() === 1) {
            this.primitiveIndices = [];
            __touch(15191);
            for (var i = 0, max = meshData.getPrimitiveCount(0); i < max; i++) {
                this.primitiveIndices.push(i);
                __touch(15193);
            }
            this.createTree(entity, 0, 0, this.primitiveIndices.length);
            __touch(15192);
        } else {
            this.split(entity, 0, meshData.getSectionCount());
            __touch(15194);
        }
    };
    __touch(15176);
    BoundingTree.prototype.createTree = function (entity, section, start, end) {
        var meshData = entity.meshDataComponent.meshData;
        __touch(15195);
        this.section = section;
        __touch(15196);
        this.start = start;
        __touch(15197);
        this.end = end;
        __touch(15198);
        if (!this.primitiveIndices) {
            return;
            __touch(15205);
        }
        this.createBounds();
        __touch(15199);
        this.localBound.computeFromPrimitives(meshData, section, this.primitiveIndices, start, end);
        __touch(15200);
        if (end - start + 1 <= BoundingTree.MAX_PRIMITIVES_PER_LEAF) {
            return;
            __touch(15206);
        }
        if (!this.leftTree) {
            this.leftTree = new BoundingTree(this.boundType);
            __touch(15207);
        }
        this.leftTree.primitiveIndices = this.primitiveIndices;
        __touch(15201);
        this.leftTree.createTree(entity, section, start, Math.floor((start + end) / 2));
        __touch(15202);
        if (!this.rightTree) {
            this.rightTree = new BoundingTree(this.boundType);
            __touch(15208);
        }
        this.rightTree.primitiveIndices = this.primitiveIndices;
        __touch(15203);
        this.rightTree.createTree(entity, section, Math.floor((start + end) / 2), end);
        __touch(15204);
    };
    __touch(15177);
    BoundingTree.prototype.split = function (entity, sectionStart, sectionEnd) {
        var rangeSize = sectionEnd - sectionStart;
        __touch(15209);
        var halfRange = Math.floor(rangeSize / 2);
        __touch(15210);
        if (halfRange === 1) {
            var section = sectionStart;
            __touch(15214);
            this.leftTree = new BoundingTree(this.boundType);
            __touch(15215);
            this.leftTree.primitiveIndices = [];
            __touch(15216);
            for (var i = 0; i < this.leftTree.primitiveIndices.length; i++) {
                this.leftTree.primitiveIndices.push(i);
                __touch(15218);
            }
            this.leftTree.createTree(entity, section, 0, this.leftTree.primitiveIndices.length);
            __touch(15217);
        } else {
            this.leftTree = new BoundingTree(this.boundType);
            __touch(15219);
            this.leftTree.split(entity, sectionStart, sectionStart + halfRange);
            __touch(15220);
        }
        if (rangeSize - halfRange === 1) {
            var section = sectionStart + 1;
            __touch(15221);
            this.rightTree = new BoundingTree(this.boundType);
            __touch(15222);
            this.rightTree._primitiveIndices = [];
            __touch(15223);
            for (var i = 0; i < this.rightTree.primitiveIndices.length; i++) {
                this.rightTree.primitiveIndices.push(i);
                __touch(15225);
            }
            this.rightTree.createTree(entity, section, 0, this.rightTree.primitiveIndices.length);
            __touch(15224);
        } else {
            this.rightTree = new BoundingTree(this.boundType);
            __touch(15226);
            this.rightTree.split(entity, sectionStart + halfRange, sectionEnd);
            __touch(15227);
        }
        this.localBound = this.leftTree.localBound.clone(this.localBound);
        __touch(15211);
        this.localBound.merge(this.rightTree.localBound);
        __touch(15212);
        this.worldBound = this.localBound.clone(this.worldBound);
        __touch(15213);
    };
    __touch(15178);
    BoundingTree.prototype.createBounds = function () {
        switch (this.boundType) {
        case BoundingTree.BOUNDTYPE_BOX:
            this.localBound = new BoundingBox();
            this.worldBound = new BoundingBox();
            break;
        case BoundingTree.BOUNDTYPE_SPHERE:
            this.localBound = new BoundingSphere();
            this.worldBound = new BoundingSphere();
            break;
        default:
            break;
        }
        __touch(15228);
    };
    __touch(15179);
    BoundingTree.prototype.findPick = function (ray, entity, store) {
        var result = store;
        __touch(15229);
        if (!result) {
            result = {};
            __touch(15233);
        }
        var worldTransform = entity.transformComponent.worldTransform;
        __touch(15230);
        this.localBound.transform(worldTransform, this.worldBound);
        __touch(15231);
        if (!this.worldBound.intersectsRay(ray)) {
            return result;
            __touch(15234);
        }
        if (this.leftTree) {
            this.leftTree.findPick(ray, entity, result);
            __touch(15235);
        }
        if (this.rightTree) {
            this.rightTree.findPick(ray, entity, result);
            __touch(15236);
        } else if (!this.leftTree) {
            var data = entity.meshDataComponent.meshData;
            __touch(15237);
            var vertices = null;
            __touch(15238);
            var vecStore = new Vector3();
            __touch(15239);
            for (var i = this.start; i < this.end; i++) {
                vertices = data.getPrimitiveVertices(this.primitiveIndices[i], this.section, vertices);
                __touch(15240);
                for (var t = 0; t < vertices.length; t++) {
                    worldTransform.matrix.applyPostPoint(vertices[t]);
                    __touch(15241);
                }
                if (ray.intersects(vertices, false, vecStore)) {
                    result.distances = result.distances || [];
                    __touch(15242);
                    result.distances.push(ray.origin.distance(vecStore));
                    __touch(15243);
                    result.points = result.points || [];
                    __touch(15244);
                    var vec = new Vector3();
                    __touch(15245);
                    vec.setv(vecStore);
                    __touch(15246);
                    result.points.push(vec);
                    __touch(15247);
                    result.vertices = result.vertices || [];
                    __touch(15248);
                    var verticesCopy = [];
                    __touch(15249);
                    for (var copyIndex = vertices.length - 1; copyIndex >= 0; copyIndex--) {
                        verticesCopy[copyIndex] = new Vector3().setv(vertices[copyIndex]);
                        __touch(15251);
                    }
                    result.vertices.push(verticesCopy);
                    __touch(15250);
                }
            }
        }
        return result;
        __touch(15232);
    };
    __touch(15180);
    return BoundingTree;
    __touch(15181);
});
__touch(15170);