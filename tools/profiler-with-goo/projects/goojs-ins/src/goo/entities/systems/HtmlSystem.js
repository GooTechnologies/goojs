define([
    'goo/entities/systems/System',
    'goo/renderer/Renderer',
    'goo/math/Matrix4x4',
    'goo/math/MathUtils',
    'goo/math/Vector3'
], function (System, Renderer, Matrix4x4, MathUtils, Vector3) {
    'use strict';
    __touch(5403);
    function HtmlSystem(renderer) {
        System.call(this, 'HtmlSystem', [
            'TransformComponent',
            'HtmlComponent'
        ]);
        __touch(5412);
        this.renderer = renderer;
        __touch(5413);
    }
    __touch(5404);
    HtmlSystem.prototype = Object.create(System.prototype);
    __touch(5405);
    var MAX_Z_INDEX = 2147483647;
    __touch(5406);
    var tmpVector = new Vector3();
    __touch(5407);
    var prefixes = [
        '',
        '-webkit-',
        '-moz-',
        '-ms-',
        '-o-'
    ];
    __touch(5408);
    var setStyle = function (element, property, style) {
        for (var j = 0; j < prefixes.length; j++) {
            element.style[prefixes[j] + property] = style;
            __touch(5414);
        }
    };
    __touch(5409);
    HtmlSystem.prototype.process = function (entities) {
        if (entities.length === 0) {
            return;
            __touch(5418);
        }
        var camera = Renderer.mainCamera;
        __touch(5415);
        var screenWidth = this.renderer.domElement.width;
        __touch(5416);
        var screenHeight = this.renderer.domElement.height;
        __touch(5417);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5419);
            var component = entity.htmlComponent;
            __touch(5420);
            if (!component.useTransformComponent) {
                component.domElement.style.display = component.hidden ? 'none' : '';
                __touch(5430);
                setStyle(component.domElement, 'transform', '');
                __touch(5431);
                continue;
                __touch(5432);
            }
            if (component.hidden) {
                component.domElement.style.display = 'none';
                __touch(5433);
                continue;
                __touch(5434);
            }
            tmpVector.setv(camera.translation).subv(entity.transformComponent.worldTransform.translation);
            __touch(5421);
            if (camera._direction.dot(tmpVector) > 0) {
                component.domElement.style.display = 'none';
                __touch(5435);
                continue;
                __touch(5436);
            }
            camera.getScreenCoordinates(entity.transformComponent.worldTransform.translation, screenWidth, screenHeight, tmpVector);
            __touch(5422);
            if (tmpVector.z < 0) {
                if (component.hidden !== true) {
                    component.domElement.style.display = 'none';
                    __touch(5438);
                }
                continue;
                __touch(5437);
            }
            component.domElement.style.display = '';
            __touch(5423);
            var renderer = this.renderer;
            __touch(5424);
            var devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
            __touch(5425);
            var fx = Math.floor(tmpVector.x / devicePixelRatio);
            __touch(5426);
            var fy = Math.floor(tmpVector.y / devicePixelRatio);
            __touch(5427);
            setStyle(component.domElement, 'transform', 'translate(-50%, -50%) ' + 'translate(' + fx + 'px, ' + fy + 'px)' + 'translate(' + renderer.domElement.offsetLeft + 'px, ' + renderer.domElement.offsetTop + 'px)');
            __touch(5428);
            component.domElement.style.zIndex = MAX_Z_INDEX - Math.round(tmpVector.z * MAX_Z_INDEX);
            __touch(5429);
        }
    };
    __touch(5410);
    return HtmlSystem;
    __touch(5411);
});
__touch(5402);