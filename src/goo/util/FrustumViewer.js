define([
	'goo/renderer/MeshData',
	'goo/util/MeshBuilder',
	'goo/math/Transform',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib'
	],
	/* @lends */
	function (
		MeshData,
		MeshBuilder,
		Transform,
		ShapeCreator,
		MeshDataComponent,
		MeshRendererComponent,
		Material,
		ShaderLib
	) {
	"use strict";

	function FrustumViewer() {
	}

	function buildFrustum(fov, aspect, near, far) {
		var angle = (fov * Math.PI/180) / 2;
		/* REVIEW:
		 * Camera uses Math.tan shouldn't this be tan also?
		 * Would be nice to make it unit size and use transforms to display it.
		 * Which would work except when near/far ratio changes
		 * So buildFrustum(near_far) should be enough
		 */
		var sine = Math.sin(angle);

		var f0, f1, f2, f3;
		f0 = {
			x: -sine * far * aspect,
			y:  sine * far,
			z: -far
		};

		f1 = {
			x: -sine * far * aspect,
			y: -sine * far,
			z: -far
		};

		f2 = {
			x:  sine * far * aspect,
			y: -sine * far,
			z: -far
		};

		f3 = {
			x:  sine * far * aspect,
			y:  sine * far,
			z: -far
		};

		var n0, n1, n2, n3;
		n0 = {
			x: -sine * near * aspect,
			y:  sine * near,
			z: -near
		};

		n1 = {
			x: -sine * near * aspect,
			y: -sine * near,
			z: -near
		};

		n2 = {
			x:  sine * near * aspect,
			y: -sine * near,
			z: -near
		};

		n3 = {
			x:  sine * near * aspect,
			y:  sine * near,
			z: -near
		};

		var verts = [];
		verts.push(f0.x, f0.y, f0.z);
		verts.push(f1.x, f1.y, f1.z);
		verts.push(f2.x, f2.y, f2.z);
		verts.push(f3.x, f3.y, f3.z);

		verts.push(n0.x, n0.y, n0.z);
		verts.push(n1.x, n1.y, n1.z);
		verts.push(n2.x, n2.y, n2.z);
		verts.push(n3.x, n3.y, n3.z);

		var indices = [];
		indices.push(0, 1);
		indices.push(1, 2);
		indices.push(2, 3);
		indices.push(3, 0);

		indices.push(4, 5);
		indices.push(5, 6);
		indices.push(6, 7);
		indices.push(7, 4);

		indices.push(0, 4);
		indices.push(1, 5);
		indices.push(2, 6);
		indices.push(3, 7);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 8, 24);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = null;
		meshData.indexModes = ['Lines'];

		return meshData;
	}

	FrustumViewer.getMeshData = function(camera) {
		var meshData = buildFrustum(camera.fov, camera.aspect, camera.near, camera.far);
		return meshData;
	};

	/**
	 * Attaches a guide mesh to the specifies camera entity that represents the frustum of the camera
	 * @param {Entity} camera entity to attach the guide mesh to
	 * @return {Entity} the camera entity for chaining
	 */
	FrustumViewer.attachGuide = function (cameraEntity) {
		var camera = cameraEntity.getComponent('CameraComponent').camera;

		var meshData = buildFrustum(camera.fov, camera.aspect, camera.near, camera.far - camera.far/1000);
		var meshDataComponent = new MeshDataComponent(meshData);
		cameraEntity.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		var material = Material.createMaterial(ShaderLib.simpleColored, '');
		material.uniforms.color = [0.5, 0.7, 1];
		meshRendererComponent.materials.push(material);
		cameraEntity.setComponent(meshRendererComponent);

		return cameraEntity;
	};

	/**
	 * Removes any mesh attached to an entity with a camera component
	 * @param {Entity} camera entity to remove the mesh components from
	 * @return {Entity} the camera entity for chaining
	 */
	FrustumViewer.removeMesh = function (cameraEntity) {
		if(cameraEntity.hasComponent('cameraComponent')) {
			cameraEntity.clearComponent('meshDataComponent');
			cameraEntity.clearComponent('meshRendererComponent');
		}

		return cameraEntity;
	};

	return FrustumViewer;
});