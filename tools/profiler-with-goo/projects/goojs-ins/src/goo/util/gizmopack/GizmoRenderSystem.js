define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/SimplePartitioner',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/shaders/ShaderFragment',
    'goo/renderer/Util',
    'goo/math/Matrix3x3',
    'goo/math/Matrix4x4',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/util/gizmopack/Gizmo',
    'goo/util/gizmopack/TranslationGizmo',
    'goo/util/gizmopack/RotationGizmo',
    'goo/util/gizmopack/ScaleGizmo'
], function (System, SystemBus, SimplePartitioner, Material, ShaderLib, ShaderFragment, Util, Matrix3x3, Matrix4x4, MeshData, Shader, Gizmo, TranslationGizmo, RotationGizmo, ScaleGizmo) {
    'use strict';
    __touch(22905);
    function GizmoRenderSystem(callbacks) {
        System.call(this, 'GizmoRenderSystem', null);
        __touch(22924);
        this.renderables = [];
        __touch(22925);
        this.camera = null;
        __touch(22926);
        this.gizmos = [
            new TranslationGizmo(this),
            new RotationGizmo(this),
            new ScaleGizmo(this)
        ];
        __touch(22927);
        this.active = false;
        __touch(22928);
        this.nextGizmo = null;
        __touch(22929);
        this.setupCallbacks(callbacks);
        __touch(22930);
        this.activeGizmo = null;
        __touch(22931);
        this.viewportWidth = 0;
        __touch(22932);
        this.viewportHeight = 0;
        __touch(22933);
        this.domElement = null;
        __touch(22934);
        this.global = false;
        __touch(22935);
        this.pickingMaterial = Material.createEmptyMaterial(customPickingShader, 'pickingMaterial');
        __touch(22936);
        this.pickingMaterial.blendState = {
            blending: 'NoBlending',
            blendEquation: 'AddEquation',
            blendSrc: 'SrcAlphaFactor',
            blendDst: 'OneMinusSrcAlphaFactor'
        };
        __touch(22937);
        this._devicePixelRatio = 1;
        __touch(22938);
        this.mouseMove = function (evt) {
            if (!this.activeGizmo) {
                return;
                __touch(22946);
            }
            var x = evt.offsetX !== undefined ? evt.offsetX : evt.layerX;
            __touch(22942);
            var y = evt.offsetY !== undefined ? evt.offsetY : evt.layerY;
            __touch(22943);
            var mousePos = [
                x / (this.viewportWidth / this._devicePixelRatio),
                y / (this.viewportHeight / this._devicePixelRatio)
            ];
            __touch(22944);
            this.activeGizmo.update(mousePos);
            __touch(22945);
        }.bind(this);
        __touch(22939);
        var that = this;
        __touch(22940);
        SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
            that.camera = newCam.camera;
            __touch(22947);
        });
        __touch(22941);
    }
    __touch(22906);
    GizmoRenderSystem.prototype = Object.create(System.prototype);
    __touch(22907);
    GizmoRenderSystem.prototype.activate = function (id, x, y) {
        this.active = true;
        __touch(22948);
        var handle = Gizmo.getHandle(id);
        __touch(22949);
        if (handle && this.activeGizmo) {
            this.activeGizmo.activate({
                id: id,
                data: handle,
                x: x / (this.viewportWidth / this._devicePixelRatio),
                y: y / (this.viewportHeight / this._devicePixelRatio)
            });
            __touch(22950);
            this.domElement.addEventListener('mousemove', this.mouseMove);
            __touch(22951);
        }
    };
    __touch(22908);
    GizmoRenderSystem.prototype.deactivate = function () {
        this.activeGizmo.deactivate();
        __touch(22952);
        this.active = false;
        __touch(22953);
        this.domElement.removeEventListener('mousemove', this.mouseMove);
        __touch(22954);
        if (this.nextGizmo !== null) {
            this.setActiveGizmo(this.nextGizmo);
            __touch(22955);
            this.nextGizmo = null;
            __touch(22956);
        }
    };
    __touch(22909);
    GizmoRenderSystem.prototype.getGizmo = function (id) {
        return this.gizmos[id];
        __touch(22957);
    };
    __touch(22910);
    GizmoRenderSystem.prototype.show = function (entity) {
        this.entity = entity;
        __touch(22958);
        if (this.activeGizmo) {
            if (this.entity) {
                this.showGizmo(this.activeGizmo);
                __touch(22959);
            } else {
                this.hideGizmo(this.activeGizmo);
                __touch(22960);
            }
        }
    };
    __touch(22911);
    GizmoRenderSystem.prototype.showGizmo = function (gizmo) {
        gizmo.copyTransform(this.entity.transformComponent.worldTransform, this.global);
        __touch(22961);
        if (!gizmo.visible) {
            this.renderables = gizmo.renderables;
            __touch(22962);
            gizmo.visible = true;
            __touch(22963);
        }
    };
    __touch(22912);
    GizmoRenderSystem.prototype.hideGizmo = function (gizmo) {
        if (gizmo.visible) {
            this.renderables = [];
            __touch(22964);
            gizmo.visible = false;
            __touch(22965);
        }
    };
    __touch(22913);
    GizmoRenderSystem.prototype.setActiveGizmo = function (id) {
        if (this.active) {
            this.nextGizmo = id;
            __touch(22967);
            return;
            __touch(22968);
        }
        if (this.activeGizmo) {
            this.hideGizmo(this.activeGizmo);
            __touch(22969);
        }
        this.activeGizmo = this.gizmos[id] || null;
        __touch(22966);
        if (this.activeGizmo && this.entity) {
            this.showGizmo(this.activeGizmo);
            __touch(22970);
        }
    };
    __touch(22914);
    GizmoRenderSystem.prototype.setGlobal = function (global) {
        if (this.global !== global) {
            this.global = !!global;
            __touch(22971);
            if (this.entity && this.activeGizmo) {
                this.showGizmo(this.activeGizmo);
                __touch(22972);
            }
        }
    };
    __touch(22915);
    GizmoRenderSystem.prototype.setupCallbacks = function (callbacks) {
        if (callbacks && callbacks.length === 3) {
            this.gizmos[0].onChange = callbacks[0];
            __touch(22978);
            this.gizmos[1].onChange = callbacks[1];
            __touch(22979);
            this.gizmos[2].onChange = callbacks[2];
            __touch(22980);
            return;
            __touch(22981);
        }
        var inverseRotation = new Matrix3x3();
        __touch(22973);
        var inverseTransformation = new Matrix4x4();
        __touch(22974);
        this.gizmos[0].onChange = function (change) {
            if (this.entity) {
                var translation = this.entity.transformComponent.transform.translation;
                __touch(22982);
                translation.setv(change);
                __touch(22983);
                if (this.entity.transformComponent.parent) {
                    inverseTransformation.copy(this.entity.transformComponent.parent.worldTransform.matrix);
                    __touch(22985);
                    inverseTransformation.invert();
                    __touch(22986);
                    inverseTransformation.applyPostPoint(translation);
                    __touch(22987);
                }
                this.entity.transformComponent.setUpdated();
                __touch(22984);
            }
        }.bind(this);
        __touch(22975);
        this.gizmos[1].onChange = function (change) {
            if (this.entity) {
                this.entity.transformComponent.transform.rotation.copy(change);
                __touch(22988);
                if (this.entity.transformComponent.parent) {
                    inverseRotation.copy(this.entity.transformComponent.parent.worldTransform.rotation);
                    __touch(22991);
                    inverseRotation.invert();
                    __touch(22992);
                }
                Matrix3x3.combine(inverseRotation, this.entity.transformComponent.transform.rotation, this.entity.transformComponent.transform.rotation);
                __touch(22989);
                this.entity.transformComponent.setUpdated();
                __touch(22990);
            }
        }.bind(this);
        __touch(22976);
        this.gizmos[2].onChange = function (change) {
            if (this.entity) {
                var scale = this.entity.transformComponent.transform.scale;
                __touch(22993);
                scale.setv(change);
                __touch(22994);
                if (this.entity.transformComponent.parent) {
                    scale.div(this.entity.transformComponent.parent.worldTransform.scale);
                    __touch(22996);
                }
                this.entity.transformComponent.setUpdated();
                __touch(22995);
            }
        }.bind(this);
        __touch(22977);
    };
    __touch(22916);
    GizmoRenderSystem.prototype.inserted = function () {
    };
    __touch(22917);
    GizmoRenderSystem.prototype.deleted = function () {
    };
    __touch(22918);
    GizmoRenderSystem.prototype.process = function () {
        if (this.activeGizmo) {
            if (this.activeGizmo.dirty) {
                this.activeGizmo.process();
                __touch(22998);
            } else if (this.entity && this.entity.transformComponent._updated && !this.active) {
                this.activeGizmo.copyTransform(this.entity.transformComponent.worldTransform, this.global);
                __touch(22999);
            }
            this.activeGizmo.updateTransforms();
            __touch(22997);
        }
    };
    __touch(22919);
    GizmoRenderSystem.prototype.render = function (renderer) {
        renderer.checkResize(this.camera);
        __touch(23000);
        this._devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / renderer.svg.currentScale : 1;
        __touch(23001);
        if (!this.domElement) {
            this.domElement = renderer.domElement;
            __touch(23004);
        }
        this.viewportHeight = renderer.viewportHeight;
        __touch(23002);
        this.viewportWidth = renderer.viewportWidth;
        __touch(23003);
        if (this.camera) {
            renderer.render(this.renderables, this.camera, this.lights, null, {
                color: false,
                stencil: true,
                depth: true
            }, this.overrideMaterials);
            __touch(23005);
        }
    };
    __touch(22920);
    GizmoRenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
        for (var i = 0; i < this.renderables.length; i++) {
            var renderable = this.renderables[i];
            __touch(23007);
            if (renderable.thickness !== undefined) {
                renderable.materials[0].uniforms.thickness = renderable.thickness;
                __touch(23008);
            }
        }
        renderer.renderToPick(this.renderables, this.camera, {
            color: false,
            stencil: true,
            depth: true
        }, skipUpdateBuffer, undefined, undefined, undefined, this.pickingMaterial);
        __touch(23006);
        for (var i = 0; i < this.renderables.length; i++) {
            var renderable = this.renderables[i];
            __touch(23009);
            if (renderable.thickness) {
                renderable.materials[0].uniforms.thickness = 0;
                __touch(23010);
            }
        }
    };
    __touch(22921);
    var customPickingShader = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexNormal: MeshData.NORMAL
        },
        processors: [function (shader, shaderInfo) {
                var attributeMap = shaderInfo.meshData.attributeMap;
                __touch(23011);
                shader.defines = shader.defines || {};
                __touch(23012);
                for (var attribute in attributeMap) {
                    if (!shader.defines[attribute]) {
                        shader.defines[attribute] = true;
                        __touch(23014);
                    }
                }
                __touch(23013);
            }],
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraFar: Shader.FAR_PLANE,
            thickness: 0,
            id: function (shaderInfo) {
                return shaderInfo.renderable.id + 1;
                __touch(23015);
            }
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            '#ifdef NORMAL',
            'attribute vec3 vertexNormal;',
            '#endif',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform float cameraFar;',
            'uniform float thickness;',
            'varying float depth;',
            'void main() {',
            '#ifdef NORMAL',
            'vec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition + vertexNormal * thickness, 1.0 );',
            '#else',
            'vec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
            '#endif',
            'depth = length(mvPosition.xyz) / cameraFar;',
            'gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform float id;',
            'varying float depth;',
            ShaderFragment.methods.packDepth16,
            'void main() {',
            'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
            'vec2 packedDepth = packDepth16(depth);',
            'gl_FragColor = vec4(packedId, packedDepth);',
            '}'
        ].join('\n')
    };
    __touch(22922);
    return GizmoRenderSystem;
    __touch(22923);
});
__touch(22904);