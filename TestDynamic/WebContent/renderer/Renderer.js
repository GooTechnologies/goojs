define(function() {
	function Renderer() {
		this.renderer = new THREE.WebGLRenderer();
		renderer.setSize(800, 600);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(35, 800 / 600, 0.1, 10000);
		camera.position.set(-15, 10, 10);
		camera.lookAt(scene.position);

		scene.add(camera);

		// document.body.appendChild(renderer.domElement);

		var cube = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshLambertMaterial({
			color : 0xFF0000
		}));
		scene.add(cube);

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(10, 0, 10);
		scene.add(light);

		renderer.render(scene, camera);

	}

});