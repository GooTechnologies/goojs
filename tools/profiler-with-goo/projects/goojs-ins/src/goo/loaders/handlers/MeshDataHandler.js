define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/renderer/MeshData',
    'goo/renderer/BufferUtils',
    'goo/util/PromiseUtil',
    'goo/util/ArrayUtil'
], function (ConfigHandler, MeshData, BufferUtils, PromiseUtil, ArrayUtil) {
    'use strict';
    __touch(9184);
    var WEIGHTS_PER_VERT = 4;
    __touch(9185);
    function MeshDataHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9195);
    }
    __touch(9186);
    MeshDataHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9187);
    MeshDataHandler.prototype.constructor = MeshDataHandler;
    __touch(9188);
    ConfigHandler._registerClass('mesh', MeshDataHandler);
    __touch(9189);
    MeshDataHandler.prototype._remove = function (ref) {
        if (this._objects[ref] && this._objects[ref].destroy && this.world.gooRunner) {
            this._objects[ref].destroy(this.world.gooRunner.renderer.context);
            __touch(9197);
        }
        delete this._objects[ref];
        __touch(9196);
    };
    __touch(9190);
    MeshDataHandler.prototype._update = function (ref, config, options) {
        if (!config) {
            this._remove(ref);
            __touch(9200);
            return PromiseUtil.resolve();
            __touch(9201);
        }
        if (this._objects[ref]) {
            return PromiseUtil.resolve(this._objects[ref]);
            __touch(9202);
        }
        var that = this;
        __touch(9198);
        return this.loadObject(config.binaryRef, options).then(function (bindata) {
            if (!bindata) {
                throw new Error('Binary mesh data was empty');
                __touch(9207);
            }
            var meshData = that._createMeshData(config, bindata);
            __touch(9203);
            that._fillMeshData(meshData, config, bindata);
            __touch(9204);
            that._objects[ref] = meshData;
            __touch(9205);
            return meshData;
            __touch(9206);
        });
        __touch(9199);
    };
    __touch(9191);
    MeshDataHandler.prototype._createMeshData = function (config) {
        var skinned = config.type === 'SkinnedMesh';
        __touch(9208);
        var vertexCount = config.vertexCount;
        __touch(9209);
        if (vertexCount === 0) {
            return null;
            __touch(9217);
        }
        var indexCount = 0;
        __touch(9210);
        if (config.indexLengths) {
            indexCount = config.indexLengths.reduce(function (store, val) {
                return store + val;
                __touch(9219);
            });
            __touch(9218);
        } else if (config.indices) {
            indexCount = config.indices.wordLength;
            __touch(9220);
        }
        var typeMatch = {
            'float32': 'Float',
            'uint8': 'UnsignedByte',
            'uint16': 'UnsignedShort',
            'uint32': 'UnsignedInt'
        };
        __touch(9211);
        if (BufferUtils.browserType === 'Trident') {
            typeMatch.uint8 = 'UnsignedShort';
            __touch(9221);
        }
        var attributeMap = {};
        __touch(9212);
        for (var key in config.attributes) {
            var map = config.attributes[key];
            __touch(9222);
            var type = map.value[2];
            __touch(9223);
            attributeMap[key] = MeshData.createAttribute(map.dimensions, typeMatch[type]);
            __touch(9224);
        }
        __touch(9213);
        var meshData = new MeshData(attributeMap, vertexCount, indexCount);
        __touch(9214);
        meshData.type = skinned ? MeshData.SKINMESH : MeshData.MESH;
        __touch(9215);
        return meshData;
        __touch(9216);
    };
    __touch(9192);
    MeshDataHandler.prototype._fillMeshData = function (meshData, config, bindata) {
        var skinned = meshData.type === MeshData.SKINMESH;
        __touch(9225);
        for (var key in config.attributes) {
            if (key === 'JOINTIDS') {
                continue;
                __touch(9233);
            }
            var data = config.attributes[key].value;
            __touch(9231);
            meshData.getAttributeBuffer(key).set(ArrayUtil.getTypedArray(bindata, data));
            __touch(9232);
        }
        __touch(9226);
        if (skinned && config.attributes.JOINTIDS) {
            var buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS);
            __touch(9234);
            var jointData = ArrayUtil.getTypedArray(bindata, config.attributes.JOINTIDS.value);
            __touch(9235);
            var localJointMap = [];
            __touch(9236);
            var localIndex = 0;
            __touch(9237);
            for (var idx = 0; idx < jointData.length; idx++) {
                var jointIndex = jointData[idx];
                __touch(9241);
                if (localJointMap[jointIndex] === undefined) {
                    localJointMap[jointIndex] = localIndex++;
                    __touch(9243);
                }
                buffer.set([localJointMap[jointIndex]], idx);
                __touch(9242);
            }
            var localMap = [];
            __touch(9238);
            for (var jointIndex = 0; jointIndex < localJointMap.length; jointIndex++) {
                var localIndex = localJointMap[jointIndex];
                __touch(9244);
                if (localIndex !== null) {
                    localMap[localIndex] = jointIndex;
                    __touch(9245);
                }
            }
            meshData.paletteMap = localMap;
            __touch(9239);
            meshData.weightsPerVertex = WEIGHTS_PER_VERT;
            __touch(9240);
        }
        meshData.getIndexBuffer().set(ArrayUtil.getTypedArray(bindata, config.indices));
        __touch(9227);
        meshData.indexModes = config.indexModes.slice();
        __touch(9228);
        meshData.indexLengths = config.indexLengths.slice();
        __touch(9229);
        if (config.boundingVolume) {
            if (config.boundingVolume.type === 'BoundingBox') {
                meshData.boundingBox = {
                    min: config.boundingVolume.min,
                    max: config.boundingVolume.max
                };
                __touch(9246);
            } else {
                throw new Error('Bounding volume was not BoundingBox');
                __touch(9247);
            }
        }
        return meshData;
        __touch(9230);
    };
    __touch(9193);
    return MeshDataHandler;
    __touch(9194);
});
__touch(9183);