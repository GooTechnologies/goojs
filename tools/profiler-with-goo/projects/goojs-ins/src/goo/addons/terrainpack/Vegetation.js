define([
    'goo/entities/components/MeshDataComponent',
    'goo/renderer/Material',
    'goo/renderer/Camera',
    'goo/math/MathUtils',
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
    'goo/shapes/Quad',
    'goo/renderer/shaders/ShaderBuilder'
], function (MeshDataComponent, Material, Camera, MathUtils, Vector3, Transform, TextureCreator, Texture, MeshData, Shader, DirectionalLight, CanvasUtils, Ajax, MeshBuilder, Noise, ValueNoise, TerrainSurface, Quad, ShaderBuilder) {
    'use strict';
    __touch(1552);
    function Vegetation() {
        this.calcVec = new Vector3();
        __touch(1567);
        this.initDone = false;
        __touch(1568);
    }
    __touch(1553);
    Vegetation.prototype.init = function (world, terrainQuery, vegetationAtlasTexture, vegetationTypes, settings) {
        this.world = world;
        __touch(1569);
        this.terrainQuery = terrainQuery;
        __touch(1570);
        this.vegetationList = {};
        __touch(1571);
        for (var type in vegetationTypes) {
            var typeSettings = vegetationTypes[type];
            __touch(1595);
            var meshData = this.createBase(typeSettings);
            __touch(1596);
            this.vegetationList[type] = meshData;
            __touch(1597);
        }
        __touch(1572);
        var material = new Material(vegetationShader, 'vegetation');
        __touch(1573);
        material.setTexture('DIFFUSE_MAP', vegetationAtlasTexture);
        __touch(1574);
        material.cullState.enabled = false;
        __touch(1575);
        material.uniforms.discardThreshold = 0.2;
        __touch(1576);
        material.blendState.blending = 'CustomBlending';
        __touch(1577);
        material.uniforms.materialAmbient = [
            0,
            0,
            0,
            0
        ];
        __touch(1578);
        material.uniforms.materialDiffuse = [
            1,
            1,
            1,
            1
        ];
        __touch(1579);
        material.uniforms.materialSpecular = [
            0,
            0,
            0,
            0
        ];
        __touch(1580);
        material.renderQueue = 3001;
        __touch(1581);
        this.material = material;
        __touch(1582);
        this.patchSize = 15;
        __touch(1583);
        this.patchDensity = 19;
        __touch(1584);
        this.gridSize = 7;
        __touch(1585);
        if (settings) {
            this.patchSize = settings.patchSize || this.patchSize;
            __touch(1598);
            this.patchDensity = settings.patchDensity || this.patchDensity;
            __touch(1599);
            this.gridSize = settings.gridSize || this.gridSize;
            __touch(1600);
        }
        this.patchSpacing = this.patchSize / this.patchDensity;
        __touch(1586);
        this.gridSizeHalf = Math.floor(this.gridSize * 0.5);
        __touch(1587);
        this.grid = [];
        __touch(1588);
        var dummyMesh = this.createPatch(0, 0);
        __touch(1589);
        for (var x = 0; x < this.gridSize; x++) {
            this.grid[x] = [];
            __touch(1601);
            for (var z = 0; z < this.gridSize; z++) {
                var entity = this.world.createEntity(this.material);
                __touch(1602);
                var meshDataComponent = new MeshDataComponent(dummyMesh);
                __touch(1603);
                meshDataComponent.modelBound.xExtent = this.patchSize;
                __touch(1604);
                meshDataComponent.modelBound.yExtent = 500;
                __touch(1605);
                meshDataComponent.modelBound.zExtent = this.patchSize;
                __touch(1606);
                meshDataComponent.autoCompute = false;
                __touch(1607);
                entity.set(meshDataComponent);
                __touch(1608);
                entity.addToWorld();
                __touch(1609);
                this.grid[x][z] = entity;
                __touch(1610);
                entity.meshRendererComponent.cullMode = 'Never';
                __touch(1611);
                entity.meshRendererComponent.hidden = true;
                __touch(1612);
            }
        }
        material.uniforms.fadeDistMax = this.gridSizeHalf * this.patchSize;
        __touch(1590);
        material.uniforms.fadeDistMin = 0.7 * material.uniforms.fadeDistMax;
        __touch(1591);
        this.currentX = -10000;
        __touch(1592);
        this.currentZ = -10000;
        __touch(1593);
        this.initDone = true;
        __touch(1594);
    };
    __touch(1554);
    Vegetation.prototype.rebuild = function () {
        this.currentX = -10000;
        __touch(1613);
        this.currentZ = -10000;
        __touch(1614);
    };
    __touch(1555);
    var hidden = false;
    __touch(1556);
    Vegetation.prototype.toggle = function () {
        hidden = !hidden;
        __touch(1615);
        for (var x = 0; x < this.gridSize; x++) {
            for (var z = 0; z < this.gridSize; z++) {
                var entity = this.grid[x][z];
                __touch(1616);
                entity.skip = hidden;
                __touch(1617);
            }
        }
        if (!hidden) {
            this.rebuild();
            __touch(1618);
        }
    };
    __touch(1557);
    Vegetation.prototype.update = function (x, z) {
        if (!this.initDone || hidden) {
            return;
            __touch(1623);
        }
        var newX = Math.floor(x / this.patchSize);
        __touch(1619);
        var newZ = Math.floor(z / this.patchSize);
        __touch(1620);
        if (this.currentX === newX && this.currentZ === newZ) {
            return;
            __touch(1624);
        }
        for (var x = 0; x < this.gridSize; x++) {
            for (var z = 0; z < this.gridSize; z++) {
                var patchX = newX + x;
                __touch(1625);
                var patchZ = newZ + z;
                __touch(1626);
                var diffX = patchX - this.currentX;
                __touch(1627);
                var diffZ = patchZ - this.currentZ;
                __touch(1628);
                if (diffX >= 0 && diffX < this.gridSize && diffZ >= 0 && diffZ < this.gridSize) {
                    continue;
                    __touch(1637);
                }
                patchX -= this.gridSizeHalf;
                __touch(1629);
                patchZ -= this.gridSizeHalf;
                __touch(1630);
                var modX = MathUtils.moduloPositive(patchX, this.gridSize);
                __touch(1631);
                var modZ = MathUtils.moduloPositive(patchZ, this.gridSize);
                __touch(1632);
                patchX *= this.patchSize;
                __touch(1633);
                patchZ *= this.patchSize;
                __touch(1634);
                var entity = this.grid[modX][modZ];
                __touch(1635);
                var meshData = this.createPatch(patchX, patchZ);
                __touch(1636);
                if (!meshData) {
                    entity.meshRendererComponent.hidden = true;
                    __touch(1638);
                } else {
                    entity.meshRendererComponent.hidden = false;
                    __touch(1639);
                    entity.meshDataComponent.meshData = meshData;
                    __touch(1640);
                    entity.meshRendererComponent.worldBound.center.setd(patchX + this.patchSize * 0.5, 0, patchZ + this.patchSize * 0.5);
                    __touch(1641);
                }
            }
        }
        this.currentX = newX;
        __touch(1621);
        this.currentZ = newZ;
        __touch(1622);
    };
    __touch(1558);
    Vegetation.prototype.createPatch = function (patchX, patchZ) {
        var meshBuilder = new MeshBuilder();
        __touch(1642);
        var transform = new Transform();
        __touch(1643);
        var patchDensity = this.patchDensity;
        __touch(1644);
        var patchSpacing = this.patchSpacing;
        __touch(1645);
        var pos = [
            0,
            10,
            0
        ];
        __touch(1646);
        for (var x = 0; x < patchDensity; x++) {
            for (var z = 0; z < patchDensity; z++) {
                var xx = patchX + (x + Math.random() * 0.5) * patchSpacing;
                __touch(1649);
                var zz = patchZ + (z + Math.random() * 0.5) * patchSpacing;
                __touch(1650);
                pos[0] = xx;
                __touch(1651);
                pos[2] = zz + 0.5;
                __touch(1652);
                var yy = this.terrainQuery.getHeightAt(pos);
                __touch(1653);
                var norm = this.terrainQuery.getNormalAt(pos);
                __touch(1654);
                if (yy === null) {
                    yy = 0;
                    __touch(1669);
                }
                if (norm === null) {
                    norm = Vector3.UNIT_Y;
                    __touch(1670);
                }
                var slope = norm.dot(Vector3.UNIT_Y);
                __touch(1655);
                var vegetationType = this.terrainQuery.getVegetationType(xx, zz, slope);
                __touch(1656);
                if (!vegetationType) {
                    continue;
                    __touch(1671);
                }
                var size = Math.random() * 0.4 + 0.8;
                __touch(1657);
                transform.scale.setd(size, size, size);
                __touch(1658);
                transform.translation.setd(0, 0, 0);
                __touch(1659);
                var angle = Math.random() * Math.PI * 2;
                __touch(1660);
                var anglex = Math.sin(angle);
                __touch(1661);
                var anglez = Math.cos(angle);
                __touch(1662);
                this.calcVec.setd(anglex, 0, anglez);
                __touch(1663);
                this.lookAt(transform.rotation, this.calcVec, norm);
                __touch(1664);
                transform.translation.setd(xx, yy, zz);
                __touch(1665);
                transform.update();
                __touch(1666);
                var meshData = this.vegetationList[vegetationType];
                __touch(1667);
                meshBuilder.addMeshData(meshData, transform);
                __touch(1668);
            }
        }
        var meshDatas = meshBuilder.build();
        __touch(1647);
        for (var i = 0; i < meshDatas.length; i++) {
            var meshData = meshDatas[i];
            __touch(1672);
            var verts = meshData.getAttributeBuffer(MeshData.POSITION);
            __touch(1673);
            var cols = meshData.getAttributeBuffer(MeshData.COLOR);
            __touch(1674);
            for (var i = 0, j = 0; i < verts.length; i += 3, j += 4) {
                var col = this.terrainQuery.getLightAt([
                    verts[i],
                    verts[i + 1],
                    verts[i + 2]
                ]);
                __touch(1675);
                cols[j] = col;
                __touch(1676);
                cols[j + 1] = col;
                __touch(1677);
                cols[j + 2] = col;
                __touch(1678);
                cols[j + 3] = 1;
                __touch(1679);
            }
        }
        return meshDatas[0];
        __touch(1648);
    };
    __touch(1559);
    var _tempX = new Vector3();
    __touch(1560);
    var _tempY = new Vector3();
    __touch(1561);
    var _tempZ = new Vector3();
    __touch(1562);
    Vegetation.prototype.lookAt = function (matrix, direction, up) {
        var x = _tempX, y = _tempY, z = _tempZ;
        __touch(1680);
        y.setv(up).normalize();
        __touch(1681);
        x.setv(up).cross(direction).normalize();
        __touch(1682);
        z.setv(y).cross(x);
        __touch(1683);
        var d = matrix.data;
        __touch(1684);
        d[0] = x.data[0];
        __touch(1685);
        d[1] = x.data[1];
        __touch(1686);
        d[2] = x.data[2];
        __touch(1687);
        d[3] = y.data[0];
        __touch(1688);
        d[4] = y.data[1];
        __touch(1689);
        d[5] = y.data[2];
        __touch(1690);
        d[6] = z.data[0];
        __touch(1691);
        d[7] = z.data[1];
        __touch(1692);
        d[8] = z.data[2];
        __touch(1693);
        return this;
        __touch(1694);
    };
    __touch(1563);
    Vegetation.prototype.createBase = function (type) {
        var meshData = new Quad(type.w, type.h, 10, 10);
        __touch(1695);
        meshData.attributeMap.BASE = MeshData.createAttribute(1, 'Float');
        __touch(1696);
        meshData.attributeMap.COLOR = MeshData.createAttribute(4, 'Float');
        __touch(1697);
        meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
        __touch(1698);
        meshData.getAttributeBuffer(MeshData.NORMAL).set([
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0
        ]);
        __touch(1699);
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
        __touch(1700);
        meshData.getAttributeBuffer('BASE').set([
            0,
            type.h,
            type.h,
            0
        ]);
        __touch(1701);
        meshData.getAttributeBuffer(MeshData.COLOR).set([
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1
        ]);
        __touch(1702);
        var meshBuilder = new MeshBuilder();
        __touch(1703);
        var transform = new Transform();
        __touch(1704);
        transform.translation.y = type.h * 0.5 - type.h * 0.1;
        __touch(1705);
        transform.translation.z = -type.w * 0.1;
        __touch(1706);
        transform.update();
        __touch(1707);
        meshBuilder.addMeshData(meshData, transform);
        __touch(1708);
        transform.setRotationXYZ(0, Math.PI * 0.3, 0);
        __touch(1709);
        transform.translation.x = type.w * 0.1;
        __touch(1710);
        transform.translation.z = type.w * 0.1;
        __touch(1711);
        transform.update();
        __touch(1712);
        meshBuilder.addMeshData(meshData, transform);
        __touch(1713);
        transform.setRotationXYZ(0, -Math.PI * 0.3, 0);
        __touch(1714);
        transform.translation.x = -type.w * 0.1;
        __touch(1715);
        transform.translation.z = type.w * 0.1;
        __touch(1716);
        transform.update();
        __touch(1717);
        meshBuilder.addMeshData(meshData, transform);
        __touch(1718);
        var meshDatas = meshBuilder.build();
        __touch(1719);
        return meshDatas[0];
        __touch(1720);
    };
    __touch(1564);
    var vegetationShader = {
        processors: [
            ShaderBuilder.light.processor,
            function (shader) {
                if (ShaderBuilder.USE_FOG) {
                    shader.defines.FOG = true;
                    __touch(1721);
                    shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
                    __touch(1722);
                    shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
                    __touch(1723);
                } else {
                    delete shader.defines.FOG;
                    __touch(1724);
                }
            }
        ],
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexNormal: MeshData.NORMAL,
            vertexUV0: MeshData.TEXCOORD0,
            vertexColor: MeshData.COLOR,
            base: 'BASE'
        },
        uniforms: {
            viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraPosition: Shader.CAMERA,
            diffuseMap: Shader.DIFFUSE_MAP,
            discardThreshold: -0.01,
            fogSettings: function () {
                return ShaderBuilder.FOG_SETTINGS;
                __touch(1725);
            },
            fogColor: function () {
                return ShaderBuilder.FOG_COLOR;
                __touch(1726);
            },
            time: Shader.TIME,
            fadeDistMin: 40,
            fadeDistMax: 50
        },
        builder: function (shader, shaderInfo) {
            ShaderBuilder.light.builder(shader, shaderInfo);
            __touch(1727);
        },
        vshader: function () {
            return [
                'attribute vec3 vertexPosition;',
                'attribute vec3 vertexNormal;',
                'attribute vec2 vertexUV0;',
                'attribute vec4 vertexColor;',
                'attribute float base;',
                'uniform mat4 viewProjectionMatrix;',
                'uniform mat4 worldMatrix;',
                'uniform vec3 cameraPosition;',
                'uniform float time;',
                'uniform float fadeDistMin;',
                'uniform float fadeDistMax;',
                ShaderBuilder.light.prevertex,
                'varying vec3 normal;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec2 texCoord0;',
                'varying vec4 color;',
                'varying float dist;',
                'void main(void) {',
                'vec3 swayPos = vertexPosition;',
                'swayPos.x += sin(time * 1.0 + swayPos.x * 0.5) * base * sin(time * 1.8 + swayPos.y * 0.6) * 0.1 + 0.08;',
                'vec4 worldPos = worldMatrix * vec4(swayPos, 1.0);',
                'vWorldPos = worldPos.xyz;',
                'gl_Position = viewProjectionMatrix * worldPos;',
                ShaderBuilder.light.vertex,
                'normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
                'texCoord0 = vertexUV0;',
                'color = vertexColor;',
                'viewPosition = cameraPosition - worldPos.xyz;',
                'dist = 1.0 - smoothstep(fadeDistMin, fadeDistMax, length(viewPosition.xz));',
                '}'
            ].join('\n');
            __touch(1728);
        },
        fshader: function () {
            return [
                'uniform sampler2D diffuseMap;',
                'uniform float discardThreshold;',
                'uniform vec2 fogSettings;',
                'uniform vec3 fogColor;',
                ShaderBuilder.light.prefragment,
                'varying vec3 normal;',
                'varying vec3 vWorldPos;',
                'varying vec3 viewPosition;',
                'varying vec2 texCoord0;',
                'varying float dist;',
                'varying vec4 color;',
                'void main(void)',
                '{',
                'vec4 final_color = texture2D(diffuseMap, texCoord0) * color;',
                'if (final_color.a < discardThreshold) discard;',
                'final_color.a = min(final_color.a, dist);',
                'if (final_color.a <= 0.0) discard;',
                'vec3 N = normalize(normal);',
                ShaderBuilder.light.fragment,
                'final_color.a = pow(final_color.a, 0.5);',
                '#ifdef FOG',
                'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
                'final_color.rgb = mix(final_color.rgb, fogColor, d);',
                '#endif',
                'gl_FragColor = final_color;',
                '}'
            ].join('\n');
            __touch(1729);
        }
    };
    __touch(1565);
    return Vegetation;
    __touch(1566);
});
__touch(1551);