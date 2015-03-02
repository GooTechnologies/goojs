define([
    'goo/renderer/SimplePartitioner',
    'goo/renderer/scanline/SoftwareRenderer'
], function (SimplePartitioner, SoftwareRenderer) {
    'use strict';
    __touch(12981);
    function OcclusionPartitioner(parameters) {
        this._viewFrustumCuller = new SimplePartitioner();
        __touch(12989);
        this.occluderList = [];
        __touch(12990);
        this.renderer = new SoftwareRenderer(parameters);
        __touch(12991);
        if (parameters.debugContext !== undefined) {
            this.debugContext = parameters.debugContext;
            __touch(12992);
            this.imagedata = this.debugContext.createImageData(parameters.width, parameters.height);
            __touch(12993);
            this.processFunc = function (camera, entities, renderList) {
                this._viewFrustumCuller.process(camera, entities, renderList);
                __touch(12995);
                this._addVisibleOccluders(renderList);
                __touch(12996);
                this.renderer.render(this.occluderList);
                __touch(12997);
                this.renderer.copyDepthToColor();
                __touch(12998);
                var visibleList = this.renderer.performOcclusionCulling(renderList);
                __touch(12999);
                renderList.length = 0;
                __touch(13000);
                for (var i = 0; i < visibleList.length; i++) {
                    renderList[i] = visibleList[i];
                    __touch(13002);
                }
                this._writeDebugData();
                __touch(13001);
            };
            __touch(12994);
        } else {
            this.processFunc = function (camera, entities, renderList) {
                this._viewFrustumCuller.process(camera, entities, renderList);
                __touch(13004);
                this._addVisibleOccluders(renderList);
                __touch(13005);
                this.renderer.render(this.occluderList);
                __touch(13006);
                var visibleList = this.renderer.performOcclusionCulling(renderList);
                __touch(13007);
                renderList.length = 0;
                __touch(13008);
                for (var i = 0; i < visibleList.length; i++) {
                    renderList[i] = visibleList[i];
                    __touch(13009);
                }
            };
            __touch(13003);
        }
    }
    __touch(12982);
    OcclusionPartitioner.prototype.added = function (entity) {
        this._viewFrustumCuller.added(entity);
        __touch(13010);
    };
    __touch(12983);
    OcclusionPartitioner.prototype.removed = function (entity) {
        this._viewFrustumCuller.added(entity);
        __touch(13011);
    };
    __touch(12984);
    OcclusionPartitioner.prototype.process = function (camera, entities, renderList) {
        this.processFunc(camera, entities, renderList);
        __touch(13012);
    };
    __touch(12985);
    OcclusionPartitioner.prototype._writeDebugData = function () {
        this.imagedata.data.set(this.renderer.getColorData());
        __touch(13013);
        this.debugContext.putImageData(this.imagedata, 0, 0);
        __touch(13014);
    };
    __touch(12986);
    OcclusionPartitioner.prototype._addVisibleOccluders = function (renderList) {
        this.occluderList.length = 0;
        __touch(13015);
        for (var i = 0; i < renderList.length; i++) {
            var entity = renderList[i];
            __touch(13016);
            if (entity.occluderComponent) {
                this.occluderList.push(entity);
                __touch(13017);
            }
        }
    };
    __touch(12987);
    return OcclusionPartitioner;
    __touch(12988);
});
__touch(12980);