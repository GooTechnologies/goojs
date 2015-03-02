define([], function () {
    'use strict';
    __touch(19729);
    function PickAndRotateScript() {
        var gooRunner;
        __touch(19733);
        var validPick;
        __touch(19734);
        var args, ctx;
        __touch(19735);
        var mouseState;
        __touch(19736);
        function getButton(event) {
            var pressedButton = event.button;
            __touch(19746);
            if (pressedButton === 0) {
                if (event.altKey) {
                    pressedButton = 2;
                    __touch(19748);
                } else if (event.shiftKey) {
                    pressedButton = 1;
                    __touch(19749);
                }
            }
            return pressedButton;
            __touch(19747);
        }
        __touch(19737);
        function mouseDown(event) {
            if (args.disable) {
                return;
                __touch(19751);
            }
            var pressedButton = getButton(event.domEvent);
            __touch(19750);
            if ((pressedButton === ctx.dragButton || ctx.dragButton === -1) && event.entity) {
                validPick = false;
                __touch(19752);
                event.entity.traverseUp(function (entity) {
                    if (entity === ctx.entity) {
                        validPick = true;
                        __touch(19754);
                        return false;
                        __touch(19755);
                    }
                });
                __touch(19753);
                if (validPick) {
                    onPressEvent(event);
                    __touch(19756);
                }
            }
        }
        __touch(19738);
        function onPressEvent(event) {
            mouseState.x = event.x;
            __touch(19757);
            mouseState.y = event.y;
            __touch(19758);
            mouseState.oldX = mouseState.x;
            __touch(19759);
            mouseState.oldY = mouseState.y;
            __touch(19760);
            mouseState.down = true;
            __touch(19761);
        }
        __touch(19739);
        function mouseMove(event) {
            mouseState.oldX = mouseState.x;
            __touch(19762);
            mouseState.oldY = mouseState.y;
            __touch(19763);
            mouseState.x = event.clientX || event.touches[0].clientX;
            __touch(19764);
            mouseState.y = event.clientY || event.touches[0].clientY;
            __touch(19765);
            if (validPick && mouseState.down) {
                var deltaX = mouseState.x - mouseState.oldX;
                __touch(19766);
                var deltaY = mouseState.y - mouseState.oldY;
                __touch(19767);
                mouseState.ax += deltaX;
                __touch(19768);
                mouseState.ay += deltaY;
                __touch(19769);
                ctx.entity.transformComponent.transform.rotation.setIdentity();
                __touch(19770);
                ctx.entity.transformComponent.transform.rotation.rotateX(mouseState.ay / 300 * args.yMultiplier);
                __touch(19771);
                ctx.entity.transformComponent.transform.rotation.rotateY(mouseState.ax / 200 * args.xMultiplier);
                __touch(19772);
                ctx.entity.transformComponent.setUpdated();
                __touch(19773);
            }
        }
        __touch(19740);
        function mouseUp(event) {
            mouseState.down = false;
            __touch(19774);
        }
        __touch(19741);
        function setup(_args, _ctx, goo) {
            args = _args;
            __touch(19775);
            ctx = _ctx;
            __touch(19776);
            ctx.dragButton = [
                'Any',
                'Left',
                'Middle',
                'Right'
            ].indexOf(args.dragButton) - 1;
            __touch(19777);
            if (ctx.dragButton < -1) {
                ctx.dragButton = -1;
                __touch(19786);
            }
            gooRunner = ctx.world.gooRunner;
            __touch(19778);
            gooRunner.addEventListener('mousedown', mouseDown);
            __touch(19779);
            gooRunner.addEventListener('touchstart', mouseDown);
            __touch(19780);
            gooRunner.renderer.domElement.addEventListener('mousemove', mouseMove);
            __touch(19781);
            gooRunner.renderer.domElement.addEventListener('touchmove', mouseMove);
            __touch(19782);
            gooRunner.renderer.domElement.addEventListener('mouseup', mouseUp);
            __touch(19783);
            gooRunner.renderer.domElement.addEventListener('touchend', mouseUp);
            __touch(19784);
            mouseState = {
                down: false,
                x: 0,
                y: 0,
                oldX: 0,
                oldY: 0,
                ax: 0,
                ay: 0
            };
            __touch(19785);
        }
        __touch(19742);
        function update(args, ctx, goo) {
        }
        __touch(19743);
        function cleanup(args, ctx, goo) {
            ctx.domElement.removeEventListener('mousemove', mouseMove);
            __touch(19787);
            ctx.domElement.removeEventListener('touchmove', mouseMove);
            __touch(19788);
            ctx.domElement.removeEventListener('mouseup', mouseUp);
            __touch(19789);
            ctx.domElement.removeEventListener('touchend', mouseUp);
            __touch(19790);
            gooRunner.removeEventListener('mousedown', mouseDown);
            __touch(19791);
            gooRunner.removeEventListener('touchstart', mouseDown);
            __touch(19792);
        }
        __touch(19744);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19745);
    }
    __touch(19730);
    PickAndRotateScript.externals = {
        key: 'PickAndRotateScript',
        name: 'Pick and Rotate',
        description: 'Enables pick-drag-rotating entities',
        parameters: [
            {
                key: 'disable',
                description: 'Prevent rotation. For preventing this script programmatically.',
                type: 'boolean',
                'default': false
            },
            {
                key: 'dragButton',
                description: 'Button to enable dragging',
                'default': 'Any',
                options: [
                    'Any',
                    'Left',
                    'Middle',
                    'Right'
                ],
                type: 'string',
                control: 'select'
            },
            {
                key: 'xMultiplier',
                description: 'Horizontal rotation multiplier',
                'default': 1,
                type: 'float',
                control: 'slider',
                min: -4,
                max: 4
            },
            {
                key: 'yMultiplier',
                description: 'Vertical rotation multiplier',
                'default': 1,
                type: 'float',
                control: 'slider',
                min: -4,
                max: 4
            }
        ]
    };
    __touch(19731);
    return PickAndRotateScript;
    __touch(19732);
});
__touch(19728);