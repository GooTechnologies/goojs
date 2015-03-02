define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(658);
    var p2 = window.p2;
    __touch(659);
    function P2System(settings) {
        System.call(this, 'P2System', [
            'P2Component',
            'TransformComponent'
        ]);
        __touch(668);
        settings = settings || {};
        __touch(669);
        this.world = new p2.World({
            gravity: settings.gravity || [
                0,
                -9.82
            ]
        });
        __touch(670);
        this.stepFrequency = settings.stepFrequency || 60;
        __touch(671);
    }
    __touch(660);
    P2System.prototype = Object.create(System.prototype);
    __touch(661);
    P2System.prototype.constructor = P2System;
    __touch(662);
    function updateTransform(transformComponent, p2Component) {
        var position = p2Component.body.position, scale = p2Component.scale;
        __touch(672);
        transformComponent.transform.translation.setd(position[0] * scale, position[1] * scale, 0);
        __touch(673);
        transformComponent.transform.rotation.fromAngles(p2Component.offsetAngleX, p2Component.offsetAngleY, p2Component.offsetAngleZ + p2Component.body.angle);
        __touch(674);
        transformComponent.setUpdated();
        __touch(675);
    }
    __touch(663);
    P2System.prototype.inserted = function (entity) {
        var p2Component = entity.p2Component;
        __touch(676);
        var transformComponent = entity.transformComponent;
        __touch(677);
        var body = new p2.Body({
            mass: p2Component.mass,
            damping: p2Component.damping,
            angularDamping: p2Component.angularDamping
        });
        __touch(678);
        var body = p2Component.body = new p2.Body({
            mass: p2Component.mass,
            position: [
                transformComponent.transform.translation.x,
                transformComponent.transform.translation.y
            ]
        });
        __touch(679);
        for (var i = 0; i < p2Component.shapes.length; i++) {
            var shape = p2Component.shapes[i], p2shape;
            __touch(683);
            switch (shape.type) {
            case 'box':
                p2shape = new p2.Rectangle(shape.width, shape.height);
                break;
            case 'circle':
                p2shape = new p2.Circle(shape.radius);
                break;
            case 'plane':
                p2shape = new p2.Plane();
                break;
            default:
                throw new Error('p2 shape \'' + shape.type + '\' not recognized');
            }
            __touch(684);
            body.addShape(p2shape, shape.offset, shape.angle);
            __touch(685);
        }
        p2Component.body = body;
        __touch(680);
        updateTransform(transformComponent, p2Component);
        __touch(681);
        this.world.addBody(body);
        __touch(682);
    };
    __touch(664);
    P2System.prototype.deleted = function (entity) {
        var p2Component = entity.p2Component;
        __touch(686);
        if (p2Component) {
            this.world.removeBody(p2Component.body);
            __touch(687);
        }
    };
    __touch(665);
    P2System.prototype.process = function (entities) {
        this.world.step(1 / this.stepFrequency);
        __touch(688);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(689);
            var p2Component = entity.p2Component;
            __touch(690);
            updateTransform(entity.transformComponent, p2Component);
            __touch(691);
        }
    };
    __touch(666);
    return P2System;
    __touch(667);
});
__touch(657);