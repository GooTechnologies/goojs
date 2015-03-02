define([
    'goo/entities/systems/System',
    'goo/renderer/Renderer',
    'goo/math/Matrix4x4',
    'goo/math/MathUtils',
    'goo/math/Vector3'
], function (System, Renderer, Matrix4x4, MathUtils, Vector3) {
    'use strict';
    __touch(5288);
    function CSSTransformSystem(renderer) {
        System.call(this, 'CSSTransformSystem', [
            'TransformComponent',
            'CSSTransformComponent'
        ]);
        __touch(5300);
        this.renderer = renderer;
        __touch(5301);
        if (document.querySelector) {
            this.viewDom = document.querySelector('#view');
            __touch(5302);
            this.containerDom = document.querySelector('#cam1');
            __touch(5303);
            this.containerDom2 = document.querySelector('#cam2');
            __touch(5304);
        }
    }
    __touch(5289);
    var tmpMatrix = new Matrix4x4();
    __touch(5290);
    var tmpMatrix2 = new Matrix4x4();
    __touch(5291);
    var tmpVector = new Vector3();
    __touch(5292);
    CSSTransformSystem.prototype = Object.create(System.prototype);
    __touch(5293);
    var epsilon = function (value) {
        return Math.abs(value) < 0.000001 ? 0 : value;
        __touch(5305);
    };
    __touch(5294);
    var prefixes = [
        '',
        '-webkit-',
        '-moz-',
        '-ms-',
        '-o-'
    ];
    __touch(5295);
    var setStyle = function (element, property, style) {
        for (var j = 0; j < prefixes.length; j++) {
            element.style[prefixes[j] + property] = style;
            __touch(5306);
        }
    };
    __touch(5296);
    var getCSSMatrix = function (matrix) {
        var elements = matrix.data;
        __touch(5307);
        return 'matrix3d(' + epsilon(elements[0]) + ',' + epsilon(-elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' + epsilon(elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(elements[6]) + ',' + epsilon(elements[7]) + ',' + epsilon(elements[8]) + ',' + epsilon(-elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' + epsilon(elements[12]) + ',' + epsilon(-elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
        __touch(5308);
    };
    __touch(5297);
    CSSTransformSystem.prototype.process = function (entities) {
        if (entities.length === 0) {
            return;
            __touch(5323);
        }
        var camera = Renderer.mainCamera;
        __touch(5309);
        if (!camera) {
            return;
            __touch(5324);
        }
        var fov = 0.5 / Math.tan(MathUtils.DEG_TO_RAD * camera.fov * 0.5) * this.renderer.domElement.offsetHeight;
        __touch(5310);
        setStyle(this.viewDom, 'perspective', fov + 'px');
        __touch(5311);
        tmpMatrix.copy(camera.getViewInverseMatrix());
        __touch(5312);
        tmpMatrix2.copy(tmpMatrix);
        __touch(5313);
        tmpMatrix.invert();
        __touch(5314);
        tmpMatrix.setTranslation(new Vector3(0, 0, fov));
        __touch(5315);
        var style = getCSSMatrix(tmpMatrix);
        __touch(5316);
        setStyle(this.containerDom, 'transform', style);
        __touch(5317);
        tmpMatrix2.e03 = -tmpMatrix2.e03;
        __touch(5318);
        tmpMatrix2.e23 = -tmpMatrix2.e23;
        __touch(5319);
        tmpMatrix2.setRotationFromVector(new Vector3(0, 0, 0));
        __touch(5320);
        style = getCSSMatrix(tmpMatrix2);
        __touch(5321);
        setStyle(this.containerDom2, 'transform', style);
        __touch(5322);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5325);
            var component = entity.getComponent('CSSTransformComponent');
            __touch(5326);
            var domElement = component.domElement;
            __touch(5327);
            var scale = component.scale;
            __touch(5328);
            scale = [
                scale,
                -scale,
                scale
            ].join(',');
            __touch(5329);
            if (component.faceCamera) {
                entity.transformComponent.worldTransform.matrix.getTranslation(tmpVector);
                __touch(5332);
                tmpMatrix.copy(camera.getViewInverseMatrix());
                __touch(5333);
                tmpMatrix.setTranslation(tmpVector);
                __touch(5334);
            } else {
                tmpMatrix.copy(entity.transformComponent.worldTransform.matrix);
                __touch(5335);
            }
            style = 'translate3d(-50%,-50%,0) ' + getCSSMatrix(tmpMatrix) + 'scale3d(' + scale + ')';
            __touch(5330);
            setStyle(domElement, 'transform', style);
            __touch(5331);
            if (domElement.parentNode !== this.containerDom2) {
                this.containerDom2.appendChild(domElement);
                __touch(5336);
            }
        }
    };
    __touch(5298);
    return CSSTransformSystem;
    __touch(5299);
});
__touch(5287);