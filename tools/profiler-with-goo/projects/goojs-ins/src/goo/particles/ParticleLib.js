define([], function () {
    'use strict';
    __touch(14313);
    var ParticleLib = {};
    __touch(14314);
    ParticleLib.getSmoke = function (options) {
        options = options || {};
        __touch(14319);
        options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
        __touch(14320);
        options.spread = typeof options.spread !== 'undefined' ? options.spread : 2;
        __touch(14321);
        options.rate = typeof options.spread !== 'undefined' ? options.rate : 25;
        __touch(14322);
        options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : function (particle) {
            var vec3 = particle.velocity;
            __touch(14326);
            vec3.data[0] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
            __touch(14327);
            vec3.data[1] = (Math.random() + 4) * 2 * options.scale;
            __touch(14328);
            vec3.data[2] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
            __touch(14329);
            return vec3;
            __touch(14330);
        };
        __touch(14323);
        options.color = options.color || [
            0,
            0,
            0
        ];
        __touch(14324);
        return {
            totalParticlesToSpawn: -1,
            releaseRatePerSecond: options.rate,
            minLifetime: 0.5,
            maxLifetime: 4,
            getEmissionVelocity: options.velocity,
            timeline: [
                {
                    timeOffset: 0,
                    spin: 0,
                    mass: 1,
                    size: 3 * options.scale,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        1
                    ]
                },
                {
                    timeOffset: 1,
                    size: 6 * options.scale,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        0
                    ]
                }
            ]
        };
        __touch(14325);
    };
    __touch(14315);
    ParticleLib.getFire = function (options) {
        options = options || {};
        __touch(14331);
        options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
        __touch(14332);
        options.spread = typeof options.spread !== 'undefined' ? options.spread : 2;
        __touch(14333);
        options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 10;
        __touch(14334);
        options.startColor = options.startColor || [
            1,
            1,
            0
        ];
        __touch(14335);
        options.endColor = options.endColor || [
            1,
            0,
            0
        ];
        __touch(14336);
        return {
            totalParticlesToSpawn: -1,
            releaseRatePerSecond: 30,
            minLifetime: 0.5,
            maxLifetime: 2,
            getEmissionVelocity: function (particle) {
                var vec3 = particle.velocity;
                __touch(14338);
                vec3.data[0] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
                __touch(14339);
                vec3.data[1] = (Math.random() + 1) * options.velocity * options.scale;
                __touch(14340);
                vec3.data[2] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
                __touch(14341);
                return vec3;
                __touch(14342);
            },
            timeline: [
                {
                    timeOffset: 0,
                    spin: 0,
                    mass: 1,
                    size: 2 * options.scale,
                    color: [
                        options.startColor[0],
                        options.startColor[1],
                        options.startColor[2],
                        0
                    ]
                },
                {
                    timeOffset: 0.05,
                    color: [
                        options.startColor[0],
                        options.startColor[1],
                        options.startColor[2],
                        1
                    ]
                },
                {
                    timeOffset: 0.45,
                    color: [
                        options.endColor[0],
                        options.endColor[1],
                        options.endColor[2],
                        0.8
                    ]
                },
                {
                    timeOffset: 0.5,
                    size: 3 * options.scale,
                    color: [
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        };
        __touch(14337);
    };
    __touch(14316);
    ParticleLib.getSnow = function (options) {
        options = options || {};
        __touch(14343);
        options.scale = typeof options.scale !== 'undefined' ? options.scale : 2;
        __touch(14344);
        options.spread = typeof options.spread !== 'undefined' ? options.spread : 50;
        __touch(14345);
        options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 3;
        __touch(14346);
        options.color = options.color || [
            1,
            1,
            1
        ];
        __touch(14347);
        return {
            particleCount: 1000,
            totalParticlesToSpawn: -1,
            releaseRatePerSecond: 50,
            minLifetime: 15,
            maxLifetime: 25,
            getEmissionPoint: function (particle) {
                var vec3 = particle.position;
                __touch(14349);
                options.getEmissionPoint(vec3);
                __touch(14350);
                return vec3;
                __touch(14351);
            },
            getEmissionVelocity: function (particle) {
                var vec3 = particle.velocity;
                __touch(14352);
                options.getEmissionVelocity(vec3);
                __touch(14353);
                return vec3;
                __touch(14354);
            },
            timeline: [
                {
                    timeOffset: 0,
                    spin: 0,
                    mass: 1,
                    size: 1 * options.scale,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        0
                    ]
                },
                {
                    timeOffset: 0.05,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        1
                    ]
                },
                {
                    timeOffset: 0.7,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        0.8
                    ]
                },
                {
                    timeOffset: 0.25,
                    spin: 5,
                    size: 0.5 * options.scale,
                    color: [
                        options.color[0],
                        options.color[1],
                        options.color[2],
                        0
                    ]
                }
            ]
        };
        __touch(14348);
    };
    __touch(14317);
    return ParticleLib;
    __touch(14318);
});
__touch(14312);