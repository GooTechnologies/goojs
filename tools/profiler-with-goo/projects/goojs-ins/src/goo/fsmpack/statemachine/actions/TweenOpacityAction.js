define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7680);
    function TweenOpacityAction() {
        Action.apply(this, arguments);
        __touch(7690);
    }
    __touch(7681);
    TweenOpacityAction.prototype = Object.create(Action.prototype);
    __touch(7682);
    TweenOpacityAction.prototype.constructor = TweenOpacityAction;
    __touch(7683);
    TweenOpacityAction.external = {
        name: 'Tween Opacity',
        type: 'texture',
        description: 'Tweens the opacity of a material',
        parameters: [
            {
                name: 'Opacity',
                key: 'to',
                type: 'float',
                control: 'spinner',
                description: 'Opacity',
                'default': 1
            },
            {
                name: 'Time (ms)',
                key: 'time',
                type: 'float',
                control: 'spinner',
                description: 'Time it takes for the transition to complete',
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
    __touch(7684);
    TweenOpacityAction.prototype.configure = function (settings) {
        this.to = settings.to;
        __touch(7691);
        this.time = settings.time;
        __touch(7692);
        if (settings.easing1 === 'Linear') {
            this.easing = window.TWEEN.Easing.Linear.None;
            __touch(7694);
        } else {
            this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
            __touch(7695);
        }
        this.eventToEmit = { channel: settings.transitions.complete };
        __touch(7693);
    };
    __touch(7685);
    TweenOpacityAction.prototype._setup = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7696);
        var meshRendererComponent = entity.meshRendererComponent;
        __touch(7697);
        if (meshRendererComponent) {
            this.tween = new window.TWEEN.Tween();
            __touch(7698);
            this.material = meshRendererComponent.materials[0];
            __touch(7699);
            this.oldBlending = this.material.blendState.blending;
            __touch(7700);
            this.oldQueue = this.material.renderQueue;
            __touch(7701);
            this.oldOpacity = this.material.uniforms.opacity;
            __touch(7702);
            this.material.blendState.blending = 'CustomBlending';
            __touch(7703);
            if (this.material.renderQueue < 2000) {
                this.material.renderQueue = 2000;
                __touch(7704);
            }
            if (this.material.uniforms.opacity === undefined) {
                this.material.uniforms.opacity = 1;
                __touch(7705);
            }
        }
    };
    __touch(7686);
    TweenOpacityAction.prototype.cleanup = function () {
        if (this.tween) {
            this.tween.stop();
            __touch(7706);
            this.material.blendState.blending = this.oldBlending;
            __touch(7707);
            this.material.renderQueue = this.oldQueue;
            __touch(7708);
            this.material.uniforms.opacity = this.oldOpacity;
            __touch(7709);
        }
    };
    __touch(7687);
    TweenOpacityAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7710);
        if (entity.meshRendererComponent) {
            var uniforms = this.material.uniforms;
            __touch(7711);
            var time = entity._world.time * 1000;
            __touch(7712);
            var fakeFrom = { opacity: uniforms.opacity };
            __touch(7713);
            var fakeTo = { opacity: this.to };
            __touch(7714);
            var old = { opacity: fakeFrom.opacity };
            __touch(7715);
            this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
                uniforms.opacity += this.opacity - old.opacity;
                __touch(7717);
                old.opacity = this.opacity;
                __touch(7718);
            }).onComplete(function () {
                fsm.send(this.eventToEmit.channel);
                __touch(7719);
            }.bind(this)).start(time);
            __touch(7716);
        }
    };
    __touch(7688);
    return TweenOpacityAction;
    __touch(7689);
});
__touch(7679);