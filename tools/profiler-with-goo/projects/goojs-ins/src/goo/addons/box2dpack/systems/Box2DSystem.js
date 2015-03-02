define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(188);
    function Box2DSystem() {
        System.call(this, 'Box2DSystem', [
            'Box2DComponent',
            'MeshDataComponent'
        ]);
        __touch(196);
        this.SCALE = 0.5;
        __touch(197);
        this.world = new Box2D.b2World(new Box2D.b2Vec2(0, -9.81));
        __touch(198);
        this.sortVertexesClockWise = function (a, b) {
            var aAngle = Math.atan2(a.get_y(), a.get_x());
            __touch(204);
            var bAngle = Math.atan2(b.get_y(), b.get_x());
            __touch(205);
            return aAngle > bAngle ? 1 : -1;
            __touch(206);
        };
        __touch(199);
        this.velocityIterations = 8;
        __touch(200);
        this.positionIterations = 3;
        __touch(201);
        var FLOAT_SIZE = 4;
        __touch(202);
        this.createPolygonShape = function (vertices) {
            var shape = new Box2D.b2PolygonShape();
            __touch(207);
            var buffer = Box2D.allocate(vertices.length * FLOAT_SIZE * 2, 'float', Box2D.ALLOC_STACK);
            __touch(208);
            var offset = 0;
            __touch(209);
            for (var i = 0; i < vertices.length; i++) {
                Box2D.setValue(buffer + offset, vertices[i].get_x(), 'float');
                __touch(213);
                Box2D.setValue(buffer + (offset + FLOAT_SIZE), vertices[i].get_y(), 'float');
                __touch(214);
                offset += FLOAT_SIZE * 2;
                __touch(215);
            }
            var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
            __touch(210);
            shape.Set(ptr_wrapped, vertices.length);
            __touch(211);
            return shape;
            __touch(212);
        };
        __touch(203);
    }
    __touch(189);
    Box2DSystem.prototype = Object.create(System.prototype);
    __touch(190);
    Box2DSystem.prototype.constructor = Box2DSystem;
    __touch(191);
    Box2DSystem.prototype.inserted = function (entity) {
        var p = entity.box2DComponent;
        __touch(216);
        var height = 0;
        __touch(217);
        var width = 0;
        __touch(218);
        var shape = new Box2D.b2PolygonShape();
        __touch(219);
        if (p.shape === 'box') {
            shape.SetAsBox(p.width * this.SCALE, p.height * this.SCALE);
            __touch(238);
        } else if (p.shape === 'circle') {
            shape = new Box2D.b2CircleShape();
            __touch(239);
            shape.set_m_radius(p.radius);
            __touch(240);
        } else if (p.shape === 'mesh') {
            var meshData = entity.meshDataComponent.meshData;
            __touch(241);
            var verts = meshData.getAttributeBuffer('POSITION');
            __touch(242);
            var i = 0;
            __touch(243);
            var polygon = [];
            __touch(244);
            var minY = Infinity;
            __touch(245);
            var maxY = -Infinity;
            __touch(246);
            var minX = Infinity;
            __touch(247);
            var maxX = -Infinity;
            __touch(248);
            while (i <= verts.length - 3) {
                var x = verts[i];
                __touch(253);
                var y = verts[++i];
                __touch(254);
                if (y < minY) {
                    minY = y;
                    __touch(259);
                }
                if (y > maxY) {
                    maxY = y;
                    __touch(260);
                }
                if (x < minX) {
                    minX = x;
                    __touch(261);
                }
                if (x > maxX) {
                    maxX = x;
                    __touch(262);
                }
                ++i;
                __touch(255);
                entity.transformComponent.updateWorldTransform();
                __touch(256);
                var v = new Box2D.b2Vec2(x, y);
                __touch(257);
                polygon.push(v);
                __touch(258);
            }
            __touch(249);
            shape = this.createPolygonShape(polygon);
            __touch(250);
            height = maxY - minY;
            __touch(251);
            width = maxX - minX;
            __touch(252);
        } else if (p.shape === 'polygon') {
            var polygon = [];
            __touch(263);
            var i = 0;
            __touch(264);
            while (i <= p.vertices.length - 2) {
                var v = new Box2D.b2Vec2(p.vertices[i], p.vertices[++i]);
                __touch(267);
                polygon.push(v);
                __touch(268);
                ++i;
                __touch(269);
            }
            __touch(265);
            shape = this.createPolygonShape(polygon);
            __touch(266);
        }
        var fd = new Box2D.b2FixtureDef();
        __touch(220);
        fd.set_shape(shape);
        __touch(221);
        fd.set_density(1);
        __touch(222);
        fd.set_friction(p.friction);
        __touch(223);
        fd.set_restitution(p.restitution);
        __touch(224);
        var bd = new Box2D.b2BodyDef();
        __touch(225);
        if (p.movable === true) {
            bd.set_type(Box2D.b2_dynamicBody);
            __touch(270);
        }
        bd.set_position(new Box2D.b2Vec2(entity.transformComponent.transform.translation.x + p.offsetX, entity.transformComponent.transform.translation.y + p.offsetY));
        __touch(226);
        var rotAngles = entity.transformComponent.transform.rotation.toAngles();
        __touch(227);
        bd.set_angle(rotAngles.z);
        __touch(228);
        var body = this.world.CreateBody(bd);
        __touch(229);
        body.CreateFixture(fd);
        __touch(230);
        body.SetLinearDamping(0.95);
        __touch(231);
        body.SetAngularDamping(0.6);
        __touch(232);
        p.body = body;
        __touch(233);
        p.world = this.world;
        __touch(234);
        entity.body = body;
        __touch(235);
        entity.body.h = height;
        __touch(236);
        entity.body.w = width;
        __touch(237);
    };
    __touch(192);
    Box2DSystem.prototype.deleted = function (entity) {
        this.world.DestroyBody(entity.body);
        __touch(271);
    };
    __touch(193);
    Box2DSystem.prototype.process = function (entities, tpf) {
        this.world.Step(tpf, this.velocityIterations, this.positionIterations);
        __touch(272);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(273);
            var transformComponent = entity.transformComponent;
            __touch(274);
            var transform = transformComponent.transform;
            __touch(275);
            var position = entity.body.GetPosition();
            __touch(276);
            var posX = position.get_x();
            __touch(277);
            var posY = position.get_y();
            __touch(278);
            if (posY < -10) {
                entity.removeFromWorld();
                __touch(283);
                continue;
                __touch(284);
            }
            transform.translation.x = posX - entity.box2DComponent.offsetX;
            __touch(279);
            transform.translation.y = posY - entity.box2DComponent.offsetY;
            __touch(280);
            transformComponent.setRotation(0, 0, entity.body.GetAngle());
            __touch(281);
            transformComponent.setUpdated();
            __touch(282);
        }
    };
    __touch(194);
    return Box2DSystem;
    __touch(195);
});
__touch(187);