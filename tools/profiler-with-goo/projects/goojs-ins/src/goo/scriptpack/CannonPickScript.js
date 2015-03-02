define([
    'goo/math/Vector3',
    'goo/scripts/Scripts',
    'goo/scripts/ScriptUtils',
    'goo/renderer/Renderer',
    'goo/math/Plane'
], function (Vector3, Scripts, ScriptUtils, Renderer, Plane) {
    'use strict';
    __touch(19119);
    var CANNON = window.CANNON;
    __touch(19120);
    function CannonPickScript() {
        var fwdVector, leftVector, moveVector, calcVector, calcVector2;
        __touch(19124);
        var pickButton;
        __touch(19125);
        var lookAtPoint;
        __touch(19126);
        var mouseState;
        __touch(19127);
        var devicePixelRatio;
        __touch(19128);
        var cannonSystem;
        __touch(19129);
        var plane = new Plane();
        __touch(19130);
        function getTouchCenter(touches) {
            var x1 = touches[0].clientX;
            __touch(19139);
            var y1 = touches[0].clientY;
            __touch(19140);
            var x2 = touches[1].clientX;
            __touch(19141);
            var y2 = touches[1].clientY;
            __touch(19142);
            var cx = (x1 + x2) / 2;
            __touch(19143);
            var cy = (y1 + y2) / 2;
            __touch(19144);
            return [
                cx,
                cy
            ];
            __touch(19145);
        }
        __touch(19131);
        function setup(parameters, env) {
            pickButton = [
                'Any',
                'Left',
                'Middle',
                'Right'
            ].indexOf(parameters.pickButton) - 1;
            __touch(19146);
            if (pickButton < -1) {
                pickButton = -1;
                __touch(19165);
            }
            lookAtPoint = env.goingToLookAt;
            __touch(19147);
            fwdVector = new Vector3(Vector3.UNIT_Y);
            __touch(19148);
            leftVector = new Vector3(Vector3.UNIT_X).invert();
            __touch(19149);
            moveVector = new Vector3();
            __touch(19150);
            calcVector = new Vector3();
            __touch(19151);
            calcVector2 = new Vector3();
            __touch(19152);
            var renderer = env.world.gooRunner.renderer;
            __touch(19153);
            devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
            __touch(19154);
            cannonSystem = env.world.getSystem('CannonSystem');
            __touch(19155);
            var shape = new CANNON.Sphere(0.1);
            __touch(19156);
            var jointBody = env.jointBody = new CANNON.RigidBody(0, shape);
            __touch(19157);
            jointBody.collisionFilterGroup = 2;
            __touch(19158);
            jointBody.collisionFilterMask = 2;
            __touch(19159);
            cannonSystem.world.add(jointBody);
            __touch(19160);
            mouseState = {
                x: 0,
                y: 0,
                ox: 0,
                oy: 0,
                dx: 0,
                dy: 0,
                down: false
            };
            __touch(19161);
            var listeners = env.listeners = {
                mousedown: function (event) {
                    if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
                        var button = event.button;
                        __touch(19166);
                        if (button === 0) {
                            if (event.altKey) {
                                button = 2;
                                __touch(19167);
                            } else if (event.shiftKey) {
                                button = 1;
                                __touch(19168);
                            }
                        }
                        if (button === pickButton || pickButton === -1) {
                            mouseState.down = true;
                            __touch(19169);
                            mouseState.ox = mouseState.x = event.clientX;
                            __touch(19170);
                            mouseState.oy = mouseState.y = event.clientY;
                            __touch(19171);
                        }
                    }
                },
                mouseup: function (event) {
                    var button = event.button;
                    __touch(19172);
                    if (button === 0) {
                        if (event.altKey) {
                            button = 2;
                            __touch(19173);
                        } else if (event.shiftKey) {
                            button = 1;
                            __touch(19174);
                        }
                    }
                    if (button === pickButton || pickButton === -1) {
                        mouseState.down = false;
                        __touch(19175);
                        mouseState.dx = mouseState.dy = 0;
                        __touch(19176);
                    }
                },
                mousemove: function (event) {
                    if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
                        if (mouseState.down) {
                            mouseState.x = event.clientX;
                            __touch(19177);
                            mouseState.y = event.clientY;
                            __touch(19178);
                            env.dirty = true;
                            __touch(19179);
                        }
                    }
                },
                mouseleave: function () {
                    mouseState.down = false;
                    __touch(19180);
                    mouseState.ox = mouseState.x;
                    __touch(19181);
                    mouseState.oy = mouseState.y;
                    __touch(19182);
                },
                touchstart: function (event) {
                    if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
                        mouseState.down = event.targetTouches.length === 2;
                        __touch(19183);
                        if (!mouseState.down) {
                            return;
                            __touch(19187);
                        }
                        var center = getTouchCenter(event.targetTouches);
                        __touch(19184);
                        mouseState.ox = mouseState.x = center[0];
                        __touch(19185);
                        mouseState.oy = mouseState.y = center[1];
                        __touch(19186);
                    }
                },
                touchmove: function (event) {
                    if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
                        if (!mouseState.down) {
                            return;
                            __touch(19191);
                        }
                        var center = getTouchCenter(event.targetTouches);
                        __touch(19188);
                        mouseState.x = center[0];
                        __touch(19189);
                        mouseState.y = center[1];
                        __touch(19190);
                    }
                },
                touchend: function () {
                    mouseState.down = false;
                    __touch(19192);
                    mouseState.ox = mouseState.x;
                    __touch(19193);
                    mouseState.oy = mouseState.y;
                    __touch(19194);
                }
            };
            __touch(19162);
            for (var event in listeners) {
                env.domElement.addEventListener(event, listeners[event]);
                __touch(19195);
            }
            __touch(19163);
            env.dirty = true;
            __touch(19164);
        }
        __touch(19132);
        function update(params, env) {
            mouseState.dx = mouseState.x - mouseState.ox;
            __touch(19196);
            mouseState.dy = mouseState.y - mouseState.oy;
            __touch(19197);
            mouseState.ox = mouseState.x;
            __touch(19198);
            mouseState.oy = mouseState.y;
            __touch(19199);
            var mainCam = Renderer.mainCamera;
            __touch(19200);
            if (mainCam && mouseState.down && !env.mouseConstraint) {
                var bodies = [];
                __touch(19201);
                var physicsEntities = env.world.by.system('CannonSystem').toArray();
                __touch(19202);
                for (var i = 0; i < physicsEntities.length; i++) {
                    var b = physicsEntities[i].cannonRigidbodyComponent.body;
                    __touch(19208);
                    if (b && b.shape instanceof CANNON.Box && b.motionstate === CANNON.Body.DYNAMIC) {
                        bodies.push(b);
                        __touch(19209);
                    }
                }
                var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
                __touch(19203);
                var origin = new CANNON.Vec3(gooRay.origin.x, gooRay.origin.y, gooRay.origin.z);
                __touch(19204);
                var direction = new CANNON.Vec3(gooRay.direction.x, gooRay.direction.y, gooRay.direction.z);
                __touch(19205);
                var r = new CANNON.Ray(origin, direction);
                __touch(19206);
                var result = r.intersectBodies(bodies);
                __touch(19207);
                if (result.length) {
                    var b = result[0].body;
                    __touch(19210);
                    var p = result[0].point;
                    __touch(19211);
                    addMouseConstraint(params, env, p.x, p.y, p.z, b, gooRay.direction.mul(-1));
                    __touch(19212);
                }
            } else if (mainCam && mouseState.down && env.mouseConstraint && (mouseState.dx !== 0 || mouseState.dy !== 0)) {
                var mainCam = Renderer.mainCamera;
                __touch(19213);
                var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
                __touch(19214);
                var newPositionWorld = new Vector3();
                __touch(19215);
                plane.rayIntersect(gooRay, newPositionWorld, true);
                __touch(19216);
                moveJointToPoint(params, env, newPositionWorld);
                __touch(19217);
            } else if (!mouseState.down) {
                removeJointConstraint(params, env);
                __touch(19218);
            }
        }
        __touch(19133);
        function cleanup(parameters, environment) {
            for (var event in environment.listeners) {
                environment.domElement.removeEventListener(event, environment.listeners[event]);
                __touch(19220);
            }
            __touch(19219);
        }
        __touch(19134);
        function addMouseConstraint(params, env, x, y, z, body, normal) {
            env.constrainedBody = body;
            __touch(19221);
            var v1 = new CANNON.Vec3(x, y, z).vsub(env.constrainedBody.position);
            __touch(19222);
            var antiRot = env.constrainedBody.quaternion.inverse();
            __touch(19223);
            var pivot = antiRot.vmult(v1);
            __touch(19224);
            env.jointBody.position.set(x, y, z);
            __touch(19225);
            env.mouseConstraint = new CANNON.PointToPointConstraint(env.constrainedBody, pivot, env.jointBody, new CANNON.Vec3(0, 0, 0));
            __touch(19226);
            cannonSystem.world.addConstraint(env.mouseConstraint);
            __touch(19227);
            var worldCenter = new Vector3(x, y, z);
            __touch(19228);
            plane.constant = worldCenter.dot(normal);
            __touch(19229);
            plane.normal.setv(normal);
            __touch(19230);
        }
        __touch(19135);
        function moveJointToPoint(params, env, point) {
            env.jointBody.position.set(point.x, point.y, point.z);
            __touch(19231);
            env.mouseConstraint.update();
            __touch(19232);
        }
        __touch(19136);
        function removeJointConstraint(params, env) {
            cannonSystem.world.removeConstraint(env.mouseConstraint);
            __touch(19233);
            env.mouseConstraint = false;
            __touch(19234);
        }
        __touch(19137);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19138);
    }
    __touch(19121);
    CannonPickScript.externals = {
        key: 'CannonPickScript',
        name: 'Cannon.js Body Pick',
        description: 'Enables the user to physically pick a Cannon.js physics body and drag it around.',
        parameters: [
            {
                key: 'whenUsed',
                type: 'boolean',
                'default': true
            },
            {
                key: 'pickButton',
                name: 'Pan button',
                description: 'Pick with this button',
                type: 'string',
                control: 'select',
                'default': 'Any',
                options: [
                    'Any',
                    'Left',
                    'Middle',
                    'Right'
                ]
            },
            {
                key: 'useForceNormal',
                name: 'Use force normal',
                type: 'boolean',
                'default': false
            },
            {
                key: 'forceNormal',
                name: 'Force normal',
                'default': [
                    0,
                    0,
                    1
                ],
                type: 'vec3'
            }
        ]
    };
    __touch(19122);
    return CannonPickScript;
    __touch(19123);
});
__touch(19118);