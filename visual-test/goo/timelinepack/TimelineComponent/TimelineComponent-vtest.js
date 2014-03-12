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
	'goo/timelinepack/Channel',
	'../../lib/V'
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
	Channel,
	V
) {
	'use strict';

	var trace = [];

	function getChannel() {
		var entityTweener = Channel.getScaleXTweener(box);

		function callback(time, value, index) {
			drawClear();

			if (time < 500) { trace.push({ x: time, y: value }); }
			drawTrace();

			drawChannel();

			drawPointer(time, value, index);

			//console.log(time, value);
			box.setScale(0.6, value / 100, 0.6).setRotation(value / 100, value / 100, value / 100);

			sphere.setScale(value / 100, value / 100, value / 100);
			torus.setRotation(value / 100, value / 100, value / 100);

			//entityTweener(time, value);
		}

		function getMessenger(message) {
			return function () {
				console.log(message);
			}
		}

		var channel = new Channel({ callbackUpdate: callback, callbackEnd: function () { trace = []; } });
		channel.addEntry(50, 10, TWEEN.Easing.Quadratic.InOut, getMessenger('start1'));
		channel.addEntry(100, 160, TWEEN.Easing.Sinusoidal.InOut, getMessenger('start2'));
		channel.addEntry(170, 80, TWEEN.Easing.Exponential.InOut, getMessenger('start3'));
		channel.addEntry(300, 400, TWEEN.Easing.Elastic.InOut, getMessenger('start4'));
		channel.addEntry(400, 200, TWEEN.Easing.Elastic.InOut, getMessenger('start5'));
		return channel;
	}

	function drawClear() {
		con2d.fillStyle = '#AAA';
		con2d.fillRect(0, 0, 500, 500);
	}

	function drawChannel() {
		con2d.lineWidth = 1;
		con2d.strokeStyle = '#DDD';

//		con2d.beginPath();
//		con2d.moveTo(channel.entries[0].start, channel.entries[0].value);

		channel.entries.forEach(function (entry) {
//			con2d.lineTo(entry.start + entry.length, entry.valueEnd);
//			con2d.moveTo(entry.start, entry.valueStart);

			con2d.fillStyle = '#000';
			con2d.fillRect(entry.start - 2, entry.value - 2, 5, 5);

//			con2d.fillStyle = '#000';
//			con2d.fillRect(entry.start + entry.length - 2, entry.valueEnd - 2, 5, 5);
		});
//		con2d.stroke();
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
		con2d.fillText('i: ' + index, time + 10, value + 15);
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
			channel.setTime(0);
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

	var channel = getChannel();
	drawChannel(channel);

	// gotta trigger the update somehow
	goo.callbacks.push(function (tpf) { if (!paused) { channel.update(tpf * 100); } });
});