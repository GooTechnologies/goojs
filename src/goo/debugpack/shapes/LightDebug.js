var MeshData = require('goo/renderer/MeshData');
var MeshBuilder = require('goo/util/MeshBuilder');
var Transform = require('goo/math/Transform');
var Sphere = require('goo/shapes/Sphere');
var PointLight = require('goo/renderer/light/PointLight');
var DirectionalLight = require('goo/renderer/light/DirectionalLight');
var SpotLight = require('goo/renderer/light/SpotLight');

	'use strict';

	function LightDebug() {
		this._ball = new Sphere(12, 12, 0.3);
		this._pointLightMesh = LightDebug._buildPointLightMesh();
		this._spotLightMesh = LightDebug._buildSpotLightMesh();
		this._directionalLightMesh = LightDebug._buildDirectionalLightMesh();
	}

	LightDebug.prototype.getMesh = function (light, options) {
		if (light instanceof PointLight) {
			return options.full ? [this._ball, this._pointLightMesh] : [this._ball];
		} else if (light instanceof SpotLight) {
			return options.full ? [this._ball, this._spotLightMesh] : [this._ball];
		} else if (light instanceof DirectionalLight) {
			return options.full ? [this._ball, this._directionalLightMesh] : [this._ball];
		}
	};

	LightDebug._buildPointLightMesh = function () {
		return buildBall();
	};

	LightDebug._buildSpotLightMesh = function () {
		return buildCone();
	};

	LightDebug._buildDirectionalLightMesh = function () {
		return buildColumn();
	};

	function buildCircle(radius, nSegments) {
		radius = radius || 1;
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k) * radius, Math.sin(k) * radius, 0);
			indices.push(i, i + 1);
		}
		indices[indices.length - 1] = 0;

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildBall() {
		var radius = 1;

		var meshBuilder = new MeshBuilder();
		var nSegments = 128;
		var circle = buildCircle(radius, nSegments);
		var transform;

		transform = new Transform();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(0, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		transform = new Transform();
		transform.rotation.fromAngles(Math.PI / 2, Math.PI / 2, 0);
		transform.update();
		meshBuilder.addMeshData(circle, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildUmbrella(nSegments) {
		nSegments = nSegments || 8;

		var verts = [0, 0, 0];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(0, i + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments + 1, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildCone() {
		var length = -1;

		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = length / 2;
		var dyParallel = dxParallel;

		for (var i = 1; i <= nParallel; i++) {
			var circle = buildCircle(dyParallel * i, nSegments);
			var transform = new Transform();
			transform.translation.setDirect(0, 0, dxParallel * i);
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var umbrella = buildUmbrella(4);
		var transform = new Transform();
		transform.scale.setDirect(dyParallel * nParallel, dyParallel * nParallel, dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(umbrella, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	function buildTube(nSegments) {
		nSegments = nSegments || 8;

		var verts = [];
		var indices = [];

		var ak = Math.PI * 2 / nSegments;
		for (var i = 0, k = 0; i < nSegments; i++, k += ak) {
			verts.push(Math.cos(k), Math.sin(k), 0);
			verts.push(Math.cos(k), Math.sin(k), 1);
			indices.push(i * 2, i * 2 + 1);
		}

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), nSegments * 2, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	function buildColumn() {
		var meshBuilder = new MeshBuilder();

		var nSegments = 64;
		var nParallel = 2;
		var dxParallel = 10 / nParallel;
		var radius = 1;

		for (var i = 0; i < nParallel; i++) {
			var circle = buildCircle(radius, nSegments);
			var transform = new Transform();
			transform.translation.z = -dxParallel * i;
			transform.update();
			meshBuilder.addMeshData(circle, transform);
		}

		var tube = buildTube(4);
		var transform = new Transform();
		transform.scale.setDirect(radius, radius, -dxParallel * nParallel);
		transform.update();
		meshBuilder.addMeshData(tube, transform);

		var meshDatas = meshBuilder.build();
		return meshDatas[0];
	}

	module.exports = LightDebug;