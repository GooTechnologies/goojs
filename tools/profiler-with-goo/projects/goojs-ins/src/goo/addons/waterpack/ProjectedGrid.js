define([
    'goo/renderer/MeshData',
    'goo/math/Vector2',
    'goo/math/Vector3',
    'goo/math/Vector4',
    'goo/math/Matrix4x4',
    'goo/renderer/Camera',
    'goo/math/MathUtils'
], function (MeshData, Vector2, Vector3, Vector4, Matrix4x4, Camera, MathUtils) {
    'use strict';
    __touch(1846);
    function ProjectedGrid(densityX, densityY) {
        this.densityX = densityX !== undefined ? densityX : 20;
        __touch(1856);
        this.densityY = densityY !== undefined ? densityY : 20;
        __touch(1857);
        this.projectorCamera = new Camera(45, 1, 0.1, 2000);
        __touch(1858);
        this.mainCamera = new Camera(45, 1, 0.1, 2000);
        __touch(1859);
        this.freezeProjector = false;
        __touch(1860);
        this.upperBound = 20;
        __touch(1861);
        this.origin = new Vector4();
        __touch(1862);
        this.direction = new Vector4();
        __touch(1863);
        this.source = new Vector2();
        __touch(1864);
        this.rangeMatrix = new Matrix4x4();
        __touch(1865);
        this.intersectBottomLeft = new Vector4();
        __touch(1866);
        this.intersectTopLeft = new Vector4();
        __touch(1867);
        this.intersectTopRight = new Vector4();
        __touch(1868);
        this.intersectBottomRight = new Vector4();
        __touch(1869);
        this.planeIntersection = new Vector3();
        __touch(1870);
        this.freezeProjector = false;
        __touch(1871);
        this.projectorMinHeight = 50;
        __touch(1872);
        this.intersections = [];
        __touch(1873);
        for (var i = 0; i < 24; i++) {
            this.intersections.push(new Vector3());
            __touch(1880);
        }
        this.connections = [
            0,
            3,
            1,
            2,
            0,
            4,
            1,
            5,
            2,
            6,
            3,
            7,
            4,
            7,
            5,
            6
        ];
        __touch(1874);
        var vertexCount = this.densityX * this.densityY;
        __touch(1875);
        var indexCount = (this.densityX - 1) * (this.densityY - 1) * 6;
        __touch(1876);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.TEXCOORD0
        ]);
        __touch(1877);
        MeshData.call(this, attributeMap, vertexCount, indexCount);
        __touch(1878);
        this.rebuild();
        __touch(1879);
    }
    __touch(1847);
    ProjectedGrid.prototype = Object.create(MeshData.prototype);
    __touch(1848);
    ProjectedGrid.prototype.update = function (camera) {
        var upperBound = this.upperBound;
        __touch(1881);
        var mainCamera = this.mainCamera;
        __touch(1882);
        if (!mainCamera) {
            return;
            __touch(1924);
        }
        if (!this.freezeProjector) {
            mainCamera.copy(camera);
            __touch(1925);
        }
        var mainCameraLocation = mainCamera.translation;
        __touch(1883);
        if (mainCameraLocation.y > 0 && mainCameraLocation.y < upperBound + mainCamera.near) {
            mainCamera.translation.setd(mainCameraLocation.x, upperBound + mainCamera.near, mainCameraLocation.z);
            __touch(1926);
        } else if (mainCameraLocation.y < 0 && mainCameraLocation.y > -upperBound - mainCamera.near) {
            mainCamera.translation.setd(mainCameraLocation.x, -upperBound - mainCamera.near, mainCameraLocation.z);
            __touch(1927);
        }
        var corners = mainCamera.calculateFrustumCorners();
        __touch(1884);
        var nrPoints = 0;
        __touch(1885);
        var tmpStorage = new Vector3();
        __touch(1886);
        for (var i = 0; i < 8; i++) {
            var source = this.connections[i * 2];
            __touch(1928);
            var destination = this.connections[i * 2 + 1];
            __touch(1929);
            if (corners[source].y > upperBound && corners[destination].y < upperBound || corners[source].y < upperBound && corners[destination].y > upperBound) {
                this.getWorldIntersectionSimple(upperBound, corners[source], corners[destination], this.intersections[nrPoints++], tmpStorage);
                __touch(1930);
            }
            if (corners[source].y > -upperBound && corners[destination].y < -upperBound || corners[source].y < -upperBound && corners[destination].y > -upperBound) {
                this.getWorldIntersectionSimple(-upperBound, corners[source], corners[destination], this.intersections[nrPoints++], tmpStorage);
                __touch(1931);
            }
        }
        for (var i = 0; i < 8; i++) {
            if (corners[i].y < upperBound && corners[i].y > -upperBound) {
                this.intersections[nrPoints++].set(corners[i]);
                __touch(1932);
            }
        }
        if (nrPoints === 0) {
            return false;
            __touch(1933);
        }
        var projectorCamera = this.projectorCamera;
        __touch(1887);
        projectorCamera.copy(mainCamera);
        __touch(1888);
        if (projectorCamera.translation.y > 0 && projectorCamera._direction.y > 0 || projectorCamera.translation.y < 0 && projectorCamera._direction.y < 0) {
            projectorCamera._direction.y = -projectorCamera._direction.y;
            __touch(1934);
            var tmpVec = new Vector3();
            __touch(1935);
            tmpVec.setv(projectorCamera._direction).cross(projectorCamera._left).normalize();
            __touch(1936);
            projectorCamera._up.setv(tmpVec);
            __touch(1937);
        }
        var source = this.source;
        __touch(1889);
        var planeIntersection = this.planeIntersection;
        __touch(1890);
        source.set(0.5, 0.5);
        __touch(1891);
        this.getWorldIntersection(0, source, projectorCamera.getViewProjectionInverseMatrix(), planeIntersection);
        __touch(1892);
        var cameraLocation = projectorCamera.translation;
        __touch(1893);
        if (cameraLocation.y > 0 && cameraLocation.y < this.projectorMinHeight * 2) {
            var delta = (this.projectorMinHeight * 2 - cameraLocation.y) / (this.projectorMinHeight * 2);
            __touch(1938);
            projectorCamera.translation.setd(cameraLocation.x, this.projectorMinHeight * 2 - this.projectorMinHeight * delta, cameraLocation.z);
            __touch(1939);
        } else if (cameraLocation.y < 0 && cameraLocation.y > -this.projectorMinHeight * 2) {
            var delta = (-this.projectorMinHeight * 2 - cameraLocation.y) / (-this.projectorMinHeight * 2);
            __touch(1940);
            projectorCamera.translation.setd(cameraLocation.x, -this.projectorMinHeight * 2 + this.projectorMinHeight * delta, cameraLocation.z);
            __touch(1941);
        }
        planeIntersection.subv(projectorCamera.translation);
        __touch(1894);
        planeIntersection.y = 0;
        __touch(1895);
        var length = planeIntersection.length();
        __touch(1896);
        if (length > Math.abs(projectorCamera.translation.y)) {
            planeIntersection.normalize();
            __touch(1942);
            planeIntersection.mul(Math.abs(projectorCamera.translation.y));
            __touch(1943);
        } else if (length < MathUtils.EPSILON) {
            planeIntersection.addv(projectorCamera._up);
            __touch(1944);
            planeIntersection.y = 0;
            __touch(1945);
            planeIntersection.normalize();
            __touch(1946);
            planeIntersection.mul(0.1);
            __touch(1947);
        }
        planeIntersection.addv(projectorCamera.translation);
        __touch(1897);
        planeIntersection.y = 0;
        __touch(1898);
        projectorCamera.lookAt(planeIntersection, Vector3.UNIT_Y);
        __touch(1899);
        var modelViewProjectionMatrix = projectorCamera.getViewProjectionMatrix();
        __touch(1900);
        var spaceTransformation = new Vector4();
        __touch(1901);
        var intersections = this.intersections;
        __touch(1902);
        for (var i = 0; i < nrPoints; i++) {
            spaceTransformation.set(intersections[i].x, 0, this.intersections[i].z, 1);
            __touch(1948);
            modelViewProjectionMatrix.applyPost(spaceTransformation);
            __touch(1949);
            intersections[i].set(spaceTransformation.x, spaceTransformation.y, 0);
            __touch(1950);
            intersections[i].div(spaceTransformation.w);
            __touch(1951);
        }
        var minX = Number.MAX_VALUE;
        __touch(1903);
        var maxX = -Number.MAX_VALUE;
        __touch(1904);
        var minY = Number.MAX_VALUE;
        __touch(1905);
        var maxY = -Number.MAX_VALUE;
        __touch(1906);
        for (var i = 0; i < nrPoints; i++) {
            if (intersections[i].x < minX) {
                minX = intersections[i].x;
                __touch(1952);
            }
            if (intersections[i].x > maxX) {
                maxX = intersections[i].x;
                __touch(1953);
            }
            if (intersections[i].y < minY) {
                minY = intersections[i].y;
                __touch(1954);
            }
            if (intersections[i].y > maxY) {
                maxY = intersections[i].y;
                __touch(1955);
            }
        }
        var rangeMatrix = this.rangeMatrix;
        __touch(1907);
        rangeMatrix.setIdentity();
        __touch(1908);
        rangeMatrix.e00 = maxX - minX;
        __touch(1909);
        rangeMatrix.e11 = maxY - minY;
        __touch(1910);
        rangeMatrix.e03 = minX;
        __touch(1911);
        rangeMatrix.e13 = minY;
        __touch(1912);
        var modelViewProjectionInverseMatrix = projectorCamera.getViewProjectionInverseMatrix();
        __touch(1913);
        Matrix4x4.combine(modelViewProjectionInverseMatrix, rangeMatrix, rangeMatrix);
        __touch(1914);
        source.set(0.5, 0.5);
        __touch(1915);
        this.getWorldIntersectionHomogenous(0, source, rangeMatrix, this.intersectBottomLeft);
        __touch(1916);
        source.set(0.5, 1);
        __touch(1917);
        this.getWorldIntersectionHomogenous(0, source, rangeMatrix, this.intersectTopLeft);
        __touch(1918);
        source.set(1, 1);
        __touch(1919);
        this.getWorldIntersectionHomogenous(0, source, rangeMatrix, this.intersectTopRight);
        __touch(1920);
        source.set(1, 0.5);
        __touch(1921);
        this.getWorldIntersectionHomogenous(0, source, rangeMatrix, this.intersectBottomRight);
        __touch(1922);
        return true;
        __touch(1923);
    };
    __touch(1849);
    ProjectedGrid.prototype.getWorldIntersectionHomogenous = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix, store) {
        this.calculateIntersection(planeHeight, screenPosition, modelViewProjectionInverseMatrix);
        __touch(1956);
        store.setv(this.origin);
        __touch(1957);
    };
    __touch(1850);
    ProjectedGrid.prototype.getWorldIntersection = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix, store) {
        this.calculateIntersection(planeHeight, screenPosition, modelViewProjectionInverseMatrix);
        __touch(1958);
        store.setd(this.origin.x, this.origin.y, this.origin.z).div(this.origin.w);
        __touch(1959);
    };
    __touch(1851);
    ProjectedGrid.prototype.getWorldIntersectionSimple = function (planeHeight, source, destination, store, tmpStorage) {
        var origin = store.setv(source);
        __touch(1960);
        var direction = tmpStorage.setv(destination).sub(origin);
        __touch(1961);
        var t = (planeHeight - origin.y) / direction.y;
        __touch(1962);
        direction.mul(t);
        __touch(1963);
        origin.addv(direction);
        __touch(1964);
        return t >= 0 && t <= 1;
        __touch(1965);
    };
    __touch(1852);
    ProjectedGrid.prototype.calculateIntersection = function (planeHeight, screenPosition, modelViewProjectionInverseMatrix) {
        this.origin.setd(screenPosition.x * 2 - 1, screenPosition.y * 2 - 1, -1, 1);
        __touch(1966);
        this.direction.setd(screenPosition.x * 2 - 1, screenPosition.y * 2 - 1, 1, 1);
        __touch(1967);
        modelViewProjectionInverseMatrix.applyPost(this.origin);
        __touch(1968);
        modelViewProjectionInverseMatrix.applyPost(this.direction);
        __touch(1969);
        this.direction.sub(this.origin);
        __touch(1970);
        if (Math.abs(this.direction.y) > MathUtils.EPSILON) {
            var t = (planeHeight - this.origin.y) / this.direction.y;
            __touch(1972);
            this.direction.mul(t);
            __touch(1973);
        } else {
            this.direction.normalize();
            __touch(1974);
            this.direction.mul(this.mainCamera._frustumFar);
            __touch(1975);
        }
        this.origin.add(this.direction);
        __touch(1971);
    };
    __touch(1853);
    ProjectedGrid.prototype.rebuild = function () {
        var vbuf = this.getAttributeBuffer(MeshData.POSITION);
        __touch(1976);
        var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
        __touch(1977);
        var indices = this.getIndexBuffer();
        __touch(1978);
        var densityX = this.densityX;
        __touch(1979);
        var densityY = this.densityY;
        __touch(1980);
        for (var x = 0; x < densityX; x++) {
            for (var y = 0; y < densityY; y++) {
                vbuf[(x + y * densityX) * 3 + 0] = x;
                __touch(1983);
                vbuf[(x + y * densityX) * 3 + 1] = 0;
                __touch(1984);
                vbuf[(x + y * densityX) * 3 + 2] = y;
                __touch(1985);
                texs[(x + y * densityX) * 2 + 0] = x / (densityX - 1);
                __touch(1986);
                texs[(x + y * densityX) * 2 + 1] = y / (densityY - 1);
                __touch(1987);
            }
        }
        var index = 0;
        __touch(1981);
        for (var i = 0; i < densityX * (densityY - 1); i++) {
            if (i % (densityX * (Math.floor(i / densityX) + 1) - 1) === 0 && i !== 0) {
                continue;
                __touch(1994);
            }
            indices[index++] = i;
            __touch(1988);
            indices[index++] = 1 + densityX + i;
            __touch(1989);
            indices[index++] = 1 + i;
            __touch(1990);
            indices[index++] = i;
            __touch(1991);
            indices[index++] = densityX + i;
            __touch(1992);
            indices[index++] = 1 + densityX + i;
            __touch(1993);
        }
        return this;
        __touch(1982);
    };
    __touch(1854);
    return ProjectedGrid;
    __touch(1855);
});
__touch(1845);