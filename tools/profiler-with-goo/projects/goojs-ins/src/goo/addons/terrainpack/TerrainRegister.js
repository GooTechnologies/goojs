define([
    'goo/scripts/Scripts',
    'goo/addons/terrainpack/Forrest',
    'goo/addons/terrainpack/Terrain',
    'goo/addons/terrainpack/TerrainHandler',
    'goo/addons/terrainpack/Vegetation'
], function (Scripts) {
    'use strict';
    __touch(1501);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/terrainpack/Forrest',
        'goo/addons/terrainpack/Terrain',
        'goo/addons/terrainpack/TerrainHandler',
        'goo/addons/terrainpack/Vegetation'
    ];
    __touch(1502);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(1503);
        Scripts.addClass(name, arguments[i]);
        __touch(1504);
    }
});
__touch(1500);