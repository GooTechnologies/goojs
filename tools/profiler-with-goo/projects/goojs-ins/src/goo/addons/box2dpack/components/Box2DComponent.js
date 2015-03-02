define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(167);
    function Box2DComponent(settings) {
        this.type = 'Box2DComponent';
        __touch(172);
        this.body = null;
        __touch(173);
        this.world = null;
        __touch(174);
        this.mass = 1;
        __touch(175);
        this.settings = settings || {};
        __touch(176);
        this.shape = settings.shape ? settings.shape : 'box';
        __touch(177);
        this.width = settings.width ? settings.width : 1;
        __touch(178);
        this.height = settings.height ? settings.height : 1;
        __touch(179);
        this.radius = settings.radius ? settings.radius : 1;
        __touch(180);
        this.vertices = settings.vertices ? settings.vertices : [
            0,
            1,
            2,
            2,
            0,
            2
        ];
        __touch(181);
        this.movable = settings.movable !== false;
        __touch(182);
        this.friction = settings.friction ? settings.friction : 1;
        __touch(183);
        this.restitution = settings.restitution ? settings.restitution : 0;
        __touch(184);
        this.offsetX = settings.offsetX ? settings.offsetX : 0;
        __touch(185);
        this.offsetY = settings.offsetY ? settings.offsetY : 0;
        __touch(186);
    }
    __touch(168);
    Box2DComponent.prototype = Object.create(Component.prototype);
    __touch(169);
    Box2DComponent.prototype.constructor = Box2DComponent;
    __touch(170);
    return Box2DComponent;
    __touch(171);
});
__touch(166);