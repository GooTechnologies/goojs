define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7792);
    function TweenTextureOffsetAction() {
        Action.apply(this, arguments);
        __touch(7802);
    }
    __touch(7793);
    TweenTextureOffsetAction.prototype = Object.create(Action.prototype);
    __touch(7794);
    TweenTextureOffsetAction.prototype.constructor = TweenTextureOffsetAction;
    __touch(7795);
    TweenTextureOffsetAction.external = {
        key: 'Tween Texture Offset',
        name: 'Tween Texture',
        type: 'texture',
        description: 'Smoothly changes the texture offset of the entity',
        canTransition: true,
        parameters: [
            {
                name: 'X Offset',
                key: 'toX',
                type: 'float',
                control: 'slider',
                min: 0,
                max: 1,
                description: 'X Offset',
                'default': 1
            },
            {
                name: 'Y Offset',
                key: 'toY',
                type: 'float',
                control: 'slider',
                min: 0,
                max: 1,
                description: 'Y Offset',
                'default': 1
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'number',
                description: 'Time it takes for this transition to complete',
                'default': 1000
            },
            {
                name: 'Easing type',
                key: 'easing1',
                type: 'string',
                control: 'dropdown',
                description: 'Easing type',
                'default': 'Linear',
                options: [
                    'Linear',
                    'Quadratic',
                    'Exponential',
                    'Circular',
                    'Elastic',
                    'Back',
                    'Bounce'
                ]
            },
            {
                name: 'Direction',
                key: 'easing2',
                type: 'string',
                control: 'dropdown',
                description: 'Easing direction',
                'default': 'In',
                options: [
                    'In',
                    'Out',
                    'InOut'
                ]
            }
        ],
        transitions: [{
                key: 'complete',
                name: 'On Completion',
                description: 'State to transition to when the transition completes'
            }]
    };
    __touch(7796);
    TweenTextureOffsetAction.prototype.configure = function (settings) {
        this.toX = +settings.toX;
        __touch(7803);
        this.toY = +settings.toY;
        __touch(7804);
        this.time = +settings.time;
        __touch(7805);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7807);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7808);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7806);
    };
    __touch(7797);
    TweenTextureOffsetAction.prototype._setup = function () {
        this.tween = new window.TWEEN.Tween();
        __touch(7809);
    };
    __touch(7798);
    TweenTextureOffsetAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7810);
        }
    };
    __touch(7799);
    TweenTextureOffsetAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7811);
        if (entity.meshRendererComponent && entity.meshRendererComponent.materials.length > 0) {
            var meshRendererComponent = entity.meshRendererComponent;
            __touch(7812);
            var material = meshRendererComponent.materials[0];
            __touch(7813);
            var texture = material.getTexture('DIFFUSE_MAP');
            __touch(7814);
            if (!texture) {
                return;
                __touch(7820);
            }
            var initialOffset = texture.offset;
            __touch(7815);
            var time = entity._world.time * 1000;
            __touch(7816);
            var fakeFrom = {
                x: initialOffset.x,
                y: initialOffset.y
            };
            __touch(7817);
            var fakeTo = {
                x: this.toX,
                y: this.toY
            };
            __touch(7818);
            this.tween.from(fakeFrom).to(fakeTo, this.time).easing(this.easing).onUpdate(function () {
                texture.offset.setd(this.x, this.y);
                __touch(7821);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(7822);
            }.bind(this)).start(time);
            __touch(7819);
        }
    };
    __touch(7800);
    return TweenTextureOffsetAction;
    __touch(7801);
});
__touch(7791);