define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/SimplePartitioner',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Util'
], function (System, SystemBus, SimplePartitioner, Material, ShaderLib, Util) {
    'use strict';
    __touch(5600);
    function RenderSystem() {
        System.call(this, 'RenderSystem', [
            'MeshRendererComponent',
            'MeshDataComponent'
        ]);
        __touch(5613);
        this.entities = [];
        __touch(5614);
        this.renderList = [];
        __touch(5615);
        this.postRenderables = [];
        __touch(5616);
        this.partitioner = new SimplePartitioner();
        __touch(5617);
        this.preRenderers = [];
        __touch(5618);
        this.composers = [];
        __touch(5619);
        this._composersActive = true;
        __touch(5620);
        this.doRender = true;
        __touch(5621);
        this._debugMaterials = {};
        __touch(5622);
        this.overrideMaterials = [];
        __touch(5623);
        this.partitioningCamera = null;
        __touch(5624);
        this.camera = null;
        __touch(5625);
        this.lights = [];
        __touch(5626);
        this.currentTpf = 0;
        __touch(5627);
        SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
            this.camera = newCam.camera;
            __touch(5631);
        }.bind(this));
        __touch(5628);
        SystemBus.addListener('goo.setLights', function (lights) {
            this.lights = lights;
            __touch(5632);
        }.bind(this));
        __touch(5629);
        this.picking = {
            doPick: false,
            x: 0,
            y: 0,
            pickingStore: {},
            pickingCallback: function (id, depth) {
                console.log(id, depth);
                __touch(5633);
            },
            skipUpdateBuffer: false
        };
        __touch(5630);
    }
    __touch(5601);
    RenderSystem.prototype = Object.create(System.prototype);
    __touch(5602);
    RenderSystem.prototype.pick = function (x, y, callback, skipUpdateBuffer) {
        this.picking.x = x;
        __touch(5634);
        this.picking.y = y;
        __touch(5635);
        this.picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
        __touch(5636);
        if (callback) {
            this.picking.pickingCallback = callback;
            __touch(5638);
        }
        this.picking.doPick = true;
        __touch(5637);
    };
    __touch(5603);
    RenderSystem.prototype.inserted = function (entity) {
        if (this.partitioner) {
            this.partitioner.added(entity);
            __touch(5639);
        }
    };
    __touch(5604);
    RenderSystem.prototype.deleted = function (entity) {
        if (this.partitioner) {
            this.partitioner.removed(entity);
            __touch(5640);
        }
    };
    __touch(5605);
    RenderSystem.prototype.process = function (entities, tpf) {
        this.entities = entities;
        __touch(5641);
        this.currentTpf = tpf;
        __touch(5642);
    };
    __touch(5606);
    RenderSystem.prototype.render = function (renderer) {
        if (!this.doRender) {
            return;
            __touch(5643);
        }
        if (this.camera) {
            renderer.updateShadows(this.partitioner, this.entities, this.lights);
            __touch(5644);
            for (var i = 0; i < this.preRenderers.length; i++) {
                var preRenderer = this.preRenderers[i];
                __touch(5645);
                preRenderer.process(renderer, this.entities, this.partitioner, this.camera, this.lights);
                __touch(5646);
            }
            if (this.partitioningCamera) {
                this.partitioner.process(this.partitioningCamera, this.entities, this.renderList);
                __touch(5647);
            } else {
                this.partitioner.process(this.camera, this.entities, this.renderList);
                __touch(5648);
            }
            if (this.composers.length > 0 && this._composersActive) {
                for (var i = 0; i < this.composers.length; i++) {
                    var composer = this.composers[i];
                    __touch(5649);
                    composer.render(renderer, this.currentTpf, this.camera, this.lights, null, true, this.overrideMaterials);
                    __touch(5650);
                }
            } else {
                renderer.render(this.renderList, this.camera, this.lights, null, true, this.overrideMaterials);
                __touch(5651);
            }
        }
    };
    __touch(5607);
    RenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
        renderer.renderToPick(this.renderList, this.camera, true, skipUpdateBuffer);
        __touch(5652);
    };
    __touch(5608);
    RenderSystem.prototype.enableComposers = function (activate) {
        this._composersActive = !!activate;
        __touch(5653);
    };
    __touch(5609);
    RenderSystem.prototype._createDebugMaterial = function (key) {
        if (key === '') {
            return;
            __touch(5658);
        }
        var fshader;
        __touch(5654);
        switch (key) {
        case 'wireframe':
        case 'color':
            fshader = Util.clone(ShaderLib.simpleColored.fshader);
            break;
        case 'lit':
            fshader = Util.clone(ShaderLib.simpleLit.fshader);
            break;
        case 'texture':
            fshader = Util.clone(ShaderLib.textured.fshader);
            break;
        case 'normals':
            fshader = Util.clone(ShaderLib.showNormals.fshader);
            break;
        case 'simple':
            fshader = Util.clone(ShaderLib.simple.fshader);
            break;
        }
        __touch(5655);
        var shaderDef = Util.clone(ShaderLib.uber);
        __touch(5656);
        shaderDef.fshader = fshader;
        __touch(5657);
        if (key !== 'flat') {
            this._debugMaterials[key] = new Material(shaderDef, key);
            __touch(5659);
            if (key === 'wireframe') {
                this._debugMaterials[key].wireframe = true;
                __touch(5660);
            }
            if (key === 'lit') {
                this._debugMaterials[key]._textureMaps = {
                    EMISSIVE_MAP: null,
                    DIFFUSE_MAP: null,
                    SPECULAR_MAP: null,
                    NORMAL_MAP: null,
                    AO_MAP: null,
                    LIGHT_MAP: null,
                    TRANSPARENCY_MAP: null
                };
                __touch(5661);
            }
        } else {
            this._debugMaterials[key] = Material.createEmptyMaterial(null, key);
            __touch(5662);
            this._debugMaterials[key].flat = true;
            __touch(5663);
        }
    };
    __touch(5610);
    RenderSystem.prototype.setDebugMaterial = function (key) {
        if (!key || key === '') {
            this.overrideMaterials = [];
            __touch(5666);
            return;
            __touch(5667);
        }
        var debugs = key.split('+');
        __touch(5664);
        this.overrideMaterials = [];
        __touch(5665);
        for (var i = 0; i < debugs.length; i++) {
            var key = debugs[i];
            __touch(5668);
            if (!this._debugMaterials[key]) {
                this._createDebugMaterial(key);
                __touch(5669);
            }
            if (key === '') {
                this.overrideMaterials.push(null);
                __touch(5670);
            } else {
                this.overrideMaterials.push(this._debugMaterials[key]);
                __touch(5671);
            }
        }
    };
    __touch(5611);
    return RenderSystem;
    __touch(5612);
});
__touch(5599);