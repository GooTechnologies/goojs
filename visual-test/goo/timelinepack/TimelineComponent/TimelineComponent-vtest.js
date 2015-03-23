require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/Matrix3x3',
	'goo/timelinepack/ValueChannel',
	'goo/timelinepack/EventChannel',
	'lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	Matrix3x3,
	ValueChannel,
	EventChannel,
	V
) {
	'use strict';

	V.describe([
		'Value/event channels in action.',
		'The shapes\' rotation and scale are controlled by a value channel and the messages in the console are triggered by event channels.'
	].join('\n'));

	/* global TWEEN */

	var trace = [];
	var valueChannel;

	function getValueChannel() {

		function callback(time, value, index) {
			drawClear();

			if (time < 500) {
				trace.push({
					x: time,
					y: value
				});
			}
			drawTrace();

			drawChannel();

			drawPointer(time, value, index);

			box.setScale(0.6, value / 100, 0.6).setRotation(value / 100, value / 100, value / 100);
			sphere.setScale(value / 100, value / 100, value / 100);
			torus.setRotation(value / 100, value / 100, value / 100);
		}

		var channel = new ValueChannel('id', {
			callbackUpdate: callback,
			callbackEnd: function () {
				trace = [];
			}
		});
		channel.addKeyframe('', 50, 10, TWEEN.Easing.Quadratic.InOut);
		channel.addKeyframe('', 100, 160, TWEEN.Easing.Sinusoidal.InOut);
		channel.addKeyframe('', 170, 80, TWEEN.Easing.Exponential.InOut);
		channel.addKeyframe('', 300, 400, TWEEN.Easing.Elastic.InOut);
		channel.addKeyframe('', 400, 200, TWEEN.Easing.Elastic.InOut);
		return channel;
	}

	function getEventChannel() {
		function getMessenger(message) {
			return function () {
				console.log(message);
			};
		}

		var channel = new EventChannel('id');
		channel.addCallback('', 0, getMessenger('start1'));
		channel.addCallback('', 100, getMessenger('start2'));
		channel.addCallback('', 170, getMessenger('start3'));
		channel.addCallback('', 300, getMessenger('start4'));
		channel.addCallback('', 400, getMessenger('start5'));
		return channel;
	}

	function drawClear() {
		con2d.fillStyle = '#AAA';
		con2d.fillRect(0, 0, 500, 500);
	}

	function drawChannel() {
		con2d.lineWidth = 1;
		con2d.strokeStyle = '#DDD';

		valueChannel.keyframes.forEach(function (entry) {
			con2d.fillStyle = '#000';
			con2d.fillRect(entry.time - 2, entry.value - 2, 5, 5);
		});
	}

	function drawPointer(time, value, index) {
		con2d.lineWidth = 1;
		con2d.strokeStyle = '#000';
		con2d.beginPath();
		con2d.moveTo(time, 0);
		con2d.lineTo(time, 500);
		con2d.stroke();

		con2d.fillStyle = '#F00';
		con2d.fillRect(time - 8, value, 16, 1);

		con2d.font = 'Arial 10px';
		con2d.fillStyle = '#000';
		con2d.fillText('t: ' + time.toFixed(2), time + 10, value - 5);
		con2d.fillText('v: ' + value.toFixed(2), time + 10, value + 5);
		//con2d.fillText('i: ' + index, time + 10, value + 15);
	}

	function drawTrace() {
		con2d.fillStyle = '#F00';

		trace.forEach(function (point) {
			con2d.fillRect(point.x, point.y, 1, 1);
		});
	}

	function setupCanvas2D() {
		var canvas = document.createElement('canvas');
		canvas.width = 500;
		canvas.height = 500;
		document.body.appendChild(canvas);

		con2d = canvas.getContext('2d');
		con2d.fillStyle = '#555';
		con2d.fillRect(0, 0, 500, 500);
	}

	function setupButtons() {
		var buttonReset = document.createElement('button');
		buttonReset.innerHTML = 'reset';
		buttonReset.addEventListener('click', function () {
			time = 0;
			valueChannel.setTime(0);
			eventChannel.setTime(0);
			trace = [];
			drawClear();
			drawTrace();
			drawChannel();
		});
		document.body.appendChild(buttonReset);

		var buttonPause = document.createElement('button');
		buttonPause.innerHTML = 'pause';
		buttonPause.addEventListener('click', function () { paused = true; });
		document.body.appendChild(buttonPause);

		var buttonResume = document.createElement('button');
		buttonResume.innerHTML = 'resume';
		buttonResume.addEventListener('click', function () { paused = false; });
		document.body.appendChild(buttonResume);
	}


	var goo = V.initGoo();
	var world = goo.world;
	var con2d;
	var paused = false;


	// standard material
	var material = new Material(ShaderLib.simpleLit);

	// add some entities
	var box = world.createEntity(new Box(), material, [3, 0, 0]).addToWorld();
	var sphere = world.createEntity(new Sphere(32, 32), material, [0, 0, 0]).addToWorld();
	var torus = world.createEntity(new Torus(32, 32, 0.1, 0.5), material, [-3, 0, 0]).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	// timeline related
	setupCanvas2D();

	setupButtons();

	valueChannel = getValueChannel();
	drawChannel(valueChannel);

	var eventChannel = getEventChannel();

	// gotta trigger the update somehow
	var time = 0;
	goo.callbacks.push(function () {
		if (!paused) {
			time += goo.world.tpf * 1000 * 0.1;
			valueChannel.update(time);
			eventChannel.update(time);
		}
	});

	V.process();
});