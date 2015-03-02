define([
    'goo/renderer/Material',
    'goo/renderer/Camera',
    'goo/math/Vector3',
    'goo/math/Transform',
    'goo/renderer/TextureCreator',
    'goo/renderer/Texture',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/light/DirectionalLight',
    'goo/util/CanvasUtils',
    'goo/util/Ajax',
    'goo/util/MeshBuilder',
    'goo/noise/Noise',
    'goo/noise/ValueNoise',
    'goo/addons/terrainpack/TerrainSurface',
    'goo/loaders/DynamicLoader',
    'goo/entities/EntityUtils',
    'goo/util/combine/EntityCombiner',
    'goo/util/TangentGenerator',
    'goo/entities/components/MeshDataComponent',
    'goo/entities/components/ScriptComponent',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/math/MathUtils',
    'goo/util/rsvp'
], function (Material, Camera, Vector3, Transform, TextureCreator, Texture, MeshData, Shader, DirectionalLight, CanvasUtils, Ajax, MeshBuilder, Noise, ValueNoise, TerrainSurface, DynamicLoader, EntityUtils, EntityCombiner, TangentGenerator, MeshDataComponent, ScriptComponent, ShaderBuilder, MathUtils, RSVP) {
    'use strict';
    __touch(729);
    function Forrest() {
        this.calcVec = new Vector3();
        __touch(747);
        this.initDone = false;
        __touch(748);
    }
    __touch(730);
    var chainBundleLoading = function (world, promise, bundle) {
        var loader = new DynamicLoader({
            world: world,
            preloadBinaries: true,
            rootPath: 'res/trees2'
        });
        __touch(749);
        return promise.then(function () {
            console.log('loading bundle ', bundle);
            __touch(751);
            return loader.load('root.bundle');
            __touch(752);
        }).then(function (configs) {
            for (var ref in configs) {
                console.log(ref);
                __touch(755);
            }
            __touch(753);
            console.error('Config in bundle ', bundle, ' contained no scene?!');
            __touch(754);
        });
        __touch(750);
    };
    __touch(731);
    Forrest.prototype.init = function (world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap) {
        var p = new RSVP.Promise();
        __touch(756);
        var bundlesToLoad = ['fish'];
        __touch(757);
        for (var i = 0; i < bundlesToLoad.length; i++) {
            p = chainBundleLoading(world, p, bundlesToLoad[i]);
            __touch(760);
        }
        p.then(function () {
            console.log('loaded forrest', forrestTypes);
            __touch(761);
        }, function (e) {
            console.log('Error! ', e);
            __touch(762);
        }).then(null, function (e) {
            console.log('Error! ', e);
            __touch(763);
        });
        __touch(758);
        return this.loadLODTrees(world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap);
        __touch(759);
    };
    __touch(732);
    Forrest.prototype.loadLODTrees = function (world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, forrestTypes, entityMap) {
        this.terrainQuery = terrainQuery;
        __touch(764);
        this.forrestTypes = forrestTypes;
        __touch(765);
        this.entityMap = entityMap || {};
        __touch(766);
        this.world = world;
        __touch(767);
        this.vegetationList = {};
        __touch(768);
        for (var type in forrestTypes) {
            var typeSettings = forrestTypes[type];
            __touch(791);
            var meshData = this.createBase(typeSettings);
            __touch(792);
            this.vegetationList[type] = meshData;
            __touch(793);
        }
        __touch(769);
        var material = new Material(vegetationShader, 'vegetation');
        __touch(770);
        material.setTexture('DIFFUSE_MAP', forrestAtlasTexture);
        __touch(771);
        material.setTexture('NORMAL_MAP', forrestAtlasNormals);
        __touch(772);
        material.uniforms.discardThreshold = 0.6;
        __touch(773);
        material.uniforms.materialAmbient = [
            0,
            0,
            0,
            0
        ];
        __touch(774);
        material.uniforms.materialDiffuse = [
            1,
            1,
            1,
            1
        ];
        __touch(775);
        material.uniforms.materialSpecular = [
            0,
            0,
            0,
            0
        ];
        __touch(776);
        material.renderQueue = 2001;
        __touch(777);
        this.material = material;
        __touch(778);
        this.patchSize = 32;
        __touch(779);
        this.patchDensity = 5;
        __touch(780);
        this.gridSize = 7;
        __touch(781);
        this.minDist = 1.5;
        __touch(782);
        this.patchSpacing = this.patchSize / this.patchDensity;
        __touch(783);
        this.gridSizeHalf = Math.floor(this.gridSize * 0.5);
        __touch(784);
        this.grid = [];
        __touch(785);
        this.gridState = [];
        __touch(786);
        var dummyMesh = this.createForrestPatch(0, 0, 1);
        __touch(787);
        for (var x = 0; x < this.gridSize; x++) {
            this.grid[x] = [];
            __touch(794);
            this.gridState[x] = [];
            __touch(795);
            for (var z = 0; z < this.gridSize; z++) {
                var entity = world.createEntity(this.material);
                __touch(796);
                var meshDataComponent = new MeshDataComponent(dummyMesh);
                __touch(797);
                meshDataComponent.modelBound.xExtent = this.patchSize;
                __touch(798);
                meshDataComponent.modelBound.yExtent = 500;
                __touch(799);
                meshDataComponent.modelBound.zExtent = this.patchSize;
                __touch(800);
                meshDataComponent.autoCompute = false;
                __touch(801);
                entity.set(meshDataComponent);
                __touch(802);
                entity.addToWorld();
                __touch(803);
                this.grid[x][z] = entity;
                __touch(804);
                this.gridState[x][z] = {
                    lod: -1,
                    x: -1,
                    z: -1
                };
                __touch(805);
                entity.meshRendererComponent.hidden = true;
                __touch(806);
            }
        }
        this.currentX = -10000;
        __touch(788);
        this.currentZ = -10000;
        __touch(789);
        this.initDone = true;
        __touch(790);
    };
    __touch(733);
    Forrest.prototype.rebuild = function () {
        this.currentX = -10000;
        __touch(807);
        this.currentZ = -10000;
        __touch(808);
    };
    __touch(734);
    var hidden = false;
    __touch(735);
    Forrest.prototype.toggle = function () {
        hidden = !hidden;
        __touch(809);
        for (var x = 0; x < this.gridSize; x++) {
            for (var z = 0; z < this.gridSize; z++) {
                var entity = this.grid[x][z];
                __touch(810);
                entity.skip = hidden;
                __touch(811);
            }
        }
        if (!hidden) {
            this.rebuild();
            __touch(812);
        }
    };
    __touch(736);
    Forrest.prototype.update = function (x, z) {
        if (!this.initDone || hidden) {
            return;
            __touch(817);
        }
        var newX = Math.floor(x / this.patchSize);
        __touch(813);
        var newZ = Math.floor(z / this.patchSize);
        __touch(814);
        if (this.currentX === newX && this.currentZ === newZ) {
            return;
            __touch(818);
        }
        for (var x = 0; x < this.gridSize; x++) {
            for (var z = 0; z < this.gridSize; z++) {
                var patchX = newX + x;
                __touch(819);
                var patchZ = newZ + z;
                __touch(820);
                patchX -= this.gridSizeHalf;
                __touch(821);
                patchZ -= this.gridSizeHalf;
                __touch(822);
                var modX = MathUtils.moduloPositive(patchX, this.gridSize);
                __touch(823);
                var modZ = MathUtils.moduloPositive(patchZ, this.gridSize);
                __touch(824);
                var entity = this.grid[modX][modZ];
                __touch(825);
                var state = this.gridState[modX][modZ];
                __touch(826);
                var testX = Math.abs(x - this.gridSizeHalf);
                __touch(827);
                var testZ = Math.abs(z - this.gridSizeHalf);
                __touch(828);
                var levelOfDetail = 1;
                __touch(829);
                if (testX < this.minDist && testZ < this.minDist) {
                    levelOfDetail = 2;
                    __touch(837);
                }
                if (state.lod === levelOfDetail && state.x === patchX && state.z === patchZ) {
                    continue;
                    __touch(838);
                }
                state.lod = levelOfDetail;
                __touch(830);
                state.x = patchX;
                __touch(831);
                state.z = patchZ;
                __touch(832);
                patchX *= this.patchSize;
                __touch(833);
                patchZ *= this.patchSize;
                __touch(834);
                var meshData = this.createForrestPatch(patchX, patchZ, levelOfDetail, entity);
                __touch(835);
                if (meshData && meshData.vertexCount > 0) {
                    entity.meshDataComponent.meshData = meshData;
                    __touch(839);
                    entity.meshRendererComponent.hidden = false;
                    __touch(840);
                } else {
                    entity.meshRendererComponent.hidden = true;
                    __touch(841);
                }
                entity.meshRendererComponent.worldBound.center.setd(patchX + this.patchSize * 0.5, 0, patchZ + this.patchSize * 0.5);
                __touch(836);
            }
        }
        this.currentX = newX;
        __touch(815);
        this.currentZ = newZ;
        __touch(816);
    };
    __touch(737);
    Forrest.prototype.determineVegTypeAtPos = function (pos) {
        var norm = this.terrainQuery.getNormalAt(pos);
        __touch(842);
        if (norm === null) {
            norm = Vector3.UNIT_Y;
            __touch(845);
        }
        var slope = norm.dot(Vector3.UNIT_Y);
        __touch(843);
        return this.terrainQuery.getForrestType(pos[0], pos[2], slope, MathUtils.fastRandom());
        __touch(844);
    };
    __touch(738);
    Forrest.prototype.fetchTreeMesh = function (vegetationType) {
        return EntityUtils.clone(this.world, this.entityMap[vegetationType]);
        __touch(846);
    };
    __touch(739);
    Forrest.prototype.fetchTreeBillboard = function (vegetationType, size) {
        var meshData = this.vegetationList[vegetationType];
        __touch(847);
        var type = this.forrestTypes[vegetationType];
        __touch(848);
        var w = type.w * size;
        __touch(849);
        var h = type.h * size;
        __touch(850);
        meshData.getAttributeBuffer('OFFSET').set([
            -w * 0.5,
            0,
            -w * 0.5,
            h,
            w * 0.5,
            h,
            w * 0.5,
            0
        ]);
        __touch(851);
        return meshData;
        __touch(852);
    };
    __touch(740);
    Forrest.prototype.getPointInPatch = function (x, z, patchX, patchZ, patchSpacing) {
        var pos = [
            0,
            0,
            0
        ];
        __touch(853);
        pos[0] = patchX + (x + MathUtils.fastRandom() * 0.75) * patchSpacing;
        __touch(854);
        pos[2] = 0.5 + patchZ + (z + MathUtils.fastRandom() * 0.75) * patchSpacing;
        __touch(855);
        pos[1] = this.terrainQuery.getHeightAt(pos);
        __touch(856);
        if (pos[1] === null) {
            pos[1] = 0;
            __touch(858);
        }
        return pos;
        __touch(857);
    };
    __touch(741);
    Forrest.prototype.addVegMeshToPatch = function (vegetationType, pos, meshBuilder, levelOfDetail, gridEntity) {
        var transform = new Transform();
        __touch(859);
        var size = MathUtils.fastRandom() * 0.5 + 0.75;
        __touch(860);
        transform.translation.set(pos);
        __touch(861);
        transform.update();
        __touch(862);
        var useMesh = gridEntity && (levelOfDetail === 2 || this.forrestTypes[vegetationType].forbidden === true);
        __touch(863);
        if (useMesh && this.entityMap[vegetationType]) {
            var treeEntity = this.fetchTreeMesh(vegetationType);
            __touch(864);
            treeEntity.transformComponent.transform.scale.mul(size);
            __touch(865);
            treeEntity.transformComponent.transform.translation.set(pos);
            __touch(866);
            treeEntity.addToWorld();
            __touch(867);
            gridEntity.attachChild(treeEntity);
            __touch(868);
            if (this.onAddedVegMesh) {
                this.onAddedVegMesh(vegetationType, treeEntity, pos, size);
                __touch(869);
            }
        } else {
            var meshData = this.fetchTreeBillboard(vegetationType, size);
            __touch(870);
            meshBuilder.addMeshData(meshData, transform);
            __touch(871);
        }
    };
    __touch(742);
    Forrest.prototype.createForrestPatch = function (patchX, patchZ, levelOfDetail, gridEntity) {
        var meshBuilder = new MeshBuilder();
        __touch(872);
        var patchDensity = this.patchDensity;
        __touch(873);
        var patchSpacing = this.patchSpacing;
        __touch(874);
        if (gridEntity) {
            gridEntity.traverse(function (entity, level) {
                if (level > 0) {
                    entity.removeFromWorld();
                    __touch(879);
                }
            });
            __touch(878);
        }
        MathUtils.randomSeed = patchX * 10000 + patchZ;
        __touch(875);
        for (var x = 0; x < patchDensity; x++) {
            for (var z = 0; z < patchDensity; z++) {
                var pos = this.getPointInPatch(x, z, patchX, patchZ, patchSpacing);
                __touch(880);
                var vegetationType = this.determineVegTypeAtPos(pos);
                __touch(881);
                if (vegetationType) {
                    this.addVegMeshToPatch(vegetationType, pos, meshBuilder, levelOfDetail, gridEntity);
                    __touch(882);
                }
            }
        }
        var meshDatas = meshBuilder.build();
        __touch(876);
        if (levelOfDetail === 2) {
            new EntityCombiner(this.world, 1, true, true)._combineList(gridEntity);
            __touch(883);
        }
        return meshDatas[0];
        __touch(877);
    };
    __touch(743);
    Forrest.prototype.createBase = function (type) {
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.TEXCOORD0
        ]);
        __touch(884);
        attributeMap.BASE = MeshData.createAttribute(1, 'Float');
        __touch(885);
        attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
        __touch(886);
        var meshData = new MeshData(attributeMap, 4, 6);
        __touch(887);
        meshData.getAttributeBuffer(MeshData.POSITION).set([
            0,
            -type.h * 0.1,
            0,
            0,
            -type.h * 0.1,
            0,
            0,
            -type.h * 0.1,
            0,
            0,
            -type.h * 0.1,
            0
        ]);
        __touch(888);
        meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([
            type.tx,
            type.ty,
            type.tx,
            type.ty + type.th,
            type.tx + type.tw,
            type.ty + type.th,
            type.tx + type.tw,
            type.ty
        ]);
        __touch(889);
        meshData.getAttributeBuffer('BASE').set([
            0,
            type.h,
            type.h,
            0
        ]);
        __touch(890);
        meshData.getAttributeBuffer('OFFSET').set([
            -type.w * 0.5,
            0,
            -type.w * 0.5,
            type.h,
            type.w * 0.5,
            type.h,
            type.w * 0.5,
            0
        ]);
        __touch(891);
        meshData.getIndexBuffer().set([
            0,
            3,
            1,
            1,
            3,
            2
        ]);
        __touch(892);
        return meshData;
        __touch(893);
    };
    __touch(744);
    var vegetationShader = {
        processors: [
            ShaderBuilder.light.processor,
            function (shader) {
                if (ShaderBuilder.USE_FOG) {
                    shader.defines.FOG = true;
                    __touch(894);
                    shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
                    __touch(895);
                    shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
                    __touch(896);
                } else {
                    delete shader.defines.FOG;
                    __touch(897);
                }
            }
        ],
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0,
            base: 'BASE',
            offset: 'OFFSET'
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            cameraPosition: Shader.CAMERA,
            diffuseMap: Shader.DIFFUSE_MAP,
            normalMap: Shader.NORMAL_MAP,
            discardThreshold: -0.01,
            fogSettings: function () {
                return ShaderBuilder.FOG_SETTINGS;
                __touch(898);
            },
            fogColor: function () {
                return ShaderBuilder.FOG_COLOR;
                __touch(899);
            },
            time: Shader.TIME
        },
        builder: function (shader, shaderInfo) {
            ShaderBuilder.light.builder(shader, shaderInfo);
            __touch(900);
        },
        vshader: function () {
            return [
                'attribute vec3 vertexPosition;',
                'attribute vec2 vertexUV0;',
                'attribute float base;',
                'attribute vec2 offset;',
                'uniform mat4 viewProjectionMatrix;',
                'uniform vec3 cameraPosition;',
                'uniform float time;',
                ShaderBuilder.light.prevertex,
                'varying vec3 normal;',
                'varying vec3 binormal;',
                'varying vec3 tangent;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec2 texCoord0;',
                'void main(void) {',
                'vec3 swayPos = vertexPosition;',
                'vec3 nn = cameraPosition - swayPos.xyz;',
                'nn.y = 0.0;',
                'normal = normalize(nn);',
                'tangent = cross(vec3(0.0, 1.0, 0.0), normal);',
                'binormal = cross(normal, tangent);',
                'swayPos.xz += tangent.xz * offset.x;',
                'swayPos.y += offset.y;',
                'swayPos.x += sin(time * 0.5 + swayPos.x * 0.4) * base * sin(time * 1.5 + swayPos.y * 0.4) * 0.02 + 0.01;',
                '\tvec4 worldPos = vec4(swayPos, 1.0);',
                '\tvWorldPos = worldPos.xyz;',
                '\tgl_Position = viewProjectionMatrix * worldPos;',
                ShaderBuilder.light.vertex,
                '\ttexCoord0 = vertexUV0;',
                '\tviewPosition = cameraPosition - worldPos.xyz;',
                '}'
            ].join('\n');
            __touch(901);
        },
        fshader: function () {
            return [
                'uniform sampler2D diffuseMap;',
                'uniform sampler2D normalMap;',
                'uniform float discardThreshold;',
                'uniform vec2 fogSettings;',
                'uniform vec3 fogColor;',
                ShaderBuilder.light.prefragment,
                'varying vec3 normal;',
                'varying vec3 binormal;',
                'varying vec3 tangent;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec2 texCoord0;',
                'void main(void)',
                '{',
                '\tvec4 final_color = texture2D(diffuseMap, texCoord0);',
                'if (final_color.a < discardThreshold) discard;',
                'mat3 tangentToWorld = mat3(tangent, binormal, normal);',
                'vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz * vec3(2.0) - vec3(1.0);',
                'vec3 worldNormal = (tangentToWorld * tangentNormal);',
                'vec3 N = normalize(worldNormal);',
                ShaderBuilder.light.fragment,
                '#ifdef FOG',
                'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
                'final_color.rgb = mix(final_color.rgb, fogColor, d);',
                '#endif',
                '\tgl_FragColor = final_color;',
                '}'
            ].join('\n');
            __touch(902);
        }
    };
    __touch(745);
    return Forrest;
    __touch(746);
});
__touch(728);