define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(487);
    function CannonTerrainColliderComponent(settings) {
        this.type = 'CannonTerrainColliderComponent';
        __touch(492);
        settings = settings || {
            data: [],
            shapeOptions: {}
        };
        __touch(493);
        this.cannonShape = new CANNON.Heightfield(settings.data, settings.shapeOptions);
        __touch(494);
    }
    __touch(488);
    CannonTerrainColliderComponent.prototype = Object.create(Component.prototype);
    __touch(489);
    CannonTerrainColliderComponent.constructor = CannonTerrainColliderComponent;
    __touch(490);
    return CannonTerrainColliderComponent;
    __touch(491);
});
__touch(486);