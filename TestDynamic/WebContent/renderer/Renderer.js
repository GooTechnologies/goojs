define(function() {
	function Renderer(parameters) {
		parameters = parameters || {};

		var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');

		this._alpha = parameters.alpha !== undefined ? parameters.alpha : true;
		this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
		this._antialias = parameters.antialias !== undefined ? parameters.antialias : false;
		this._stencil = parameters.stencil !== undefined ? parameters.stencil : true;
		this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer
				: false;

		try {
			// var settings = {
			// alpha : this._alpha,
			// premultipliedAlpha : this._premultipliedAlpha,
			// antialias : this._antialias,
			// stencil : this._stencil,
			// preserveDrawingBuffer : this._preserveDrawingBuffer
			// };

			if (!(this.context = _canvas.getContext('experimental-webgl'))) {
				throw 'Error creating WebGL context.';
			}
		} catch (error) {
			console.error(error);
		}

		// this.renderer = new THREE.WebGLRenderer();
		// renderer.setSize(800, 600);
		//
		// this.scene = new THREE.Scene();
		//
		// this.camera = new THREE.PerspectiveCamera(35, 800 / 600, 0.1, 10000);
		// camera.position.set(-15, 10, 10);
		// camera.lookAt(scene.position);
		//
		// scene.add(camera);
		//
		// // document.body.appendChild(renderer.domElement);
		//
		// var cube = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new
		// THREE.MeshLambertMaterial({
		// color : 0xFF0000
		// }));
		// scene.add(cube);
		//
		// var light = new THREE.PointLight(0xFFFF00);
		// light.position.set(10, 0, 10);
		// scene.add(light);
		//
		// renderer.render(scene, camera);
	}

	Renderer.prototype.bindData = function(indexData) {
		console.log(arguments);
	};

	Renderer.prototype.drawElementsVBO = function(indices, indexModes, indexLengths) {
		console.log(arguments);
	};

	Renderer.prototype.drawArraysVBO = function(indexModes, indexLengths) {
		console.log(arguments);
	};

	return Renderer;
});