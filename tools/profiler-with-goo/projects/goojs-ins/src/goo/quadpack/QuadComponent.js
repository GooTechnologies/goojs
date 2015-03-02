define([
    'goo/entities/components/Component',
    'goo/renderer/MeshData',
    'goo/quadpack/DoubleQuad',
    'goo/entities/components/MeshDataComponent',
    'goo/entities/components/MeshRendererComponent',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Material',
    'goo/util/ObjectUtil',
    'goo/renderer/Texture'
], function (Component, MeshData, DoubleQuad, MeshDataComponent, MeshRendererComponent, ShaderLib, Material, _, Texture) {
    'use strict';
    __touch(15298);
    function QuadComponent(image, settings) {
        settings = settings || {};
        __touch(15308);
        var defaults = {
            width: 1,
            height: 1,
            tileX: 1,
            tileY: 1,
            preserveAspectRatio: true
        };
        __touch(15309);
        _.defaults(settings, defaults);
        __touch(15310);
        this.type = 'QuadComponent';
        __touch(15311);
        this.width = settings.width;
        __touch(15312);
        this.oldWidth = 0;
        __touch(15313);
        this.height = settings.height;
        __touch(15314);
        this.oldHeight = 0;
        __touch(15315);
        this.tileX = settings.tileX;
        __touch(15316);
        this.oldTileX = 0;
        __touch(15317);
        this.tileY = settings.tileY;
        __touch(15318);
        this.oldTileY = 0;
        __touch(15319);
        this.preserveAspectRatio = settings.preserveAspectRatio;
        __touch(15320);
        this.meshRendererComponent = new MeshRendererComponent();
        __touch(15321);
        this.material = new Material(ShaderLib.uber, 'QuadComponent default material');
        __touch(15322);
        this.meshData = new DoubleQuad(settings.width, settings.height, settings.tileX, settings.tileY);
        __touch(15323);
        this.meshDataComponent = new MeshDataComponent(this.meshData);
        __touch(15324);
        var material = this.material;
        __touch(15325);
        material.blendState.blending = 'CustomBlending';
        __touch(15326);
        material.renderQueue = 2000;
        __touch(15327);
        material.uniforms.discardThreshold = 0.1;
        __touch(15328);
        this.setMaterial(material);
        __touch(15329);
        if (image) {
            var texture = new Texture(image);
            __touch(15331);
            texture.anisotropy = 16;
            __touch(15332);
            texture.wrapS = 'EdgeClamp';
            __touch(15333);
            texture.wrapT = 'EdgeClamp';
            __touch(15334);
            material.setTexture('DIFFUSE_MAP', texture);
            __touch(15335);
        }
        this.rebuildMeshData();
        __touch(15330);
    }
    __touch(15299);
    QuadComponent.prototype = Object.create(Component.prototype);
    __touch(15300);
    QuadComponent.prototype.constructor = QuadComponent;
    __touch(15301);
    QuadComponent.prototype.attached = function (entity) {
        entity.setComponent(entity.quadComponent.meshRendererComponent);
        __touch(15336);
        entity.setComponent(entity.quadComponent.meshDataComponent);
        __touch(15337);
    };
    __touch(15302);
    QuadComponent.prototype.detached = function (entity) {
        entity.clearComponent('meshRendererComponent');
        __touch(15338);
        entity.clearComponent('meshDataComponent');
        __touch(15339);
    };
    __touch(15303);
    QuadComponent.prototype.destroy = function (context) {
        this.meshData.destroy(context);
        __touch(15340);
    };
    __touch(15304);
    QuadComponent.prototype.setMaterial = function (material) {
        this.material = material;
        __touch(15341);
        this.meshRendererComponent.materials = [material];
        __touch(15342);
    };
    __touch(15305);
    QuadComponent.prototype.rebuildMeshData = function () {
        var material = this.material;
        __touch(15343);
        var texture = material.getTexture('DIFFUSE_MAP');
        __touch(15344);
        if (!texture) {
            return;
            __touch(15346);
        }
        var image = texture.image;
        __touch(15345);
        if (!image) {
            return;
            __touch(15347);
        }
        if (this.preserveAspectRatio && image) {
            var width = image.originalWidth || image.svgWidth || image.width;
            __touch(15348);
            var height = image.originalHeight || image.svgHeight || image.height;
            __touch(15349);
            this.width = width / 100;
            __touch(15350);
            this.height = height / 100;
            __touch(15351);
        }
        if (this.width !== this.oldWidth || this.height !== this.oldHeight || this.tileX !== this.oldTileX || this.tileY !== this.oldTileY) {
            this.oldWidth = this.width;
            __touch(15352);
            this.oldHeight = this.height;
            __touch(15353);
            this.oldTileX = this.tileX;
            __touch(15354);
            this.oldTileY = this.tileY;
            __touch(15355);
            var meshData = this.meshData;
            __touch(15356);
            meshData.xExtent = this.width * 0.5;
            __touch(15357);
            meshData.yExtent = this.height * 0.5;
            __touch(15358);
            meshData.tileX = this.tileX;
            __touch(15359);
            meshData.tileY = this.tileY;
            __touch(15360);
            meshData.rebuild();
            __touch(15361);
            meshData.setVertexDataUpdated();
            __touch(15362);
        }
    };
    __touch(15306);
    return QuadComponent;
    __touch(15307);
});
__touch(15297);