define([
    'goo/math/Vector3',
    'goo/scripts/Scripts',
    'goo/scripts/ScriptUtils',
    'goo/renderer/Renderer',
    'goo/entities/SystemBus',
    'goo/renderer/Camera'
], function (Vector3, Scripts, ScriptUtils, Renderer, SystemBus, Camera) {
    'use strict';
    __touch(19624);
    function PanCamScript() {
        var fwdVector, leftVector, moveVector, calcVector, calcVector2;
        __touch(19628);
        var panButton;
        __touch(19629);
        var lookAtPoint;
        __touch(19630);
        var mouseState;
        __touch(19631);
        var listeners;
        __touch(19632);
        function getTouchCenter(touches) {
            var x1 = touches[0].clientX;
            __touch(19638);
            var y1 = touches[0].clientY;
            __touch(19639);
            var x2 = touches[1].clientX;
            __touch(19640);
            var y2 = touches[1].clientY;
            __touch(19641);
            var cx = (x1 + x2) / 2;
            __touch(19642);
            var cy = (y1 + y2) / 2;
            __touch(19643);
            return [
                cx,
                cy
            ];
            __touch(19644);
        }
        __touch(19633);
        function setup(parameters, environment) {
            panButton = [
                'Any',
                'Left',
                'Middle',
                'Right'
            ].indexOf(parameters.panButton) - 1;
            __touch(19645);
            if (panButton < -1) {
                panButton = -1;
                __touch(19658);
            }
            lookAtPoint = environment.goingToLookAt;
            __touch(19646);
            fwdVector = new Vector3(Vector3.UNIT_Y);
            __touch(19647);
            leftVector = new Vector3(Vector3.UNIT_X).invert();
            __touch(19648);
            moveVector = new Vector3();
            __touch(19649);
            calcVector = new Vector3();
            __touch(19650);
            calcVector2 = new Vector3();
            __touch(19651);
            var renderer = environment.world.gooRunner.renderer;
            __touch(19652);
            environment.devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
            __touch(19653);
            mouseState = {
                x: 0,
                y: 0,
                ox: 0,
                oy: 0,
                dx: 0,
                dy: 0,
                down: false
            };
            __touch(19654);
            listeners = {
                mousedown: function (event) {
                    if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
                        var button = event.button;
                        __touch(19659);
                        if (button === 0) {
                            if (event.altKey) {
                                button = 2;
                                __touch(19660);
                            } else if (event.shiftKey) {
                                button = 1;
                                __touch(19661);
                            }
                        }
                        if (button === panButton || panButton === -1) {
                            mouseState.down = true;
                            __touch(19662);
                            var x = event.offsetX !== undefined ? event.offsetX : event.layerX;
                            __touch(19663);
                            var y = event.offsetY !== undefined ? event.offsetY : event.layerY;
                            __touch(19664);
                            mouseState.ox = mouseState.x = x;
                            __touch(19665);
                            mouseState.oy = mouseState.y = y;
                            __touch(19666);
                        }
                    }
                },
                mouseup: function (event) {
                    var button = event.button;
                    __touch(19667);
                    if (button === 0) {
                        if (event.altKey) {
                            button = 2;
                            __touch(19670);
                        } else if (event.shiftKey) {
                            button = 1;
                            __touch(19671);
                        }
                    }
                    mouseState.down = false;
                    __touch(19668);
                    mouseState.dx = mouseState.dy = 0;
                    __touch(19669);
                },
                mousemove: function (event) {
                    if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
                        if (mouseState.down) {
                            var x = event.offsetX !== undefined ? event.offsetX : event.layerX;
                            __touch(19672);
                            var y = event.offsetY !== undefined ? event.offsetY : event.layerY;
                            __touch(19673);
                            mouseState.x = x;
                            __touch(19674);
                            mouseState.y = y;
                            __touch(19675);
                            environment.dirty = true;
                            __touch(19676);
                        }
                    }
                },
                mouseleave: function () {
                    mouseState.down = false;
                    __touch(19677);
                    mouseState.ox = mouseState.x;
                    __touch(19678);
                    mouseState.oy = mouseState.y;
                    __touch(19679);
                },
                touchstart: function (event) {
                    if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
                        mouseState.down = event.targetTouches.length === 2;
                        __touch(19680);
                        if (!mouseState.down) {
                            return;
                            __touch(19684);
                        }
                        var center = getTouchCenter(event.targetTouches);
                        __touch(19681);
                        mouseState.ox = mouseState.x = center[0];
                        __touch(19682);
                        mouseState.oy = mouseState.y = center[1];
                        __touch(19683);
                    }
                },
                touchmove: function (event) {
                    if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
                        if (!mouseState.down) {
                            return;
                            __touch(19688);
                        }
                        var center = getTouchCenter(event.targetTouches);
                        __touch(19685);
                        mouseState.x = center[0];
                        __touch(19686);
                        mouseState.y = center[1];
                        __touch(19687);
                    }
                },
                touchend: function () {
                    mouseState.down = false;
                    __touch(19689);
                    mouseState.ox = mouseState.x;
                    __touch(19690);
                    mouseState.oy = mouseState.y;
                    __touch(19691);
                }
            };
            __touch(19655);
            for (var event in listeners) {
                environment.domElement.addEventListener(event, listeners[event]);
                __touch(19692);
            }
            __touch(19656);
            environment.dirty = true;
            __touch(19657);
        }
        __touch(19634);
        function update(parameters, environment) {
            if (!environment.dirty) {
                return;
                __touch(19702);
            }
            mouseState.dx = mouseState.x - mouseState.ox;
            __touch(19693);
            mouseState.dy = mouseState.y - mouseState.oy;
            __touch(19694);
            if (mouseState.dx === 0 && mouseState.dy === 0) {
                environment.dirty = !!environment.lookAtPoint;
                __touch(19703);
                return;
                __touch(19704);
            }
            if (parameters.invertX) {
                mouseState.dx = -mouseState.dx;
                __touch(19705);
            }
            if (parameters.invertY) {
                mouseState.dy = -mouseState.dy;
                __touch(19706);
            }
            mouseState.ox = mouseState.x;
            __touch(19695);
            mouseState.oy = mouseState.y;
            __touch(19696);
            var mainCam = Renderer.mainCamera;
            __touch(19697);
            var entity = environment.entity;
            __touch(19698);
            var transform = entity.transformComponent.transform;
            __touch(19699);
            var camera = entity.cameraComponent.camera;
            __touch(19700);
            if (lookAtPoint && mainCam) {
                if (lookAtPoint.equals(mainCam.translation)) {
                    return;
                    __touch(19713);
                }
                var width = environment.viewportWidth / environment.devicePixelRatio;
                __touch(19707);
                var height = environment.viewportHeight / environment.devicePixelRatio;
                __touch(19708);
                mainCam.getScreenCoordinates(lookAtPoint, width, height, calcVector);
                __touch(19709);
                calcVector.sub_d(mouseState.dx, mouseState.dy, 0);
                __touch(19710);
                mainCam.getWorldCoordinates(calcVector.x, calcVector.y, width, height, calcVector.z, calcVector);
                __touch(19711);
                lookAtPoint.setv(calcVector);
                __touch(19712);
            } else {
                calcVector.setv(fwdVector).scale(mouseState.dy);
                __touch(19714);
                calcVector2.setv(leftVector).scale(mouseState.dx);
                __touch(19715);
                if (entity.cameraComponent && entity.cameraComponent.camera) {
                    var camera = entity.cameraComponent.camera;
                    __touch(19721);
                    calcVector.scale((camera._frustumTop - camera._frustumBottom) / environment.viewportHeight);
                    __touch(19722);
                    calcVector2.scale((camera._frustumRight - camera._frustumLeft) / environment.viewportWidth);
                    __touch(19723);
                }
                calcVector.addv(calcVector2);
                __touch(19716);
                transform.rotation.applyPost(calcVector);
                __touch(19717);
                if (camera.projectionMode === Camera.Perspective) {
                    calcVector.scale(parameters.panSpeed * 20);
                    __touch(19724);
                } else {
                    calcVector.scale(parameters.panSpeed);
                    __touch(19725);
                }
                entity.transformComponent.transform.translation.addv(calcVector);
                __touch(19718);
                entity.transformComponent.setUpdated();
                __touch(19719);
                environment.dirty = false;
                __touch(19720);
            }
            SystemBus.emit('goo.cameraPositionChanged', {
                translation: transform.translation.data,
                lookAtPoint: lookAtPoint ? lookAtPoint.data : null,
                id: entity.id
            });
            __touch(19701);
        }
        __touch(19635);
        function cleanup(parameters, environment) {
            for (var event in listeners) {
                environment.domElement.removeEventListener(event, listeners[event]);
                __touch(19727);
            }
            __touch(19726);
        }
        __touch(19636);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19637);
    }
    __touch(19625);
    PanCamScript.externals = {
        key: 'PanCamControlScript',
        name: 'PanCamera Control',
        description: 'Enables camera to pan around a point in 3D space using the mouse',
        parameters: [
            {
                key: 'whenUsed',
                type: 'boolean',
                name: 'When Camera Used',
                description: 'Script only runs when the camera to which it is added is being used.',
                'default': true
            },
            {
                key: 'panButton',
                name: 'Pan button',
                description: 'Only pan with this button',
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
                key: 'panSpeed',
                type: 'float',
                'default': 1,
                scale: 0.01
            }
        ]
    };
    __touch(19626);
    return PanCamScript;
    __touch(19627);
});
__touch(19623);