define([
    'goo/renderer/shaders/ShaderBuilder',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/Material',
    'goo/renderer/Renderer',
    'goo/math/Transform',
    'goo/math/Matrix4x4',
    'goo/math/Plane',
    'goo/math/Ray',
    'goo/math/Vector3',
    'goo/renderer/Camera',
    'goo/math/MathUtils'
], function (ShaderBuilder, MeshData, Shader, Material, Renderer, Transform, Matrix4x4, Plane, Ray, Vector3, Camera, MathUtils) {
    'use strict';
    __touch(22786);
    function Gizmo(name, gizmoRenderSystem) {
        this.name = name || 'Default Gizmo';
        __touch(22803);
        this.gizmoRenderSystem = gizmoRenderSystem;
        __touch(22804);
        this._colors = [
            [
                1,
                0.1,
                0.3
            ],
            [
                0.2,
                1,
                0.3
            ],
            [
                0.2,
                0.3,
                1
            ],
            [
                0.8,
                0.8,
                0.8
            ]
        ];
        __touch(22805);
        this._gizmoSize = 1 / 60;
        __touch(22806);
        this._plane = new Plane();
        __touch(22807);
        this._line = new Vector3();
        __touch(22808);
        this._activeHandle = null;
        __touch(22809);
        this._mouse = {
            position: [
                0,
                0
            ],
            oldPosition: [
                0,
                0
            ]
        };
        __touch(22810);
        this.dirty = false;
        __touch(22811);
        this.visible = false;
        __touch(22812);
        this.transform = new Transform();
        __touch(22813);
        this.renderables = [];
        __touch(22814);
        this.onChange = null;
        __touch(22815);
        this._oldRay = new Ray();
        __touch(22816);
        this._newRay = new Ray();
        __touch(22817);
        this._result = new Vector3();
        __touch(22818);
        this._v0 = new Vector3();
        __touch(22819);
        this._v1 = new Vector3();
        __touch(22820);
        this._v2 = new Vector3();
        __touch(22821);
        this._v3 = new Vector3();
        __touch(22822);
        this._s0 = new Vector3();
        __touch(22823);
        this._s1 = new Vector3();
        __touch(22824);
        this._s2 = new Vector3();
        __touch(22825);
        this._s3 = new Vector3();
        __touch(22826);
    }
    __touch(22787);
    Gizmo.handleStore = [];
    __touch(22788);
    Gizmo.registerHandle = function (handle) {
        var retVal = Gizmo.handleStore.length + 16000;
        __touch(22827);
        Gizmo.handleStore.push(handle);
        __touch(22828);
        return retVal;
        __touch(22829);
    };
    __touch(22789);
    Gizmo.getHandle = function (id) {
        if (id < 16000) {
            return null;
            __touch(22831);
        }
        return Gizmo.handleStore[id - 16000];
        __touch(22830);
    };
    __touch(22790);
    Gizmo.prototype.getRenderable = function (id) {
        for (var i = 0; i < this.renderables.length; i++) {
            var renderable = this.renderables[i];
            __touch(22832);
            if (renderable.id === id) {
                return renderable;
                __touch(22833);
            }
        }
    };
    __touch(22791);
    Gizmo.prototype.activate = function (properties) {
        this._activeHandle = properties.data;
        __touch(22834);
        this._mouse.oldPosition[0] = properties.x;
        __touch(22835);
        this._mouse.oldPosition[1] = properties.y;
        __touch(22836);
        this._activeRenderable = this.getRenderable(properties.id);
        __touch(22837);
        this._activeRenderable.materials[0].uniforms.color = [
            1,
            1,
            0
        ];
        __touch(22838);
    };
    __touch(22792);
    Gizmo.prototype.deactivate = function () {
        if (this._activeRenderable) {
            var originalColor = this._activeRenderable.originalColor;
            __touch(22839);
            this._activeRenderable.materials[0].uniforms.color = [
                originalColor[0],
                originalColor[1],
                originalColor[2]
            ];
            __touch(22840);
        }
    };
    __touch(22793);
    Gizmo.prototype.copyTransform = function (transform) {
        this.transform.setIdentity();
        __touch(22841);
        if (transform) {
            transform.matrix.getTranslation(this.transform.translation);
            __touch(22842);
            this.transform.rotation.copy(transform.rotation);
            __touch(22843);
            this.updateTransforms();
            __touch(22844);
        }
    };
    __touch(22794);
    Gizmo.prototype.update = function (mousePos) {
        this._mouse.position[0] = mousePos[0];
        __touch(22845);
        this._mouse.position[1] = mousePos[1];
        __touch(22846);
        this.dirty = true;
        __touch(22847);
    };
    __touch(22795);
    Gizmo.prototype.updateTransforms = function () {
        if (Renderer.mainCamera) {
            var camera = Renderer.mainCamera;
            __touch(22849);
            var scale;
            __touch(22850);
            if (camera.projectionMode === Camera.Perspective) {
                var dist = camera.translation.distance(this.transform.translation);
                __touch(22852);
                scale = dist * this._gizmoSize;
                __touch(22853);
                scale *= Math.tan(camera.fov * MathUtils.DEG_TO_RAD / 2) * 2;
                __touch(22854);
            } else {
                scale = (camera._frustumTop - camera._frustumBottom) / 30;
                __touch(22855);
            }
            this.transform.scale.setd(scale, scale, scale);
            __touch(22851);
        }
        this.transform.update();
        __touch(22848);
        for (var i = this.renderables.length - 1; i >= 0; i--) {
            this.renderables[i].transform.update();
            __touch(22856);
            Matrix4x4.combine(this.transform.matrix, this.renderables[i].transform.matrix, this.renderables[i].transform.matrix);
            __touch(22857);
        }
    };
    __touch(22796);
    Gizmo.prototype._setPlane = function () {
        var normal = this._plane.normal, worldCenter = this._v0, worldX = this._v1, worldY = this._v2, worldZ = this._v3, screenCenter = this._s0, screenX = this._s1, screenY = this._s2, screenZ = this._s3;
        __touch(22858);
        if (this._activeHandle.type === 'Plane') {
            normal.setv([
                Vector3.UNIT_X,
                Vector3.UNIT_Y,
                Vector3.UNIT_Z
            ][this._activeHandle.axis]);
            __touch(22859);
            this.transform.matrix.applyPostVector(normal);
            __touch(22860);
            normal.normalize();
            __touch(22861);
            worldCenter.setv(Vector3.ZERO);
            __touch(22862);
            this.transform.matrix.applyPostPoint(worldCenter);
            __touch(22863);
            this._plane.constant = worldCenter.dot(normal);
            __touch(22864);
        } else {
            worldCenter.setv(Vector3.ZERO);
            __touch(22865);
            this.transform.matrix.applyPostPoint(worldCenter);
            __touch(22866);
            worldX.setv(Vector3.UNIT_X);
            __touch(22867);
            this.transform.matrix.applyPostPoint(worldX);
            __touch(22868);
            worldY.setv(Vector3.UNIT_Y);
            __touch(22869);
            this.transform.matrix.applyPostPoint(worldY);
            __touch(22870);
            worldZ.setv(Vector3.UNIT_Z);
            __touch(22871);
            this.transform.matrix.applyPostPoint(worldZ);
            __touch(22872);
            Renderer.mainCamera.getScreenCoordinates(worldCenter, 1, 1, screenCenter);
            __touch(22873);
            Renderer.mainCamera.getScreenCoordinates(worldX, 1, 1, screenX);
            __touch(22874);
            screenX.subv(screenCenter);
            __touch(22875);
            Renderer.mainCamera.getScreenCoordinates(worldY, 1, 1, screenY);
            __touch(22876);
            screenY.subv(screenCenter);
            __touch(22877);
            Renderer.mainCamera.getScreenCoordinates(worldZ, 1, 1, screenZ);
            __touch(22878);
            screenZ.subv(screenCenter);
            __touch(22879);
            if (this._activeHandle.axis === 0) {
                if (screenY.cross(screenX).length() > screenZ.cross(screenX).length()) {
                    normal.setv(worldZ).subv(worldCenter).normalize();
                    __touch(22881);
                } else {
                    normal.setv(worldY).subv(worldCenter).normalize();
                    __touch(22882);
                }
            } else if (this._activeHandle.axis === 1) {
                if (screenZ.cross(screenY).length() > screenX.cross(screenY).length()) {
                    normal.setv(worldX).subv(worldCenter).normalize();
                    __touch(22883);
                } else {
                    normal.setv(worldZ).subv(worldCenter).normalize();
                    __touch(22884);
                }
            } else {
                if (screenX.cross(screenZ).length() > screenY.cross(screenZ).length()) {
                    normal.setv(worldY).subv(worldCenter).normalize();
                    __touch(22885);
                } else {
                    normal.setv(worldX).subv(worldCenter).normalize();
                    __touch(22886);
                }
            }
            this._plane.constant = worldCenter.dot(normal);
            __touch(22880);
        }
    };
    __touch(22797);
    Gizmo.prototype._setLine = function () {
        this._line.setv([
            Vector3.UNIT_X,
            Vector3.UNIT_Y,
            Vector3.UNIT_Z
        ][this._activeHandle.axis]);
        __touch(22887);
        this.transform.matrix.applyPostVector(this._line);
        __touch(22888);
        this._line.normalize();
        __touch(22889);
    };
    __touch(22798);
    Gizmo.prototype.addRenderable = function (renderable) {
        renderable.originalColor = renderable.materials[0].uniforms.color;
        __touch(22890);
        this.renderables.push(renderable);
        __touch(22891);
    };
    __touch(22799);
    Gizmo.prototype._buildMaterialForAxis = function (axis, opacity) {
        var material = new Material(Gizmo._shaderDef, axis + 'Material');
        __touch(22892);
        material.uniforms.color = this._colors[axis];
        __touch(22893);
        if (opacity !== undefined && opacity < 1) {
            material.blendState.blending = 'CustomBlending';
            __touch(22896);
            material.uniforms.opacity = opacity;
            __touch(22897);
            material.renderQueue = 3000;
            __touch(22898);
        }
        material.cullState.enabled = false;
        __touch(22894);
        return material;
        __touch(22895);
    };
    __touch(22800);
    Gizmo._shaderDef = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexNormal: MeshData.NORMAL
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraPosition: Shader.CAMERA,
            color: [
                1,
                1,
                1
            ],
            opacity: 1,
            light: [
                -20,
                20,
                20
            ]
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec3 vertexNormal;',
            'uniform mat4 viewProjectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform vec3 cameraPosition;',
            'varying vec3 normal;',
            'varying vec3 viewPosition;',
            'void main(void) {',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = viewProjectionMatrix * worldPos;',
            '\tnormal = vertexNormal;',
            '\tviewPosition = cameraPosition - worldPos.xyz;',
            '}'
        ].join('\n'),
        fshader: [
            'varying vec3 normal;',
            'varying vec3 viewPosition;',
            'uniform vec3 color;',
            'uniform float opacity;',
            'uniform vec3 light;',
            'void main(void)',
            '{',
            '\tvec3 N = normalize(normal);',
            '\tvec4 final_color = vec4(color, 1.0);',
            ' vec3 lVector = normalize(light);',
            ' float dotProduct = dot(N, lVector);',
            ' float diffuse = max(dotProduct, 0.0);',
            ' final_color.rgb *= (0.5*diffuse+0.5);',
            ' final_color.a = opacity;',
            '\tgl_FragColor = final_color;',
            '}'
        ].join('\n')
    };
    __touch(22801);
    return Gizmo;
    __touch(22802);
});
__touch(22785);