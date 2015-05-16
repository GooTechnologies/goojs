require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/Renderer',
	'goo/renderer/TextureCreator',
	'goo/math/Plane',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Box,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	Renderer,
	TextureCreator,
	Plane,
	V
	) {
	'use strict';

	V.describe([
		'RTC test, 3D video conferance.'
	].join('\n'));
	
	var dataStream;

	var sdpConstraints = {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo': true
		}
	};

	// Remote Peer Connection will send data stream to the local Peer Connection.
	var remotePeerConnection;
	var localPeerConnection;

	function gotStream(stream) {
		dataStream = stream;
		window.dataStream = dataStream;
		trace('Got the stream');

		remotePeerConnection = new RTCPeerConnection(null);
		remotePeerConnection.onicecandidate = function (event) {
			trace('OnIceCanditate');
			console.log(event);
			if (event.candidate) {
				console.log(event.candidate);
				localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
					function() {trace('IceSuccess')},
					function(e) {console.error(error)}
				);
			}
		};

		localPeerConnection = new RTCPeerConnection(null);
		localPeerConnection.onicecandidate= function (event) {
			trace('Local peer OnIceCanditate');
			console.log(event);
			if (event.candidate) {
				console.log(event.candidate);
				remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
					function() {trace('IceSuccess')},
					function(e) {console.error(error)}
				);
			}
		};

		localPeerConnection.onaddstream = onAddStream;
		
		remotePeerConnection.addStream(dataStream);

		remotePeerConnection.createOffer(
			function(desc) {
				remotePeerConnection.setLocalDescription(desc);
				localPeerConnection.setRemoteDescription(desc);
				localPeerConnection.createAnswer(
					function(desc) {
						localPeerConnection.setLocalDescription(desc);
						remotePeerConnection.setRemoteDescription(desc);
					},
					function(error) {
						trace(error);
					},
					sdpConstraints
				);
		},
			function(error) {
				trace(error);
			})
	}

	function createLocalRemoteUser() {

		getUserMedia({
			audio: false,
			video: true
			}, gotStream,
			function(e) {
				alert('getUserMedia() error: ' + e.name);
			}
		);
	}

	function onAddStream(event) {
		trace('OnADDSTREEEAM');

		var mesh = new Box();

		var tc = new TextureCreator();

		var material = new Material('mmhm', ShaderLib.uber);
		tc.fromMediaStream(event.stream).then(function(texture) {
			material.setTexture('DIFFUSE_MAP', texture);
			var box = world.createEntity(mesh, material, [0,0,0]);
			box.addToWorld();
		});

	}

	var world;

	function init() {
		var goo = V.initGoo();
		world = goo.world;

		createLocalRemoteUser();
		
		V.addLights();

		V.addOrbitCamera();

		V.process();
	}

	init();
});