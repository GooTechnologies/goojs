define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(14356);
    function ParticleUtils() {
    }
    __touch(14357);
    ParticleUtils.getRandomVelocityOffY = function (store, minOffsetAngle, maxOffsetAngle, scale, particleEntity) {
        var randomAngle = minOffsetAngle + Math.random() * (maxOffsetAngle - minOffsetAngle);
        __touch(14365);
        var randomDir = Math.PI * 2 * Math.random();
        __touch(14366);
        store.x = Math.cos(randomDir) * Math.sin(randomAngle);
        __touch(14367);
        store.y = Math.cos(randomAngle);
        __touch(14368);
        store.z = Math.sin(randomDir) * Math.sin(randomAngle);
        __touch(14369);
        if (particleEntity) {
            ParticleUtils.applyEntityTransformVector(store, particleEntity);
            __touch(14372);
        }
        store.mul(scale);
        __touch(14370);
        return store;
        __touch(14371);
    };
    __touch(14358);
    ParticleUtils.randomPointInCube = function (store, xRadius, yRadius, zRadius, center) {
        store.x = Math.random() * 2 * xRadius - xRadius + (center ? center.x : 0);
        __touch(14373);
        store.y = Math.random() * 2 * yRadius - yRadius + (center ? center.y : 0);
        __touch(14374);
        store.z = Math.random() * 2 * zRadius - zRadius + (center ? center.z : 0);
        __touch(14375);
        return store;
        __touch(14376);
    };
    __touch(14359);
    ParticleUtils.createConstantForce = function (force) {
        var applyForce = new Vector3(force);
        __touch(14377);
        return {
            enabled: true,
            prepare: function () {
            },
            apply: function (tpf, particle) {
                particle.velocity.x += applyForce.x * tpf;
                __touch(14379);
                particle.velocity.y += applyForce.y * tpf;
                __touch(14380);
                particle.velocity.z += applyForce.z * tpf;
                __touch(14381);
            }
        };
        __touch(14378);
    };
    __touch(14360);
    ParticleUtils.applyEntityTransformPoint = function (vec3, entity) {
        if (!entity.transformComponent || !entity.transformComponent.worldTransform) {
            return vec3;
            __touch(14383);
        }
        return entity.transformComponent.worldTransform.applyForward(vec3, vec3);
        __touch(14382);
    };
    __touch(14361);
    ParticleUtils.applyEntityTransformVector = function (vec3, entity) {
        if (!entity.transformComponent || !entity.transformComponent.worldTransform) {
            return vec3;
            __touch(14385);
        }
        return entity.transformComponent.worldTransform.applyForwardVector(vec3, vec3);
        __touch(14384);
    };
    __touch(14362);
    ParticleUtils.applyTimeline = function (particle, timeline) {
        var age = particle.age, lifeSpan = particle.lifeSpan;
        __touch(14386);
        var prevCAge = 0, prevMAge = 0, prevSiAge = 0, prevSpAge = 0;
        __touch(14387);
        var nextCAge = lifeSpan, nextMAge = lifeSpan, nextSiAge = lifeSpan, nextSpAge = lifeSpan;
        __touch(14388);
        var trAge = 0, ratio = 0;
        __touch(14389);
        var prevCEntry = null, prevMEntry = null, prevSiEntry = null, prevSpEntry = null, prevUVEntry = null;
        __touch(14390);
        var nextCEntry = null, nextMEntry = null, nextSiEntry = null, nextSpEntry = null;
        __touch(14391);
        for (var i = 0, max = timeline.length; i < max; i++) {
            var entry = timeline[i];
            __touch(14397);
            trAge += (entry.timeOffset ? entry.timeOffset : 0) * lifeSpan;
            __touch(14398);
            if (nextCEntry === null) {
                if (trAge > age) {
                    if (entry.color !== undefined) {
                        nextCAge = trAge;
                        __touch(14399);
                        nextCEntry = entry;
                        __touch(14400);
                    }
                } else {
                    if (entry.color !== undefined) {
                        prevCAge = trAge;
                        __touch(14401);
                        prevCEntry = entry;
                        __touch(14402);
                    }
                }
            }
            if (nextMEntry === null) {
                if (trAge > age) {
                    if (entry.mass !== undefined) {
                        nextMAge = trAge;
                        __touch(14403);
                        nextMEntry = entry;
                        __touch(14404);
                    }
                } else {
                    if (entry.mass !== undefined) {
                        prevMAge = trAge;
                        __touch(14405);
                        prevMEntry = entry;
                        __touch(14406);
                    }
                }
            }
            if (trAge <= age && entry.uvIndex !== undefined) {
                prevUVEntry = entry;
                __touch(14407);
            }
            if (nextSiEntry === null) {
                if (trAge > age) {
                    if (entry.size !== undefined) {
                        nextSiAge = trAge;
                        __touch(14408);
                        nextSiEntry = entry;
                        __touch(14409);
                    }
                } else {
                    if (entry.size !== undefined) {
                        prevSiAge = trAge;
                        __touch(14410);
                        prevSiEntry = entry;
                        __touch(14411);
                    }
                }
            }
            if (nextSpEntry === null) {
                if (trAge > age) {
                    if (entry.spin !== undefined) {
                        nextSpAge = trAge;
                        __touch(14412);
                        nextSpEntry = entry;
                        __touch(14413);
                    }
                } else {
                    if (entry.spin !== undefined) {
                        prevSpAge = trAge;
                        __touch(14414);
                        prevSpEntry = entry;
                        __touch(14415);
                    }
                }
            }
        }
        {
            ratio = (age - prevCAge) / (nextCAge - prevCAge);
            __touch(14416);
            var start = prevCEntry !== null ? prevCEntry.color : [
                1,
                1,
                1,
                1
            ];
            __touch(14417);
            var end = nextCEntry !== null ? nextCEntry.color : start;
            __touch(14418);
            particle.color.data[0] = (1 - ratio) * start[0] + ratio * end[0];
            __touch(14419);
            particle.color.data[1] = (1 - ratio) * start[1] + ratio * end[1];
            __touch(14420);
            particle.color.data[2] = (1 - ratio) * start[2] + ratio * end[2];
            __touch(14421);
            particle.color.data[3] = (1 - ratio) * start[3] + ratio * end[3];
            __touch(14422);
        }
        __touch(14392);
        {
            ratio = (age - prevMAge) / (nextMAge - prevMAge);
            __touch(14423);
            var start = prevMEntry !== null ? prevMEntry.mass : 1;
            __touch(14424);
            var end = nextMEntry !== null ? nextMEntry.mass : start;
            __touch(14425);
            particle.mass = (1 - ratio) * start + ratio * end;
            __touch(14426);
        }
        __touch(14393);
        {
            particle.uvIndex = prevUVEntry !== null ? prevUVEntry.uvIndex : 0;
            __touch(14427);
        }
        __touch(14394);
        {
            ratio = (age - prevSiAge) / (nextSiAge - prevSiAge);
            __touch(14428);
            var start = prevSiEntry !== null ? prevSiEntry.size : 1;
            __touch(14429);
            var end = nextSiEntry !== null ? nextSiEntry.size : start;
            __touch(14430);
            particle.size = (1 - ratio) * start + ratio * end;
            __touch(14431);
        }
        __touch(14395);
        {
            ratio = (age - prevSpAge) / (nextSpAge - prevSpAge);
            __touch(14432);
            var start = prevSpEntry !== null ? prevSpEntry.spin : 0;
            __touch(14433);
            var end = nextSpEntry !== null ? nextSpEntry.spin : start;
            __touch(14434);
            particle.spin = (1 - ratio) * start + ratio * end;
            __touch(14435);
        }
        __touch(14396);
    };
    __touch(14363);
    return ParticleUtils;
    __touch(14364);
});
__touch(14355);