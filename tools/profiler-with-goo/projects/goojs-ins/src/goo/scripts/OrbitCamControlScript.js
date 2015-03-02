define([
    'goo/math/Vector3',
    'goo/math/Vector2',
    'goo/math/MathUtils',
    'goo/renderer/Camera',
    'goo/entities/SystemBus'
], function (Vector3, Vector2, MathUtils, Camera, SystemBus) {
    'use strict';
    __touch(20221);
    var ZOOM_DISTANCE_FACTOR = 0.035;
    __touch(20222);
    var EPSILON = 0.000001;
    __touch(20223);
    function setup(args, ctx) {
        ctx.dirty = true;
        __touch(20238);
        ctx.timeSamples = [
            0,
            0,
            0,
            0,
            0
        ];
        __touch(20239);
        ctx.xSamples = [
            0,
            0,
            0,
            0,
            0
        ];
        __touch(20240);
        ctx.ySamples = [
            0,
            0,
            0,
            0,
            0
        ];
        __touch(20241);
        ctx.sample = 0;
        __touch(20242);
        ctx.velocity = new Vector2(0, 0);
        __touch(20243);
        ctx.cartesian = new Vector3();
        __touch(20244);
        ctx.worldUpVector = new Vector3(Vector3.UNIT_Y);
        __touch(20245);
        ctx.maxSampleTimeMS = 200;
        __touch(20246);
        ctx.mouseState = {
            buttonDown: false,
            lastX: NaN,
            lastY: NaN
        };
        __touch(20247);
        ctx.smoothness = Math.pow(MathUtils.clamp(args.smoothness, 0, 1), 0.3);
        __touch(20248);
        ctx.inertia = Math.pow(MathUtils.clamp(args.drag, 0, 1), 0.3);
        __touch(20249);
        ctx.dragButton = [
            'Any',
            'Left',
            'Middle',
            'Right',
            'None'
        ].indexOf(args.dragButton) - 1;
        __touch(20250);
        if (ctx.dragButton < -1) {
            ctx.dragButton = -1;
            __touch(20256);
        } else if (ctx.dragButton === 4) {
            ctx.dragButton = null;
            __touch(20257);
        }
        var spherical;
        __touch(20251);
        if (args.lookAtDistance) {
            var angles = ctx.entity.getRotation();
            __touch(20258);
            spherical = ctx.spherical = new Vector3(args.lookAtDistance, -angles[1] + Math.PI / 2, -angles[0]);
            __touch(20259);
        } else if (args.spherical) {
            var spherical = ctx.spherical = new Vector3(args.spherical[0], args.spherical[1] * MathUtils.DEG_TO_RAD, args.spherical[2] * MathUtils.DEG_TO_RAD);
            __touch(20260);
        } else {
            var spherical = ctx.spherical = new Vector3(15, 0, 0);
            __touch(20261);
        }
        ctx.targetSpherical = new Vector3(spherical);
        __touch(20252);
        if (args.lookAtDistance) {
            var rotation = ctx.entity.transformComponent.transform.rotation;
            __touch(20262);
            ctx.lookAtPoint = new Vector3(0, 0, -args.lookAtDistance);
            __touch(20263);
            rotation.applyPost(ctx.lookAtPoint);
            __touch(20264);
            ctx.lookAtPoint.addv(ctx.entity.getTranslation());
            __touch(20265);
        } else if (args.lookAtPoint) {
            ctx.lookAtPoint = new Vector3(args.lookAtPoint);
            __touch(20266);
        } else {
            ctx.lookAtPoint = new Vector3();
            __touch(20267);
        }
        ctx.goingToLookAt = new Vector3(ctx.lookAtPoint);
        __touch(20253);
        updateFrustumSize(1, ctx);
        __touch(20254);
        setupMouseControls(args, ctx);
        __touch(20255);
    }
    __touch(20224);
    function updateButtonState(buttonIndex, down, args, ctx) {
        if (ctx.domElement !== document) {
            ctx.domElement.focus();
            __touch(20270);
        }
        var dragButton = ctx.dragButton;
        __touch(20268);
        var mouseState = ctx.mouseState;
        __touch(20269);
        if (dragButton === -1 || dragButton === buttonIndex || down === false) {
            mouseState.buttonDown = down;
            __touch(20271);
            if (down) {
                mouseState.lastX = NaN;
                __touch(20272);
                mouseState.lastY = NaN;
                __touch(20273);
                ctx.velocity.setd(0, 0);
                __touch(20274);
                ctx.spherical.data[1] = MathUtils.moduloPositive(ctx.spherical.data[1], MathUtils.TWO_PI);
                __touch(20275);
                ctx.targetSpherical.setv(ctx.spherical);
                __touch(20276);
            } else {
                applyReleaseDrift(args, ctx);
                __touch(20277);
            }
        }
    }
    __touch(20225);
    function updateDeltas(mouseX, mouseY, args, ctx) {
        var dx = 0, dy = 0;
        __touch(20278);
        var mouseState = ctx.mouseState;
        __touch(20279);
        if (isNaN(mouseState.lastX) || isNaN(mouseState.lastY)) {
            mouseState.lastX = mouseX;
            __touch(20286);
            mouseState.lastY = mouseY;
            __touch(20287);
        } else {
            dx = -(mouseX - mouseState.lastX);
            __touch(20288);
            dy = mouseY - mouseState.lastY;
            __touch(20289);
            mouseState.lastX = mouseX;
            __touch(20290);
            mouseState.lastY = mouseY;
            __touch(20291);
        }
        if (!mouseState.buttonDown || dx === 0 && dy === 0) {
            return;
            __touch(20292);
        }
        ctx.timeSamples[ctx.sample] = Date.now();
        __touch(20280);
        ctx.xSamples[ctx.sample] = dx;
        __touch(20281);
        ctx.ySamples[ctx.sample] = dy;
        __touch(20282);
        ctx.sample++;
        __touch(20283);
        if (ctx.sample > ctx.timeSamples.length - 1) {
            ctx.sample = 0;
            __touch(20293);
        }
        ctx.velocity.setd(0, 0);
        __touch(20284);
        move(args.orbitSpeed * dx, args.orbitSpeed * dy, args, ctx);
        __touch(20285);
    }
    __touch(20226);
    function move(azimuthAccel, thetaAccel, args, ctx) {
        var td = ctx.targetSpherical.data;
        __touch(20294);
        if (args.clampAzimuth) {
            var minAzimuth = args.minAzimuth * MathUtils.DEG_TO_RAD;
            __touch(20299);
            var maxAzimuth = args.maxAzimuth * MathUtils.DEG_TO_RAD;
            __touch(20300);
            td[1] = MathUtils.radialClamp(td[1] - azimuthAccel, minAzimuth, maxAzimuth);
            __touch(20301);
        } else {
            td[1] = td[1] - azimuthAccel;
            __touch(20302);
        }
        var minAscent = args.minAscent * MathUtils.DEG_TO_RAD;
        __touch(20295);
        var maxAscent = args.maxAscent * MathUtils.DEG_TO_RAD;
        __touch(20296);
        td[2] = MathUtils.clamp(td[2] + thetaAccel, minAscent, maxAscent);
        __touch(20297);
        ctx.dirty = true;
        __touch(20298);
    }
    __touch(20227);
    function updateFrustumSize(delta, ctx) {
        var camera = ctx.entity.cameraComponent.camera;
        __touch(20303);
        if (camera.projectionMode === Camera.Parallel) {
            ctx.size = camera.top;
            __touch(20304);
            ctx.size /= delta;
            __touch(20305);
            var size = ctx.size;
            __touch(20306);
            camera.setFrustum(null, null, -size, size, size, -size);
            __touch(20307);
        }
    }
    __touch(20228);
    function applyWheel(e, args, ctx) {
        var delta = Math.max(-1, Math.min(1, -e.wheelDelta || e.detail));
        __touch(20308);
        delta *= ZOOM_DISTANCE_FACTOR * ctx.targetSpherical.data[0];
        __touch(20309);
        var td = ctx.targetSpherical.data;
        __touch(20310);
        td[0] = MathUtils.clamp(td[0] + args.zoomSpeed * delta, args.minZoomDistance, args.maxZoomDistance);
        __touch(20311);
        ctx.dirty = true;
        __touch(20312);
    }
    __touch(20229);
    function applyReleaseDrift(args, ctx) {
        var timeSamples = ctx.timeSamples;
        __touch(20313);
        var now = Date.now();
        __touch(20314);
        var dx = 0, dy = 0;
        __touch(20315);
        var found = false;
        __touch(20316);
        for (var i = 0, max = timeSamples.length; i < max; i++) {
            if (now - timeSamples[i] < ctx.maxSampleTimeMS) {
                dx += ctx.xSamples[i];
                __touch(20317);
                dy += ctx.ySamples[i];
                __touch(20318);
                found = true;
                __touch(20319);
            }
        }
        if (found) {
            ctx.velocity.setd(dx * args.orbitSpeed / timeSamples.length, dy * args.orbitSpeed / timeSamples.length);
            __touch(20320);
        } else {
            ctx.velocity.setd(0, 0);
            __touch(20321);
        }
    }
    __touch(20230);
    function setupMouseControls(args, ctx) {
        var oldDistance = 0;
        __touch(20322);
        var isAndroid = !!navigator.userAgent.match(/Android/i);
        __touch(20323);
        var fakeEvent = { wheelDelta: 0 };
        __touch(20324);
        ctx.listeners = {
            mousedown: function (event) {
                if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
                    var button = event.button;
                    __touch(20330);
                    if (button === 0) {
                        if (event.altKey) {
                            button = 2;
                            __touch(20332);
                        } else if (event.shiftKey) {
                            button = 1;
                            __touch(20333);
                        }
                    }
                    updateButtonState(button, true, args, ctx);
                    __touch(20331);
                }
            },
            mouseup: function (event) {
                var button = event.button;
                __touch(20334);
                if (button === 0) {
                    if (event.altKey) {
                        button = 2;
                        __touch(20336);
                    } else if (event.shiftKey) {
                        button = 1;
                        __touch(20337);
                    }
                }
                updateButtonState(button, false, args, ctx);
                __touch(20335);
            },
            mousemove: function (event) {
                if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
                    updateDeltas(event.clientX, event.clientY, args, ctx);
                    __touch(20338);
                }
            },
            mouseleave: function (event) {
                ctx.orbitListeners.mouseup(event);
                __touch(20339);
            },
            mousewheel: function (event) {
                if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
                    applyWheel(event, args, ctx);
                    __touch(20340);
                }
            },
            touchstart: function (event) {
                if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
                    updateButtonState(ctx.dragButton, event.targetTouches.length === 1, args, ctx);
                    __touch(20341);
                }
                if (isAndroid) {
                    event.preventDefault();
                    __touch(20342);
                }
            },
            touchend: function () {
                updateButtonState(ctx.dragButton, false, args, ctx);
                __touch(20343);
                oldDistance = 0;
                __touch(20344);
            },
            touchmove: function (event) {
                if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
                    var cx, cy, distance;
                    __touch(20345);
                    var touches = event.targetTouches;
                    __touch(20346);
                    var x1 = touches[0].clientX;
                    __touch(20347);
                    var y1 = touches[0].clientY;
                    __touch(20348);
                    if (touches.length === 2) {
                        var x2 = touches[1].clientX;
                        __touch(20351);
                        var y2 = touches[1].clientY;
                        __touch(20352);
                        distance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
                        __touch(20353);
                    } else {
                        cx = x1;
                        __touch(20354);
                        cy = y1;
                        __touch(20355);
                        updateDeltas(cx, cy, args, ctx);
                        __touch(20356);
                    }
                    var scale = (distance - oldDistance) / Math.max(ctx.domElement.offsetHeight, ctx.domElement.offsetWidth);
                    __touch(20349);
                    scale /= 3;
                    __touch(20350);
                    if (oldDistance === 0) {
                        oldDistance = distance;
                        __touch(20357);
                    } else if (touches.length === 2 && Math.abs(scale) > 0.3) {
                        fakeEvent.wheelDelta = scale;
                        __touch(20358);
                        applyWheel(fakeEvent, args, ctx);
                        __touch(20359);
                        oldDistance = distance;
                        __touch(20360);
                    }
                }
            }
        };
        __touch(20325);
        ctx.listeners.DOMMouseScroll = ctx.listeners.mousewheel;
        __touch(20326);
        ctx.listeners.mouseleave = ctx.listeners.mouseup;
        __touch(20327);
        for (var event in ctx.listeners) {
            ctx.domElement.addEventListener(event, ctx.listeners[event]);
            __touch(20361);
        }
        __touch(20328);
        ctx.domElement.oncontextmenu = function () {
            return false;
            __touch(20362);
        };
        __touch(20329);
    }
    __touch(20231);
    function updateVelocity(time, args, ctx) {
        if (ctx.velocity.lengthSquared() > EPSILON) {
            move(ctx.velocity.x, ctx.velocity.y, args, ctx);
            __touch(20363);
            var rate = MathUtils.lerp(ctx.inertia, 0, 1 - time / ctx.inertia);
            __touch(20364);
            ctx.velocity.mul(rate);
            __touch(20365);
        } else {
            ctx.velocity.setd(0, 0, 0);
            __touch(20366);
        }
    }
    __touch(20232);
    function update(args, ctx) {
        if (!ctx.dirty) {
            return;
            __touch(20388);
        }
        var spherical = ctx.spherical;
        __touch(20367);
        var targetSpherical = ctx.targetSpherical;
        __touch(20368);
        var lookAtPoint = ctx.lookAtPoint;
        __touch(20369);
        var goingToLookAt = ctx.goingToLookAt;
        __touch(20370);
        var cartesian = ctx.cartesian;
        __touch(20371);
        var entity = ctx.entity;
        __touch(20372);
        var transformComponent = entity.transformComponent;
        __touch(20373);
        var transform = transformComponent.transform;
        __touch(20374);
        var delta = MathUtils.lerp(ctx.smoothness, 1, ctx.world.tpf);
        __touch(20375);
        if (goingToLookAt.distanceSquared(lookAtPoint) < EPSILON) {
            lookAtPoint.setv(goingToLookAt);
            __touch(20389);
        } else {
            lookAtPoint.lerp(goingToLookAt, delta);
            __touch(20390);
        }
        if (ctx.inertia > 0) {
            updateVelocity(entity._world.tpf, args, ctx);
            __touch(20391);
        }
        var sd = spherical.data;
        __touch(20376);
        var tsd = targetSpherical.data;
        __touch(20377);
        sd[1] = MathUtils.lerp(delta, sd[1], tsd[1]);
        __touch(20378);
        sd[2] = MathUtils.lerp(delta, sd[2], tsd[2]);
        __touch(20379);
        var deltaX = sd[0];
        __touch(20380);
        sd[0] = MathUtils.lerp(delta, sd[0], tsd[0]);
        __touch(20381);
        deltaX /= sd[0];
        __touch(20382);
        updateFrustumSize(deltaX, ctx);
        __touch(20383);
        MathUtils.sphericalToCartesian(sd[0], sd[1], sd[2], cartesian);
        __touch(20384);
        transform.translation.set(cartesian.add(lookAtPoint));
        __touch(20385);
        if (!transform.translation.equals(lookAtPoint)) {
            transform.lookAt(lookAtPoint, ctx.worldUpVector);
            __touch(20392);
        }
        if (spherical.distanceSquared(targetSpherical) < EPSILON && ctx.lookAtPoint.equals(ctx.goingToLookAt)) {
            sd[1] = MathUtils.moduloPositive(sd[1], MathUtils.TWO_PI);
            __touch(20393);
            targetSpherical.setv(spherical);
            __touch(20394);
            ctx.dirty = false;
            __touch(20395);
        }
        transformComponent.setUpdated();
        __touch(20386);
        SystemBus.emit('goo.cameraPositionChanged', {
            spherical: ctx.spherical.data,
            translation: transform.translation.data,
            lookAtPoint: ctx.lookAtPoint.data,
            id: entity.id
        });
        __touch(20387);
    }
    __touch(20233);
    function cleanup(args, ctx) {
        for (var event in ctx.listeners) {
            ctx.domElement.removeEventListener(event, ctx.listeners[event]);
            __touch(20397);
        }
        __touch(20396);
    }
    __touch(20234);
    function OrbitCamControlScript() {
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(20398);
    }
    __touch(20235);
    OrbitCamControlScript.externals = {
        key: 'OrbitCamControlScript',
        name: 'OrbitCamera Control',
        description: 'Enables camera to orbit around a point in 3D space using the mouse',
        parameters: [
            {
                key: 'whenUsed',
                'default': true,
                name: 'When Camera Used',
                description: 'Script only runs when the camera to which it is added is being used.',
                type: 'boolean'
            },
            {
                key: 'dragButton',
                description: 'Button to enable dragging',
                'default': 'Any',
                options: [
                    'Any',
                    'Left',
                    'Middle',
                    'Right',
                    'None'
                ],
                type: 'string',
                control: 'select'
            },
            {
                key: 'orbitSpeed',
                'default': 0.005,
                type: 'float',
                scale: 0.001,
                decimals: 3
            },
            {
                key: 'zoomSpeed',
                'default': 1,
                type: 'float',
                scale: 0.1
            },
            {
                key: 'drag',
                name: 'Inertia',
                'default': 0.9,
                type: 'float',
                control: 'slider',
                min: 0,
                max: 1
            },
            {
                key: 'smoothness',
                'default': 0.4,
                type: 'float',
                min: 0,
                max: 1,
                control: 'slider'
            },
            {
                key: 'minZoomDistance',
                'default': 1,
                type: 'float',
                min: 0.01
            },
            {
                key: 'maxZoomDistance',
                'default': 1000,
                type: 'float',
                min: 1
            },
            {
                key: 'minAscent',
                description: 'Maximum arc the camera can reach below the target point',
                'default': -89,
                type: 'int',
                control: 'slider',
                min: -89,
                max: 89
            },
            {
                key: 'maxAscent',
                description: 'Maximum arc the camera can reach above the target point',
                'default': 89.95,
                type: 'int',
                control: 'slider',
                min: -89,
                max: 89
            },
            {
                key: 'clampAzimuth',
                'default': false,
                type: 'boolean'
            },
            {
                key: 'minAzimuth',
                description: 'Maximum arc the camera can reach clockwise of the target point',
                'default': 90,
                type: 'int',
                control: 'slider',
                min: 0,
                max: 360
            },
            {
                key: 'maxAzimuth',
                description: 'Maximum arc the camera can reach counter-clockwise of the target point',
                'default': 270,
                type: 'int',
                control: 'slider',
                min: 0,
                max: 360
            },
            {
                key: 'lookAtDistance',
                description: 'The point to orbit around',
                'default': 15,
                type: 'float',
                min: 0.001
            }
        ]
    };
    __touch(20236);
    return OrbitCamControlScript;
    __touch(20237);
});
__touch(20220);