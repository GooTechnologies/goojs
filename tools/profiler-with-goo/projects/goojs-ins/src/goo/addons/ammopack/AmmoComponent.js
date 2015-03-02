define([
    'goo/entities/EntityUtils',
    'goo/entities/components/Component',
    'goo/math/Quaternion',
    'goo/addons/ammopack/calculateTriangleMeshShape',
    'goo/shapes/Box',
    'goo/shapes/Quad',
    'goo/shapes/Sphere',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere',
    'goo/util/ObjectUtil'
], function (EntityUtils, Component, Quaternion, calculateTriangleMeshShape, Box, Quad, Sphere, Material, ShaderLib, BoundingBox, BoundingSphere, _) {
    'use strict';
    __touch(1);
    function AmmoComponent(settings) {
        this.settings = settings = settings || {};
        __touch(12);
        _.defaults(settings, {
            mass: 0,
            useBounds: false,
            useWorldBounds: false,
            useWorldTransform: false,
            linearFactor: new Ammo.btVector3(1, 1, 1),
            isTrigger: false,
            onInitializeBody: null,
            scale: null,
            translation: null,
            rotation: null
        });
        __touch(13);
        this.mass = settings.mass;
        __touch(14);
        this.useBounds = settings.useBounds;
        __touch(15);
        this.useWorldBounds = settings.useWorldBounds;
        __touch(16);
        this.useWorldTransform = settings.useWorldTransform;
        __touch(17);
        this.linearFactor = settings.linearFactor;
        __touch(18);
        this.onInitializeBody = settings.onInitializeBody;
        __touch(19);
        this.isTrigger = settings.isTrigger;
        __touch(20);
        this.scale = settings.scale;
        __touch(21);
        this.translation = settings.translation;
        __touch(22);
        this.rotation = settings.rotation;
        __touch(23);
        this.type = 'AmmoComponent';
        __touch(24);
        this.ammoTransform = new Ammo.btTransform();
        __touch(25);
        this.gooQuaternion = new Quaternion();
        __touch(26);
        this.shape = undefined;
        __touch(27);
    }
    __touch(2);
    AmmoComponent.prototype = Object.create(Component.prototype);
    __touch(3);
    AmmoComponent.prototype.constructor = AmmoComponent;
    __touch(4);
    AmmoComponent.prototype.getAmmoShapefromGooShape = function (entity, gooTransform) {
        var shape;
        __touch(28);
        var scale = [
            Math.abs(gooTransform.scale.x),
            Math.abs(gooTransform.scale.y),
            Math.abs(gooTransform.scale.z)
        ];
        __touch(29);
        if (this.scale) {
            scale = [
                Math.abs(this.scale.x),
                Math.abs(this.scale.y),
                Math.abs(this.scale.z)
            ];
            __touch(31);
        }
        if (entity.meshDataComponent && entity.meshDataComponent.meshData) {
            var meshData = entity.meshDataComponent.meshData;
            __touch(32);
            if (meshData instanceof Box) {
                shape = new Ammo.btBoxShape(new Ammo.btVector3(meshData.xExtent * scale[0], meshData.yExtent * scale[1], meshData.zExtent * scale[2]));
                __touch(33);
            } else if (meshData instanceof Sphere) {
                shape = new Ammo.btSphereShape(meshData.radius * scale[0]);
                __touch(34);
            } else if (meshData instanceof Quad) {
                shape = new Ammo.btBoxShape(new Ammo.btVector3(meshData.xExtent, meshData.yExtent, 0.01));
                __touch(35);
            } else {
                if (this.useBounds || this.mass > 0) {
                    entity.meshDataComponent.computeBoundFromPoints();
                    __touch(36);
                    var bound = entity.meshDataComponent.modelBound;
                    __touch(37);
                    if (bound instanceof BoundingBox) {
                        shape = new Ammo.btBoxShape(new Ammo.btVector3(bound.xExtent * scale[0], bound.yExtent * scale[1], bound.zExtent * scale[2]));
                        __touch(38);
                    } else if (bound instanceof BoundingSphere) {
                        shape = new Ammo.btSphereShape(bound.radius * scale[0]);
                        __touch(39);
                    }
                } else {
                    shape = calculateTriangleMeshShape(entity, scale);
                    __touch(40);
                }
            }
        } else {
            var shape = new Ammo.btCompoundShape();
            __touch(41);
            var c = entity.transformComponent.children;
            __touch(42);
            for (var i = 0; i < c.length; i++) {
                var childAmmoShape = this.getAmmoShapefromGooShape(c[i].entity, gooTransform);
                __touch(43);
                var localTrans = new Ammo.btTransform();
                __touch(44);
                localTrans.setIdentity();
                __touch(45);
                var gooPos = c[i].transform.translation;
                __touch(46);
                localTrans.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
                __touch(47);
                shape.addChildShape(localTrans, childAmmoShape);
                __touch(48);
            }
        }
        return shape;
        __touch(30);
    };
    __touch(5);
    AmmoComponent.prototype.getAmmoShapefromGooShapeWorldBounds = function (entity) {
        var shape;
        __touch(49);
        var bound = EntityUtils.getTotalBoundingBox(entity);
        __touch(50);
        this.center = bound.center;
        __touch(51);
        shape = new Ammo.btBoxShape(new Ammo.btVector3(bound.xExtent, bound.yExtent, bound.zExtent));
        __touch(52);
        return shape;
        __touch(53);
    };
    __touch(6);
    AmmoComponent.prototype.initialize = function (entity) {
        var gooTransform = entity.transformComponent.transform;
        __touch(54);
        if (this.useWorldTransform) {
            gooTransform = entity.transformComponent.worldTransform;
            __touch(63);
        }
        var gooPos = this.translation || gooTransform.translation;
        __touch(55);
        var gooRot = this.rotation || gooTransform.rotation;
        __touch(56);
        var ammoTransform = new Ammo.btTransform();
        __touch(57);
        ammoTransform.setIdentity();
        __touch(58);
        ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
        __touch(59);
        this.gooQuaternion.fromRotationMatrix(gooRot);
        __touch(60);
        var q = this.gooQuaternion;
        __touch(61);
        ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
        __touch(62);
        if (this.useWorldBounds) {
            entity._world.process();
            __touch(64);
            this.shape = this.getAmmoShapefromGooShapeWorldBounds(entity, gooTransform);
            __touch(65);
            this.difference = this.center.clone().sub(gooTransform.translation).invert();
            __touch(66);
        } else {
            this.shape = this.getAmmoShapefromGooShape(entity, gooTransform);
            __touch(67);
        }
        if (false === this.isTrigger) {
            var motionState = new Ammo.btDefaultMotionState(ammoTransform);
            __touch(68);
            var localInertia = new Ammo.btVector3(0, 0, 0);
            __touch(69);
            if (this.mass !== 0) {
                this.shape.calculateLocalInertia(this.mass, localInertia);
                __touch(74);
            }
            var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, this.shape, localInertia);
            __touch(70);
            this.localInertia = localInertia;
            __touch(71);
            this.body = new Ammo.btRigidBody(info);
            __touch(72);
            this.body.setLinearFactor(this.linearFactor);
            __touch(73);
            if (this.onInitializeBody) {
                this.onInitializeBody(this.body);
                __touch(75);
            }
        }
    };
    __touch(7);
    AmmoComponent.prototype.showBounds = function (entity) {
        var bound = EntityUtils.getTotalBoundingBox(entity);
        __touch(76);
        var bv;
        __touch(77);
        var material = new Material(ShaderLib.simpleLit);
        __touch(78);
        material.wireframe = true;
        __touch(79);
        if (bound.xExtent) {
            bv = entity._world.createEntity(new Box(bound.xExtent * 2, bound.yExtent * 2, bound.zExtent * 2), material);
            __touch(83);
        } else if (bound.radius) {
            bv = entity._world.createEntity(new Sphere(12, 12, bound.radius), material);
            __touch(84);
        }
        bv.transformComponent.setTranslation(bound.center);
        __touch(80);
        bv.addToWorld();
        __touch(81);
        this.bv = bv;
        __touch(82);
    };
    __touch(8);
    AmmoComponent.prototype.setPhysicalTransform = function (transform) {
        var gooPos = transform.translation;
        __touch(85);
        this.ammoTransform.setIdentity();
        __touch(86);
        this.ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
        __touch(87);
        this.gooQuaternion.fromRotationMatrix(transform.rotation);
        __touch(88);
        var q = this.gooQuaternion;
        __touch(89);
        this.ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
        __touch(90);
        this.body.setWorldTransform(this.ammoTransform);
        __touch(91);
    };
    __touch(9);
    AmmoComponent.prototype.copyPhysicalTransformToVisual = function (entity) {
        var tc = entity.transformComponent;
        __touch(92);
        if (!this.body) {
            return;
            __touch(99);
        }
        this.body.getMotionState().getWorldTransform(this.ammoTransform);
        __touch(93);
        var ammoQuat = this.ammoTransform.getRotation();
        __touch(94);
        this.gooQuaternion.setd(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
        __touch(95);
        tc.transform.rotation.copyQuaternion(this.gooQuaternion);
        __touch(96);
        var origin = this.ammoTransform.getOrigin();
        __touch(97);
        tc.setTranslation(origin.x(), origin.y(), origin.z());
        __touch(98);
        if (this.settings.showBounds) {
            if (!this.bv) {
                this.showBounds(entity);
                __touch(102);
            }
            this.bv.transformComponent.transform.rotation.copy(tc.transform.rotation);
            __touch(100);
            this.bv.transformComponent.setTranslation(tc.transform.translation);
            __touch(101);
        }
        if (this.difference) {
            tc.addTranslation(this.difference);
            __touch(103);
        }
    };
    __touch(10);
    return AmmoComponent;
    __touch(11);
});
__touch(0);