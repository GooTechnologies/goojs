define(['goo/picking/BoundingTree'], function (BoundingTree) {
    'use strict';
    __touch(15253);
    function PrimitivePickLogic() {
    }
    __touch(15254);
    PrimitivePickLogic.prototype.getPickResult = function (pickRay, entity) {
        var tree = entity.meshDataComponent.meshData.__boundingTree;
        __touch(15261);
        if (!tree) {
            return null;
            __touch(15263);
        }
        return tree.findPick(pickRay, entity, {});
        __touch(15262);
    };
    __touch(15255);
    PrimitivePickLogic.prototype.added = function (entity) {
        if (!this.isConstructed(entity)) {
            this.rebuild(entity);
            __touch(15264);
        }
    };
    __touch(15256);
    PrimitivePickLogic.prototype.removed = function (entity) {
        if (entity.meshDataComponent && entity.meshDataComponent.meshData) {
            entity.meshDataComponent.meshData.__boundingTree = null;
            __touch(15265);
        }
    };
    __touch(15257);
    PrimitivePickLogic.prototype.isConstructed = function (entity) {
        return !!entity.meshDataComponent.meshData.__boundingTree;
        __touch(15266);
    };
    __touch(15258);
    PrimitivePickLogic.prototype.rebuild = function (entity) {
        entity.meshDataComponent.meshData.__boundingTree = new BoundingTree();
        __touch(15267);
        entity.meshDataComponent.meshData.__boundingTree.construct(entity);
        __touch(15268);
    };
    __touch(15259);
    return PrimitivePickLogic;
    __touch(15260);
});
__touch(15252);