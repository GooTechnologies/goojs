define([
    'goo/math/Vector3',
    'goo/scripts/Scripts',
    'goo/scripts/ScriptUtils',
    'goo/renderer/Renderer',
    'goo/entities/SystemBus'
], function (Vector3, Scripts, ScriptUtils, Renderer, SystemBus) {
    'use strict';
    __touch(19046);
    function ButtonScript() {
        function setup(params, env) {
            env.button = [
                'Any',
                'Left',
                'Middle',
                'Right'
            ].indexOf(params.button) - 1;
            __touch(19057);
            if (env.button < -1) {
                env.button = -1;
                __touch(19063);
            }
            env.renderToPickHandler = function () {
                env.skipUpdateBuffer = true;
                __touch(19064);
            };
            __touch(19058);
            SystemBus.addListener('ButtonScript.renderToPick', env.renderToPickHandler, false);
            __touch(19059);
            env.mouseState = {
                x: 0,
                y: 0,
                down: false,
                downOnEntity: false,
                overEntity: false
            };
            __touch(19060);
            env.listeners = {
                mousedown: function (event) {
                    if (!params.whenUsed) {
                        return;
                        __touch(19066);
                    }
                    var pressedButton = getButton(event);
                    __touch(19065);
                    if (pressedButton === env.button || env.button === -1) {
                        env.mouseState.down = true;
                        __touch(19067);
                        getMousePos(params, env, event);
                        __touch(19068);
                        onMouseEvent(params, env, 'mousedown');
                        __touch(19069);
                    }
                },
                mouseup: function (event) {
                    if (!params.whenUsed) {
                        return;
                        __touch(19071);
                    }
                    var pressedButton = getButton(event);
                    __touch(19070);
                    if (pressedButton === env.button || env.button === -1) {
                        env.mouseState.down = false;
                        __touch(19072);
                        getMousePos(params, env, event);
                        __touch(19073);
                        if (env.mouseState.downOnEntity) {
                            onMouseEvent(params, env, 'click');
                            __touch(19075);
                        }
                        onMouseEvent(params, env, 'mouseup');
                        __touch(19074);
                    }
                },
                dblclick: function (event) {
                    if (!params.whenUsed) {
                        return;
                        __touch(19077);
                    }
                    var pressedButton = getButton(event);
                    __touch(19076);
                    if (pressedButton === env.button || env.button === -1) {
                        env.mouseState.down = false;
                        __touch(19078);
                        getMousePos(params, env, event);
                        __touch(19079);
                        onMouseEvent(params, env, 'dblclick');
                        __touch(19080);
                    }
                },
                mousemove: function (event) {
                    if (!params.whenUsed || !params.enableOnMouseMove) {
                        return;
                        __touch(19084);
                    }
                    env.mouseState.down = false;
                    __touch(19081);
                    getMousePos(params, env, event);
                    __touch(19082);
                    onMouseEvent(params, env, 'mousemove');
                    __touch(19083);
                },
                touchstart: function (event) {
                    if (!params.whenUsed) {
                        return;
                        __touch(19091);
                    }
                    env.mouseState.down = true;
                    __touch(19085);
                    var touches = event.targetTouches;
                    __touch(19086);
                    var rect = env.domElement.getBoundingClientRect();
                    __touch(19087);
                    env.mouseState.x = touches[0].pageX - rect.left;
                    __touch(19088);
                    env.mouseState.y = touches[0].pageY - rect.top;
                    __touch(19089);
                    onMouseEvent(params, env, 'touchstart');
                    __touch(19090);
                },
                touchend: function () {
                    if (!params.whenUsed) {
                        return;
                        __touch(19094);
                    }
                    env.mouseState.down = false;
                    __touch(19092);
                    onMouseEvent(params, env, 'touchend');
                    __touch(19093);
                }
            };
            __touch(19061);
            for (var event in env.listeners) {
                env.domElement.addEventListener(event, env.listeners[event]);
                __touch(19095);
            }
            __touch(19062);
        }
        __touch(19050);
        function getMousePos(params, env, mouseEvent) {
            var rect = env.domElement.getBoundingClientRect();
            __touch(19096);
            env.mouseState.x = mouseEvent.pageX - rect.left;
            __touch(19097);
            env.mouseState.y = mouseEvent.pageY - rect.top;
            __touch(19098);
        }
        __touch(19051);
        function update(params, env) {
            env.skipUpdateBuffer = false;
            __touch(19099);
        }
        __touch(19052);
        function cleanup(params, env) {
            for (var event in env.listeners) {
                env.domElement.removeEventListener(event, env.listeners[event]);
                __touch(19102);
            }
            __touch(19100);
            SystemBus.removeListener('ButtonScript.renderToPick', env.renderToPickHandler);
            __touch(19101);
        }
        __touch(19053);
        function getButton(event) {
            var pressedButton = event.button;
            __touch(19103);
            if (pressedButton === 0) {
                if (event.altKey) {
                    pressedButton = 2;
                    __touch(19105);
                } else if (event.shiftKey) {
                    pressedButton = 1;
                    __touch(19106);
                }
            }
            return pressedButton;
            __touch(19104);
        }
        __touch(19054);
        function onMouseEvent(params, env, type) {
            var gooRunner = env.entity._world.gooRunner;
            __touch(19107);
            var pickResult = gooRunner.pickSync(env.mouseState.x, env.mouseState.y, env.skipUpdateBuffer);
            __touch(19108);
            if (!env.skipUpdateBuffer) {
                SystemBus.emit('ButtonScript.renderToPick');
                __touch(19112);
            }
            var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);
            __touch(19109);
            env.mouseState.downOnEntity = false;
            __touch(19110);
            if (entity === env.entity) {
                SystemBus.emit(params.channel + '.' + type, {
                    type: type,
                    entity: entity
                });
                __touch(19113);
                if (type === 'mousedown' || type === 'touchstart') {
                    env.mouseState.downOnEntity = true;
                    __touch(19114);
                }
                if (params.linkUrl && type === 'click') {
                    window.open(params.linkUrl, params.linkTarget);
                    __touch(19115);
                }
            }
            if (type === 'mousemove' && !env.mouseState.overEntity && entity === env.entity) {
                SystemBus.emit(params.channel + '.mouseover', {
                    type: 'mouseover',
                    entity: entity
                });
                __touch(19116);
            }
            if (type === 'mousemove' && env.mouseState.overEntity && entity !== env.entity) {
                SystemBus.emit(params.channel + '.mouseout', {
                    type: 'mouseout',
                    entity: entity
                });
                __touch(19117);
            }
            env.mouseState.overEntity = entity === env.entity;
            __touch(19111);
        }
        __touch(19055);
        return {
            setup: setup,
            update: update,
            cleanup: cleanup
        };
        __touch(19056);
    }
    __touch(19047);
    ButtonScript.externals = {
        key: 'ButtonScript',
        name: 'Button',
        description: 'Enables an entity to be interacted with using click or touch.',
        parameters: [
            {
                key: 'whenUsed',
                type: 'boolean',
                'default': true
            },
            {
                key: 'button',
                name: 'button',
                description: 'Only interact with this mouse button.',
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
                key: 'linkUrl',
                name: 'linkUrl',
                description: 'URL to open when clicking the entity. Leave this field empty to disable.',
                type: 'string',
                'default': ''
            },
            {
                key: 'linkTarget',
                name: 'linkTarget',
                description: 'The window to open the link in.',
                type: 'string',
                'default': '_blank'
            },
            {
                key: 'channel',
                name: 'channel',
                description: 'Event channel to emit to. Will emit channel.click, .mousedown, .mouseup, .mouseover, .mouseout, .dblclick, .touchstart, .touchend',
                type: 'string',
                'default': 'button'
            },
            {
                key: 'enableOnMouseMove',
                name: 'enableOnMouseMove',
                description: 'Enables .mousemove, .mouseover, and .mouseout events. For larger scenes, this might be worth turning off, for better performance.',
                type: 'boolean',
                'default': true
            }
        ]
    };
    __touch(19048);
    return ButtonScript;
    __touch(19049);
});
__touch(19045);