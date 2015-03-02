define([
    'goo/renderer/MeshData',
    'goo/math/Vector3',
    'goo/entities/EntityUtils'
], function (MeshData, Vector3, EntityUtils) {
    'use strict';
    __touch(21881);
    function MeshBuilder() {
        this.meshDatas = [];
        __touch(21890);
        this.vertexData = {};
        __touch(21891);
        this.indexData = [];
        __touch(21892);
        this.vertexCounter = 0;
        __touch(21893);
        this.indexCounter = 0;
        __touch(21894);
        this.indexLengths = [];
        __touch(21895);
        this.indexModes = [];
        __touch(21896);
    }
    __touch(21882);
    MeshBuilder.prototype.addEntity = function (entity) {
        entity.traverse(function (entity) {
            if (entity.transformComponent._dirty) {
                entity.transformComponent.updateTransform();
                __touch(21900);
            }
        });
        __touch(21897);
        entity.traverse(function (entity) {
            if (entity.transformComponent._dirty) {
                EntityUtils.updateWorldTransform(entity.transformComponent);
                __touch(21901);
            }
        });
        __touch(21898);
        entity.traverse(function (entity) {
            if (entity.meshDataComponent) {
                this.addMeshData(entity.meshDataComponent.meshData, entity.transformComponent.worldTransform);
                __touch(21902);
            }
        });
        __touch(21899);
    };
    __touch(21883);
    var vert = new Vector3();
    __touch(21884);
    MeshBuilder.prototype.addMeshData = function (meshData, transform) {
        if (meshData.vertexCount >= 65536) {
            throw new Error('Maximum number of vertices for a mesh to add is 65535. Got: ' + meshData.vertexCount);
            __touch(21911);
        } else if (this.vertexCounter + meshData.vertexCount >= 65536) {
            this._generateMesh();
            __touch(21912);
        }
        var matrix = transform.matrix;
        __touch(21903);
        var rotation = transform.rotation;
        __touch(21904);
        var attributeMap = meshData.attributeMap;
        __touch(21905);
        var keys = Object.keys(attributeMap);
        __touch(21906);
        for (var ii = 0, l = keys.length; ii < l; ii++) {
            var key = keys[ii];
            __touch(21913);
            var map = attributeMap[key];
            __touch(21914);
            var attribute = this.vertexData[key];
            __touch(21915);
            if (!attribute) {
                this.vertexData[key] = {};
                __touch(21921);
                attribute = this.vertexData[key];
                __touch(21922);
                attribute.array = [];
                __touch(21923);
                attribute.map = {
                    count: map.count,
                    type: map.type,
                    stride: map.stride,
                    offset: map.offset,
                    normalized: map.normalized
                };
                __touch(21924);
            }
            var view = meshData.getAttributeBuffer(key);
            __touch(21916);
            var viewLength = view.length;
            __touch(21917);
            var array = attribute.array;
            __touch(21918);
            var count = map.count;
            __touch(21919);
            var vertexPos = this.vertexCounter * count;
            __touch(21920);
            if (key === MeshData.POSITION) {
                for (var i = 0; i < viewLength; i += count) {
                    vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                    __touch(21925);
                    matrix.applyPostPoint(vert);
                    __touch(21926);
                    array[vertexPos + i + 0] = vert.data[0];
                    __touch(21927);
                    array[vertexPos + i + 1] = vert.data[1];
                    __touch(21928);
                    array[vertexPos + i + 2] = vert.data[2];
                    __touch(21929);
                }
            } else if (key === MeshData.NORMAL) {
                for (var i = 0; i < viewLength; i += count) {
                    vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                    __touch(21930);
                    rotation.applyPost(vert);
                    __touch(21931);
                    array[vertexPos + i + 0] = vert.data[0];
                    __touch(21932);
                    array[vertexPos + i + 1] = vert.data[1];
                    __touch(21933);
                    array[vertexPos + i + 2] = vert.data[2];
                    __touch(21934);
                }
            } else if (key === MeshData.TANGENT) {
                for (var i = 0; i < viewLength; i += count) {
                    vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                    __touch(21935);
                    rotation.applyPost(vert);
                    __touch(21936);
                    array[vertexPos + i + 0] = vert.data[0];
                    __touch(21937);
                    array[vertexPos + i + 1] = vert.data[1];
                    __touch(21938);
                    array[vertexPos + i + 2] = vert.data[2];
                    __touch(21939);
                    array[vertexPos + i + 3] = view[i + 3];
                    __touch(21940);
                }
            } else {
                for (var i = 0; i < viewLength; i++) {
                    array[vertexPos + i] = view[i];
                    __touch(21941);
                }
            }
        }
        var indices = meshData.getIndexBuffer();
        __touch(21907);
        for (var i = 0, l = meshData.indexCount; i < l; i++) {
            this.indexData[this.indexCounter + i] = indices[i] + this.vertexCounter;
            __touch(21942);
        }
        this.vertexCounter += meshData.vertexCount;
        __touch(21908);
        this.indexCounter += meshData.indexCount;
        __touch(21909);
        if (meshData.indexLengths) {
            this.indexLengths = this.indexLengths.concat(meshData.indexLengths);
            __touch(21943);
        } else {
            this.indexLengths = this.indexLengths.concat(meshData.getIndexBuffer().length);
            __touch(21944);
        }
        this.indexModes = this.indexModes.concat(meshData.indexModes);
        __touch(21910);
    };
    __touch(21885);
    MeshBuilder.prototype._generateMesh = function () {
        var attributeMap = {};
        __touch(21945);
        for (var key in this.vertexData) {
            var data = this.vertexData[key];
            __touch(21965);
            attributeMap[key] = data.map;
            __touch(21966);
        }
        __touch(21946);
        var meshData = new MeshData(attributeMap, this.vertexCounter, this.indexCounter);
        __touch(21947);
        for (var key in this.vertexData) {
            var data = this.vertexData[key].array;
            __touch(21967);
            meshData.getAttributeBuffer(key).set(data);
            __touch(21968);
        }
        __touch(21948);
        meshData.getIndexBuffer().set(this.indexData);
        __touch(21949);
        meshData.indexLengths = this.indexLengths;
        __touch(21950);
        meshData.indexModes = this.indexModes;
        __touch(21951);
        var indexMode = meshData.indexModes[0];
        __touch(21952);
        var indexCount = 0;
        __touch(21953);
        var indexModes = [];
        __touch(21954);
        var indexLengths = [];
        __touch(21955);
        for (var i = 0; i < meshData.indexModes.length; i++) {
            var mode = meshData.indexModes[i];
            __touch(21969);
            if (indexMode !== mode) {
                indexModes.push(indexMode);
                __touch(21971);
                indexLengths.push(indexCount);
                __touch(21972);
                indexMode = mode;
                __touch(21973);
                indexCount = 0;
                __touch(21974);
            }
            indexCount += meshData.indexLengths[i];
            __touch(21970);
            if (i === meshData.indexModes.length - 1) {
                indexModes.push(mode);
                __touch(21975);
                indexLengths.push(indexCount);
                __touch(21976);
                indexMode = mode;
                __touch(21977);
                indexCount = 0;
                __touch(21978);
            }
        }
        meshData.indexLengths = indexLengths;
        __touch(21956);
        meshData.indexModes = indexModes;
        __touch(21957);
        this.meshDatas.push(meshData);
        __touch(21958);
        this.vertexData = {};
        __touch(21959);
        this.indexData = [];
        __touch(21960);
        this.vertexCounter = 0;
        __touch(21961);
        this.indexCounter = 0;
        __touch(21962);
        this.indexLengths = [];
        __touch(21963);
        this.indexModes = [];
        __touch(21964);
    };
    __touch(21886);
    MeshBuilder.prototype.build = function () {
        if (this.vertexCounter > 0) {
            this._generateMesh();
            __touch(21980);
        }
        return this.meshDatas;
        __touch(21979);
    };
    __touch(21887);
    MeshBuilder.prototype.reset = function () {
        this.meshDatas = [];
        __touch(21981);
        this.vertexData = {};
        __touch(21982);
        this.indexData = [];
        __touch(21983);
        this.vertexCounter = 0;
        __touch(21984);
        this.indexCounter = 0;
        __touch(21985);
        this.indexLengths = [];
        __touch(21986);
        this.indexModes = [];
        __touch(21987);
    };
    __touch(21888);
    return MeshBuilder;
    __touch(21889);
});
__touch(21880);