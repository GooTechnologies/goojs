define([
    'goo/renderer/BufferData',
    'goo/renderer/Util',
    'goo/renderer/BufferUtils',
    'goo/math/Vector2',
    'goo/math/Vector3',
    'goo/math/Vector4'
], function (BufferData, Util, BufferUtils, Vector2, Vector3, Vector4) {
    'use strict';
    __touch(15920);
    var Uint8ClampedArray = window.Uint8ClampedArray;
    __touch(15921);
    function MeshData(attributeMap, vertexCount, indexCount) {
        this.attributeMap = attributeMap;
        __touch(15971);
        this.vertexCount = vertexCount !== undefined ? vertexCount : 0;
        __touch(15972);
        this.indexCount = indexCount !== undefined ? indexCount : 0;
        __touch(15973);
        this.primitiveCounts = [0];
        __touch(15974);
        this.vertexData = null;
        __touch(15975);
        this.indexData = null;
        __touch(15976);
        this.dataViews = {};
        __touch(15977);
        this.indexLengths = null;
        __touch(15978);
        this.indexModes = ['Triangles'];
        __touch(15979);
        this.type = MeshData.MESH;
        __touch(15980);
        this.rebuildData(this.vertexCount, this.indexCount);
        __touch(15981);
    }
    __touch(15922);
    MeshData.MESH = 0;
    __touch(15923);
    MeshData.SKINMESH = 1;
    __touch(15924);
    MeshData.prototype.rebuildData = function (vertexCount, indexCount, saveOldData) {
        var savedAttributes = {};
        __touch(15982);
        var savedIndices = null;
        __touch(15983);
        if (saveOldData) {
            for (var i in this.attributeMap) {
                var view = this.dataViews[i];
                __touch(15987);
                if (view) {
                    savedAttributes[i] = view;
                    __touch(15988);
                }
            }
            __touch(15986);
            if (this.indexData) {
                savedIndices = this.indexData.data;
                __touch(15989);
            }
        }
        this.rebuildVertexData(vertexCount);
        __touch(15984);
        this.rebuildIndexData(indexCount);
        __touch(15985);
        if (saveOldData) {
            for (var i in this.attributeMap) {
                var saved = savedAttributes[i];
                __touch(15992);
                if (saved) {
                    var view = this.dataViews[i];
                    __touch(15993);
                    view.set(saved);
                    __touch(15994);
                }
            }
            __touch(15990);
            savedAttributes = {};
            __touch(15991);
            if (savedIndices) {
                this.indexData.data.set(savedIndices);
                __touch(15995);
            }
        }
    };
    __touch(15925);
    MeshData.prototype.rebuildVertexData = function (vertexCount) {
        if (!isNaN(vertexCount)) {
            this.vertexCount = vertexCount;
            __touch(15996);
            this._vertexCountStore = this.vertexCount;
            __touch(15997);
        }
        if (this.vertexCount > 0) {
            var vertexByteSize = 0;
            __touch(15998);
            for (var i in this.attributeMap) {
                var attribute = this.attributeMap[i];
                __touch(16002);
                vertexByteSize += Util.getByteSize(attribute.type) * attribute.count;
                __touch(16003);
            }
            __touch(15999);
            this.vertexData = new BufferData(new ArrayBuffer(vertexByteSize * this.vertexCount), 'ArrayBuffer');
            __touch(16000);
            this.generateAttributeData();
            __touch(16001);
        }
    };
    __touch(15926);
    MeshData.prototype.rebuildIndexData = function (indexCount) {
        if (indexCount !== undefined) {
            this.indexCount = indexCount;
            __touch(16004);
        }
        if (this.indexCount > 0) {
            var indices = BufferUtils.createIndexBuffer(this.indexCount, this.vertexCount);
            __touch(16005);
            this.indexData = new BufferData(indices, 'ElementArrayBuffer');
            __touch(16006);
        }
    };
    __touch(15927);
    MeshData.prototype.setVertexDataUpdated = function () {
        this.vertexData._dataNeedsRefresh = true;
        __touch(16007);
    };
    __touch(15928);
    MeshData.prototype.getSectionCount = function () {
        return this.indexLengths ? this.indexLengths.length : 1;
        __touch(16008);
    };
    __touch(15929);
    MeshData.prototype.getPrimitiveCount = function (section) {
        if (section >= 0 && section < this.primitiveCounts.length) {
            return this.primitiveCounts[section];
            __touch(16010);
        }
        return 0;
        __touch(16009);
    };
    __touch(15930);
    MeshData.prototype.getPrimitiveVertices = function (primitiveIndex, section, store) {
        var count = this.getPrimitiveCount(section);
        __touch(16011);
        if (primitiveIndex >= count || primitiveIndex < 0) {
            throw new Error('Invalid primitiveIndex \'' + primitiveIndex + '\'.  Count is ' + count);
            __touch(16018);
        }
        var mode = this.indexModes[section];
        __touch(16012);
        var rSize = MeshData.getVertexCount(mode);
        __touch(16013);
        var result = store || [];
        __touch(16014);
        result.length = rSize;
        __touch(16015);
        var verts = this.getAttributeBuffer(MeshData.POSITION);
        __touch(16016);
        for (var i = 0; i < rSize; i++) {
            if (!result[i]) {
                result[i] = new Vector3();
                __touch(16019);
            }
            if (this.getIndexBuffer()) {
                var vert = this.getIndexBuffer()[this.getVertexIndex(primitiveIndex, i, section)];
                __touch(16020);
                result[i].x = verts[vert * 3 + 0];
                __touch(16021);
                result[i].y = verts[vert * 3 + 1];
                __touch(16022);
                result[i].z = verts[vert * 3 + 2];
                __touch(16023);
            } else {
                var vert = this.getVertexIndex(primitiveIndex, i, section);
                __touch(16024);
                result[i].x = verts[vert * 3 + 0];
                __touch(16025);
                result[i].y = verts[vert * 3 + 1];
                __touch(16026);
                result[i].z = verts[vert * 3 + 2];
                __touch(16027);
            }
        }
        return result;
        __touch(16017);
    };
    __touch(15931);
    MeshData.prototype.getVertexIndex = function (primitiveIndex, point, section) {
        var index = 0;
        __touch(16028);
        for (var i = 0; i < section; i++) {
            index += this.indexLengths[i];
            __touch(16031);
        }
        switch (this.indexModes[section]) {
        case 'Triangles':
            index += primitiveIndex * 3 + point;
            break;
        case 'TriangleStrip':
            index += primitiveIndex + point;
            break;
        case 'TriangleFan':
            if (point === 0) {
                index += 0;
                __touch(16032);
            } else {
                index += primitiveIndex + point;
                __touch(16033);
            }
            break;
        case 'Points':
            index += primitiveIndex;
            break;
        case 'Lines':
            index += primitiveIndex * 2 + point;
            break;
        case 'LineStrip':
        case 'LineLoop':
            index += primitiveIndex + point;
            break;
        default:
            MeshData.logger.warning('unimplemented index mode: ' + this.indexModes[section]);
            return -1;
        }
        __touch(16029);
        return index;
        __touch(16030);
    };
    __touch(15932);
    MeshData.prototype.getTotalPrimitiveCount = function () {
        var count = 0;
        __touch(16034);
        for (var i = 0, max = this.primitiveCounts.length; i < max; i++) {
            count += this.primitiveCounts[i];
            __touch(16036);
        }
        return count;
        __touch(16035);
    };
    __touch(15933);
    MeshData.prototype.updatePrimitiveCounts = function () {
        var maxIndex = this.indexData ? this.indexData.data.length : this.vertexCount;
        __touch(16037);
        var maxSection = this.getSectionCount();
        __touch(16038);
        if (this.primitiveCounts.length !== maxSection) {
            this.primitiveCounts = [];
            __touch(16039);
        }
        for (var i = 0; i < maxSection; i++) {
            var size = this.indexLengths ? this.indexLengths[i] : maxIndex;
            __touch(16040);
            var count = MeshData.getPrimitiveCount(this.indexModes[i], size);
            __touch(16041);
            this.primitiveCounts[i] = count;
            __touch(16042);
        }
    };
    __touch(15934);
    MeshData.getPrimitiveCount = function (indexMode, size) {
        switch (indexMode) {
        case 'Triangles':
            return size / 3;
        case 'TriangleFan':
        case 'TriangleStrip':
            return size - 2;
        case 'Lines':
            return size / 2;
        case 'LineStrip':
            return size - 1;
        case 'LineLoop':
            return size;
        case 'Points':
            return size;
        }
        __touch(16043);
        throw new Error('unimplemented index mode: ' + indexMode);
        __touch(16044);
    };
    __touch(15935);
    MeshData.getVertexCount = function (indexMode) {
        switch (indexMode) {
        case 'Triangles':
        case 'TriangleFan':
        case 'TriangleStrip':
            return 3;
        case 'Lines':
        case 'LineStrip':
        case 'LineLoop':
            return 2;
        case 'Points':
            return 1;
        }
        __touch(16045);
        throw new Error('unimplemented index mode: ' + indexMode);
        __touch(16046);
    };
    __touch(15936);
    var ArrayTypes = {
        Byte: Int8Array,
        UnsignedByte: Uint8Array,
        UnsignedByteClamped: Uint8ClampedArray,
        Short: Int16Array,
        UnsignedShort: Uint16Array,
        Int: Int32Array,
        UnsignedInt: Uint32Array,
        Float: Float32Array
    };
    __touch(15937);
    MeshData.prototype.generateAttributeData = function () {
        var data = this.vertexData.data;
        __touch(16047);
        var view;
        __touch(16048);
        var offset = 0;
        __touch(16049);
        for (var key in this.attributeMap) {
            var attribute = this.attributeMap[key];
            __touch(16051);
            attribute.offset = offset;
            __touch(16052);
            var length = this.vertexCount * attribute.count;
            __touch(16053);
            offset += length * Util.getByteSize(attribute.type);
            __touch(16054);
            var ArrayType = ArrayTypes[attribute.type];
            __touch(16055);
            if (ArrayType) {
                view = new ArrayType(data, attribute.offset, length);
                __touch(16057);
            } else {
                throw 'Unsupported DataType: ' + attribute.type;
                __touch(16058);
            }
            this.dataViews[key] = view;
            __touch(16056);
        }
        __touch(16050);
    };
    __touch(15938);
    MeshData.prototype.makeInterleavedData = function () {
        var stride = 0;
        __touch(16059);
        var offset = 0;
        __touch(16060);
        for (var key in this.attributeMap) {
            var attribute = this.attributeMap[key];
            __touch(16068);
            attribute.offset = stride;
            __touch(16069);
            stride += attribute.count * Util.getByteSize(attribute.type);
            __touch(16070);
        }
        __touch(16061);
        var newVertexData = new BufferData(new ArrayBuffer(stride * this.vertexCount), this.vertexData.target);
        __touch(16062);
        newVertexData._dataUsage = this.vertexData._dataUsage;
        __touch(16063);
        newVertexData._dataNeedsRefresh = true;
        __touch(16064);
        var targetView = new DataView(newVertexData.data);
        __touch(16065);
        for (var key in this.attributeMap) {
            var view = this.dataViews[key];
            __touch(16071);
            var attribute = this.attributeMap[key];
            __touch(16072);
            attribute.stride = stride;
            __touch(16073);
            var offset = attribute.offset;
            __touch(16074);
            var count = attribute.count;
            __touch(16075);
            var size = Util.getByteSize(attribute.type);
            __touch(16076);
            var method = this.getDataMethod(attribute.type);
            __touch(16077);
            var fun = targetView[method];
            __touch(16078);
            for (var i = 0; i < this.vertexCount; i++) {
                for (var j = 0; j < count; j++) {
                    fun.apply(targetView, [
                        offset + stride * i + j * size,
                        view[i * count + j],
                        true
                    ]);
                    __touch(16079);
                }
            }
        }
        __touch(16066);
        this.vertexData = newVertexData;
        __touch(16067);
    };
    __touch(15939);
    MeshData.prototype.getDataMethod = function (type) {
        switch (type) {
        case 'Byte':
            return 'setInt8';
        case 'UnsignedByte':
            return 'setUInt8';
        case 'Short':
            return 'setInt16';
        case 'UnsignedShort':
            return 'setUInt16';
        case 'Int':
            return 'setInt32';
        case 'HalfFloat':
            return 'setInt16';
        case 'Float':
            return 'setFloat32';
        }
        __touch(16080);
    };
    __touch(15940);
    MeshData.prototype.getAttributeBuffer = function (attributeName) {
        return this.dataViews[attributeName];
        __touch(16081);
    };
    __touch(15941);
    MeshData.prototype.getIndexData = function () {
        return this.indexData;
        __touch(16082);
    };
    __touch(15942);
    MeshData.prototype.getIndexBuffer = function () {
        if (this.indexData !== null) {
            return this.indexData.data;
            __touch(16084);
        }
        return null;
        __touch(16083);
    };
    __touch(15943);
    MeshData.prototype.getIndexLengths = function () {
        return this.indexLengths;
        __touch(16085);
    };
    __touch(15944);
    MeshData.prototype.getIndexModes = function () {
        return this.indexModes;
        __touch(16086);
    };
    __touch(15945);
    MeshData.prototype.resetVertexCount = function () {
        this.vertexCount = this._vertexCountStore;
        __touch(16087);
    };
    __touch(15946);
    MeshData.prototype.applyTransform = function (attributeName, transform) {
        var vert = new Vector3();
        __touch(16088);
        var view = this.getAttributeBuffer(attributeName);
        __touch(16089);
        var viewLength = view.length;
        __touch(16090);
        if (attributeName === MeshData.POSITION) {
            for (var i = 0; i < viewLength; i += 3) {
                vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                __touch(16092);
                transform.matrix.applyPostPoint(vert);
                __touch(16093);
                view[i + 0] = vert[0];
                __touch(16094);
                view[i + 1] = vert[1];
                __touch(16095);
                view[i + 2] = vert[2];
                __touch(16096);
            }
        } else if (attributeName === MeshData.NORMAL) {
            for (var i = 0; i < viewLength; i += 3) {
                vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                __touch(16097);
                transform.rotation.applyPost(vert);
                __touch(16098);
                view[i + 0] = vert[0];
                __touch(16099);
                view[i + 1] = vert[1];
                __touch(16100);
                view[i + 2] = vert[2];
                __touch(16101);
            }
        } else if (attributeName === MeshData.TANGENT) {
            for (var i = 0; i < viewLength; i += 3) {
                vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                __touch(16102);
                transform.rotation.applyPost(vert);
                __touch(16103);
                view[i + 0] = vert[0];
                __touch(16104);
                view[i + 1] = vert[1];
                __touch(16105);
                view[i + 2] = vert[2];
                __touch(16106);
            }
        }
        return this;
        __touch(16091);
    };
    __touch(15947);
    MeshData.prototype.applyFunction = function (attributeName, fun) {
        var vert;
        __touch(16107);
        var outVert;
        __touch(16108);
        var view = this.getAttributeBuffer(attributeName);
        __touch(16109);
        var viewLength = view.length;
        __touch(16110);
        var count = this.attributeMap[attributeName].count;
        __touch(16111);
        switch (count) {
        case 1:
            for (var i = 0; i < viewLength; i++) {
                view[i] = fun(view[i]);
                __touch(16114);
            }
            break;
        case 2:
            vert = new Vector2();
            for (var i = 0; i < viewLength; i += 2) {
                vert.setd(view[i + 0], view[i + 1]);
                __touch(16115);
                outVert = fun(vert);
                __touch(16116);
                view[i + 0] = outVert[0];
                __touch(16117);
                view[i + 1] = outVert[1];
                __touch(16118);
            }
            break;
        case 3:
            vert = new Vector3();
            for (var i = 0; i < viewLength; i += 3) {
                vert.setd(view[i + 0], view[i + 1], view[i + 2]);
                __touch(16119);
                outVert = fun(vert);
                __touch(16120);
                view[i + 0] = outVert[0];
                __touch(16121);
                view[i + 1] = outVert[1];
                __touch(16122);
                view[i + 2] = outVert[2];
                __touch(16123);
            }
            break;
        case 4:
            vert = new Vector4();
            for (var i = 0; i < viewLength; i += 4) {
                vert.setd(view[i + 0], view[i + 1], view[i + 2], view[i + 3]);
                __touch(16124);
                outVert = fun(vert);
                __touch(16125);
                view[i + 0] = outVert[0];
                __touch(16126);
                view[i + 1] = outVert[1];
                __touch(16127);
                view[i + 2] = outVert[2];
                __touch(16128);
                view[i + 3] = outVert[3];
                __touch(16129);
            }
            break;
        }
        __touch(16112);
        return this;
        __touch(16113);
    };
    __touch(15948);
    MeshData.prototype.getNormalsMeshData = function (size) {
        if (this.getAttributeBuffer('POSITION') === undefined) {
            return;
            __touch(16139);
        }
        if (this.getAttributeBuffer('NORMAL') === undefined) {
            return;
            __touch(16140);
        }
        size = size !== undefined ? size : 1;
        __touch(16130);
        var verts = [];
        __touch(16131);
        var indices = [];
        __touch(16132);
        var nVertices = this.dataViews.POSITION.length / 3;
        __touch(16133);
        for (var i = 0; i < nVertices; i++) {
            verts.push(this.dataViews.POSITION[i * 3 + 0], this.dataViews.POSITION[i * 3 + 1], this.dataViews.POSITION[i * 3 + 2], this.dataViews.POSITION[i * 3 + 0] + this.dataViews.NORMAL[i * 3 + 0] * size, this.dataViews.POSITION[i * 3 + 1] + this.dataViews.NORMAL[i * 3 + 1] * size, this.dataViews.POSITION[i * 3 + 2] + this.dataViews.NORMAL[i * 3 + 2] * size);
            __touch(16141);
        }
        for (var i = 0; i < nVertices * 2; i += 2) {
            indices.push(i, i + 1);
            __touch(16142);
        }
        var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length, indices.length);
        __touch(16134);
        meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(16135);
        meshData.getIndexBuffer().set(indices);
        __touch(16136);
        meshData.indexModes[0] = 'Lines';
        __touch(16137);
        return meshData;
        __touch(16138);
    };
    __touch(15949);
    MeshData.prototype.buildWireframeData = function () {
        var attributeMap = Util.clone(this.attributeMap);
        __touch(16143);
        var wireframeData = new MeshData(attributeMap, this.vertexCount, 0);
        __touch(16144);
        wireframeData.indexModes[0] = 'Lines';
        __touch(16145);
        var origI = this.getIndexBuffer();
        __touch(16146);
        var getIndex;
        __touch(16147);
        if (origI) {
            getIndex = function (primitiveIndex, point, section) {
                return origI[this.getVertexIndex(primitiveIndex, point, section)];
                __touch(16155);
            }.bind(this);
            __touch(16154);
        } else {
            getIndex = function (primitiveIndex, point, section) {
                return this.getVertexIndex(primitiveIndex, point, section);
                __touch(16157);
            }.bind(this);
            __touch(16156);
        }
        var targetI = [];
        __touch(16148);
        var indexCount = 0;
        __touch(16149);
        this.updatePrimitiveCounts();
        __touch(16150);
        for (var section = 0; section < this.getSectionCount(); section++) {
            var indexMode = this.indexModes[section];
            __touch(16158);
            var primitiveCount = this.getPrimitiveCount(section);
            __touch(16159);
            for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++) {
                switch (indexMode) {
                case 'Triangles':
                case 'TriangleFan':
                case 'TriangleStrip':
                    var i1 = getIndex(primitiveIndex, 0, section);
                    var i2 = getIndex(primitiveIndex, 1, section);
                    var i3 = getIndex(primitiveIndex, 2, section);
                    targetI[indexCount + 0] = i1;
                    targetI[indexCount + 1] = i2;
                    targetI[indexCount + 2] = i2;
                    targetI[indexCount + 3] = i3;
                    targetI[indexCount + 4] = i3;
                    targetI[indexCount + 5] = i1;
                    indexCount += 6;
                    break;
                case 'Lines':
                case 'LineStrip':
                    var i1 = getIndex(primitiveIndex, 0, section);
                    var i2 = getIndex(primitiveIndex, 1, section);
                    targetI[indexCount + 0] = i1;
                    targetI[indexCount + 1] = i2;
                    indexCount += 2;
                    break;
                case 'LineLoop':
                    var i1 = getIndex(primitiveIndex, 0, section);
                    var i2 = getIndex(primitiveIndex, 1, section);
                    if (primitiveIndex === primitiveCount - 1) {
                        i2 = getIndex(0, 0, section);
                        __touch(16161);
                    }
                    targetI[indexCount + 0] = i1;
                    targetI[indexCount + 1] = i2;
                    indexCount += 2;
                    break;
                case 'Points':
                    break;
                }
                __touch(16160);
            }
        }
        if (indexCount > 0) {
            wireframeData.rebuildIndexData(indexCount);
            __touch(16162);
            for (var attribute in attributeMap) {
                wireframeData.getAttributeBuffer(attribute).set(this.getAttributeBuffer(attribute));
                __touch(16165);
            }
            __touch(16163);
            wireframeData.getIndexBuffer().set(targetI);
            __touch(16164);
        }
        wireframeData.paletteMap = this.paletteMap;
        __touch(16151);
        wireframeData.weightsPerVertex = this.weightsPerVertex;
        __touch(16152);
        return wireframeData;
        __touch(16153);
    };
    __touch(15950);
    var v1 = new Vector3();
    __touch(15951);
    var v2 = new Vector3();
    __touch(15952);
    var v3 = new Vector3();
    __touch(15953);
    MeshData.prototype.buildFlatMeshData = function () {
        var oldIdcs = this.getIndexBuffer();
        __touch(16166);
        if (oldIdcs === null) {
            console.debug('No indices, probably a point mesh');
            __touch(16177);
            return this;
            __touch(16178);
        }
        var attributeMap = Util.clone(this.attributeMap);
        __touch(16167);
        var attribs = {};
        __touch(16168);
        for (var key in attributeMap) {
            attribs[key] = {
                oldBuffer: this.getAttributeBuffer(key),
                values: []
            };
            __touch(16179);
        }
        __touch(16169);
        var indexCount = 0;
        __touch(16170);
        this.updatePrimitiveCounts();
        __touch(16171);
        for (var section = 0; section < this.getSectionCount(); section++) {
            var indexMode = this.indexModes[section];
            __touch(16180);
            var primitiveCount = this.getPrimitiveCount(section);
            __touch(16181);
            var flip = false;
            __touch(16182);
            for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++) {
                switch (indexMode) {
                case 'TriangleStrip':
                    flip = primitiveIndex % 2 === 1 ? true : false;
                case 'Triangles':
                case 'TriangleFan':
                    var i1 = oldIdcs[this.getVertexIndex(primitiveIndex, 0, section)];
                    var i2 = oldIdcs[this.getVertexIndex(primitiveIndex, 1, section)];
                    var i3 = oldIdcs[this.getVertexIndex(primitiveIndex, 2, section)];
                    if (flip) {
                        var f = i3;
                        __touch(16184);
                        i3 = i2;
                        __touch(16185);
                        i2 = f;
                        __touch(16186);
                    }
                    for (var key in attribs) {
                        if (key === MeshData.NORMAL) {
                            continue;
                            __touch(16188);
                        }
                        var count = attributeMap[key].count;
                        __touch(16187);
                        for (var i = 0; i < count; i++) {
                            attribs[key].values[indexCount * count + i] = attribs[key].oldBuffer[i1 * count + i];
                            __touch(16189);
                            attribs[key].values[(indexCount + 1) * count + i] = attribs[key].oldBuffer[i2 * count + i];
                            __touch(16190);
                            attribs[key].values[(indexCount + 2) * count + i] = attribs[key].oldBuffer[i3 * count + i];
                            __touch(16191);
                        }
                        if (key === MeshData.POSITION) {
                            v1.setd(attribs[key].values[indexCount * 3], attribs[key].values[indexCount * 3 + 1], attribs[key].values[indexCount * 3 + 2]);
                            __touch(16192);
                            v2.setd(attribs[key].values[(indexCount + 1) * 3], attribs[key].values[(indexCount + 1) * 3 + 1], attribs[key].values[(indexCount + 1) * 3 + 2]);
                            __touch(16193);
                            v3.setd(attribs[key].values[(indexCount + 2) * 3], attribs[key].values[(indexCount + 2) * 3 + 1], attribs[key].values[(indexCount + 2) * 3 + 2]);
                            __touch(16194);
                            v2.subv(v1);
                            __touch(16195);
                            v3.subv(v1);
                            __touch(16196);
                            v2.cross(v3).normalize();
                            __touch(16197);
                            if (attribs[MeshData.NORMAL]) {
                                attribs[MeshData.NORMAL].values[indexCount * 3] = v2.data[0];
                                __touch(16198);
                                attribs[MeshData.NORMAL].values[indexCount * 3 + 1] = v2.data[1];
                                __touch(16199);
                                attribs[MeshData.NORMAL].values[indexCount * 3 + 2] = v2.data[2];
                                __touch(16200);
                                attribs[MeshData.NORMAL].values[(indexCount + 1) * 3] = v2.data[0];
                                __touch(16201);
                                attribs[MeshData.NORMAL].values[(indexCount + 1) * 3 + 1] = v2.data[1];
                                __touch(16202);
                                attribs[MeshData.NORMAL].values[(indexCount + 1) * 3 + 2] = v2.data[2];
                                __touch(16203);
                                attribs[MeshData.NORMAL].values[(indexCount + 2) * 3] = v2.data[0];
                                __touch(16204);
                                attribs[MeshData.NORMAL].values[(indexCount + 2) * 3 + 1] = v2.data[1];
                                __touch(16205);
                                attribs[MeshData.NORMAL].values[(indexCount + 2) * 3 + 2] = v2.data[2];
                                __touch(16206);
                            }
                        }
                    }
                    indexCount += 3;
                }
                __touch(16183);
            }
        }
        if (indexCount === 0) {
            console.warn('Could not build flat data');
            __touch(16207);
            return this;
            __touch(16208);
        }
        var flatMeshData = new MeshData(attributeMap, indexCount);
        __touch(16172);
        for (var key in attribs) {
            flatMeshData.getAttributeBuffer(key).set(attribs[key].values);
            __touch(16209);
        }
        __touch(16173);
        flatMeshData.paletteMap = this.paletteMap;
        __touch(16174);
        flatMeshData.weightPerVertex = this.weightsPerVertex;
        __touch(16175);
        return flatMeshData;
        __touch(16176);
    };
    __touch(15954);
    MeshData.prototype.destroy = function (context) {
        this.vertexData.destroy(context);
        __touch(16210);
        this.indexData.destroy(context);
        __touch(16211);
    };
    __touch(15955);
    MeshData.POSITION = 'POSITION';
    __touch(15956);
    MeshData.NORMAL = 'NORMAL';
    __touch(15957);
    MeshData.COLOR = 'COLOR';
    __touch(15958);
    MeshData.TANGENT = 'TANGENT';
    __touch(15959);
    MeshData.TEXCOORD0 = 'TEXCOORD0';
    __touch(15960);
    MeshData.TEXCOORD1 = 'TEXCOORD1';
    __touch(15961);
    MeshData.TEXCOORD2 = 'TEXCOORD2';
    __touch(15962);
    MeshData.TEXCOORD3 = 'TEXCOORD3';
    __touch(15963);
    MeshData.WEIGHTS = 'WEIGHTS';
    __touch(15964);
    MeshData.JOINTIDS = 'JOINTIDS';
    __touch(15965);
    MeshData.createAttribute = function (count, type, normalized) {
        return {
            count: count,
            type: type,
            stride: 0,
            offset: 0,
            normalized: normalized !== undefined ? normalized : false
        };
        __touch(16212);
    };
    __touch(15966);
    var defaults = {
        'POSITION': MeshData.createAttribute(3, 'Float'),
        'NORMAL': MeshData.createAttribute(3, 'Float'),
        'COLOR': MeshData.createAttribute(4, 'Float'),
        'TANGENT': MeshData.createAttribute(4, 'Float'),
        'TEXCOORD0': MeshData.createAttribute(2, 'Float'),
        'TEXCOORD1': MeshData.createAttribute(2, 'Float'),
        'TEXCOORD2': MeshData.createAttribute(2, 'Float'),
        'TEXCOORD3': MeshData.createAttribute(2, 'Float'),
        'WEIGHTS': MeshData.createAttribute(4, 'Float'),
        'JOINTIDS': MeshData.createAttribute(4, 'Float')
    };
    __touch(15967);
    function buildMap(types) {
        var map = {};
        __touch(16213);
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            __touch(16215);
            if (defaults[type] !== undefined) {
                map[type] = Util.clone(defaults[type]);
                __touch(16216);
            } else {
                throw 'No default attribute named: ' + type;
                __touch(16217);
            }
        }
        return map;
        __touch(16214);
    }
    __touch(15968);
    MeshData.defaultMap = function (types) {
        if (types === undefined) {
            return buildMap(Object.keys(defaults));
            __touch(16218);
        } else {
            return buildMap(types);
            __touch(16219);
        }
    };
    __touch(15969);
    return MeshData;
    __touch(15970);
});
__touch(15919);