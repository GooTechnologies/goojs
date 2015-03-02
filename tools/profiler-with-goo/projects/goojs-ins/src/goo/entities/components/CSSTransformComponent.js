define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(4666);
    function CSSTransformComponent(domElement, faceCamera) {
        Component.call(this);
        __touch(4670);
        this.type = 'CSSTransformComponent';
        __touch(4671);
        this.domElement = domElement;
        __touch(4672);
        this.scale = 1;
        __touch(4673);
        this.faceCamera = typeof faceCamera === 'undefined' ? false : faceCamera;
        __touch(4674);
    }
    __touch(4667);
    CSSTransformComponent.prototype = Object.create(Component.prototype);
    __touch(4668);
    return CSSTransformComponent;
    __touch(4669);
});
__touch(4665);