define([
    'goo/shapes/Box',
    'goo/shapes/Quad',
    'goo/shapes/Sphere',
    'goo/shapes/Cylinder',
    'goo/shapes/Torus',
    'goo/shapes/Disk',
    'goo/shapes/Cone'
], function (Box, Quad, Sphere, Cylinder, Torus, Disk, Cone) {
    'use strict';
    __touch(22239);
    function ShapeCreatorMemoized() {
    }
    __touch(22240);
    var _cache = {};
    __touch(22241);
    function computeHash(name, options) {
        var keys = Object.keys(options);
        __touch(22253);
        var optionsStr = keys.map(function (key) {
            return key + '' + options[key];
            __touch(22256);
        }).join('');
        __touch(22254);
        return name + optionsStr;
        __touch(22255);
    }
    __touch(22242);
    function cacheOrCreate(name, options, createShape) {
        var hash = computeHash(name, options);
        __touch(22257);
        if (_cache[hash]) {
            return _cache[hash];
            __touch(22258);
        } else {
            var shape = createShape();
            __touch(22259);
            _cache[hash] = shape;
            __touch(22260);
            return shape;
            __touch(22261);
        }
    }
    __touch(22243);
    ShapeCreatorMemoized.createQuad = function (options, oldMeshData) {
        var width = 1, height = 1, tileX = 1, tileY = 1;
        __touch(22262);
        if (!oldMeshData || width !== oldMeshData.xExtent || height !== oldMeshData.yExtent || tileX !== oldMeshData.tileX || tileY !== oldMeshData.tileY) {
            return cacheOrCreate('quad', {}, function () {
                return new Quad(width, height, tileX, tileY);
                __touch(22264);
            });
            __touch(22263);
        } else {
            return oldMeshData;
            __touch(22265);
        }
    };
    __touch(22244);
    ShapeCreatorMemoized.createBox = function (options, oldMeshData) {
        options = options || {};
        __touch(22266);
        options.textureMode = options.textureMode || 'Uniform';
        __touch(22267);
        var width = 1, height = 1, length = 1, tileX = 1, tileY = 1;
        __touch(22268);
        if (!oldMeshData || width !== oldMeshData.xExtent || height !== oldMeshData.yExtent || length !== oldMeshData.zExtent || tileX !== oldMeshData.tileX || tileY !== oldMeshData.tileY || options.textureMode !== oldMeshData.textureMode.name) {
            return cacheOrCreate('box', options, function () {
                return new Box(width, height, length, tileX, tileY, options.textureMode);
                __touch(22270);
            });
            __touch(22269);
        } else {
            return oldMeshData;
            __touch(22271);
        }
    };
    __touch(22245);
    ShapeCreatorMemoized.createSphere = function (options, oldMeshData) {
        options = options || {};
        __touch(22272);
        options.zSamples = options.zSamples || 8;
        __touch(22273);
        options.radialSamples = options.radialSamples || 8;
        __touch(22274);
        options.textureMode = options.textureMode || 'Projected';
        __touch(22275);
        var radius = 1;
        __touch(22276);
        if (!oldMeshData || options.zSamples !== oldMeshData.zSamples - 1 || options.radialSamples !== oldMeshData.radialSamples || options.textureMode !== oldMeshData.textureMode.name || radius !== oldMeshData.radius) {
            return cacheOrCreate('sphere', options, function () {
                return new Sphere(options.zSamples, options.radialSamples, radius, options.textureMode);
                __touch(22278);
            });
            __touch(22277);
        } else {
            return oldMeshData;
            __touch(22279);
        }
    };
    __touch(22246);
    ShapeCreatorMemoized.createCylinder = function (options, oldMeshData) {
        options = options || {};
        __touch(22280);
        options.radialSamples = options.radialSamples || 8;
        __touch(22281);
        var radius = 1;
        __touch(22282);
        if (!oldMeshData || options.radialSamples !== oldMeshData.radialSamples || radius !== oldMeshData.radius) {
            return cacheOrCreate('cylinder', options, function () {
                return new Cylinder(options.radialSamples, radius);
                __touch(22284);
            });
            __touch(22283);
        } else {
            return oldMeshData;
            __touch(22285);
        }
    };
    __touch(22247);
    ShapeCreatorMemoized.createTorus = function (options, oldMeshData) {
        options = options || {};
        __touch(22286);
        options.radialSamples = options.radialSamples || 8;
        __touch(22287);
        options.circleSamples = options.circleSamples || 12;
        __touch(22288);
        options.tubeRadius = options.tubeRadius || 0.2;
        __touch(22289);
        var centerRadius = 1;
        __touch(22290);
        if (!oldMeshData || options.radialSamples !== oldMeshData._radialSamples || options.circleSamples !== oldMeshData._circleSamples || options.tubeRadius !== oldMeshData._tubeRadius || centerRadius !== oldMeshData._centerRadius) {
            return new Torus(options.circleSamples, options.radialSamples, options.tubeRadius, centerRadius);
            __touch(22291);
        } else {
            return oldMeshData;
            __touch(22292);
        }
    };
    __touch(22248);
    ShapeCreatorMemoized.createDisk = function (options, oldMeshData) {
        options = options || {};
        __touch(22293);
        options.radialSamples = options.radialSamples || 8;
        __touch(22294);
        options.pointiness = typeof options.pointiness === 'undefined' ? 0 : options.pointiness;
        __touch(22295);
        var radius = 1;
        __touch(22296);
        if (!oldMeshData || options.radialSamples !== oldMeshData.nSegments || options.pointiness !== oldMeshData.pointiness || radius !== oldMeshData.radius) {
            if (options.pointiness === Math.floor(options.pointiness)) {
                return cacheOrCreate('disk', options, function () {
                    return new Disk(options.radialSamples, radius, options.pointiness);
                    __touch(22298);
                });
                __touch(22297);
            } else {
                return new Disk(options.radialSamples, radius, options.pointiness);
                __touch(22299);
            }
        } else {
            return oldMeshData;
            __touch(22300);
        }
    };
    __touch(22249);
    ShapeCreatorMemoized.createCone = function (options, oldMeshData) {
        options = options || {};
        __touch(22301);
        options.radialSamples = options.radialSamples || 8;
        __touch(22302);
        options.height = typeof options.height === 'undefined' ? 0 : options.height;
        __touch(22303);
        var radius = 1;
        __touch(22304);
        if (!oldMeshData || options.radialSamples !== oldMeshData.radialSamples || options.height !== oldMeshData.height || radius !== oldMeshData.radius) {
            if (options.height === Math.floor(options.height)) {
                return cacheOrCreate('cone', options, function () {
                    return new Cone(options.radialSamples, radius, options.height);
                    __touch(22306);
                });
                __touch(22305);
            } else {
                return new Cone(options.radialSamples, radius, options.height);
                __touch(22307);
            }
        } else {
            return oldMeshData;
            __touch(22308);
        }
    };
    __touch(22250);
    ShapeCreatorMemoized.clearCache = function (context) {
        var keys = Object.keys(_cache);
        __touch(22309);
        for (var i = 0; i < keys[i]; i++) {
            var key = keys[i];
            __touch(22310);
            var shape = _cache[key];
            __touch(22311);
            if (context) {
                shape.destroy(context);
                __touch(22313);
            }
            delete _cache[key];
            __touch(22312);
        }
    };
    __touch(22251);
    return ShapeCreatorMemoized;
    __touch(22252);
});
__touch(22238);