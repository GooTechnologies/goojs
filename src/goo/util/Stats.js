/**
 * Shows render statistics
 * @example
 * this.stats = new Stats();
 * document.body.appendChild(this.stats.domElement);
 */
function Stats() {
	var startTime = Date.now(), prevTime = startTime, prevTimeMs = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement('div');
	container.id = 'stats';
	container.addEventListener('mousedown', function (event) {
		event.preventDefault();
		setModeP(++mode % 2);
	}, false);
	container.style.cssText = 'width:80px;cursor:pointer;z-index:1000;' +
		'-webkit-touch-callout: none;' +
		'-webkit-user-select: none;' +
		'-khtml-user-select: none;' +
		'-moz-user-select: none;' +
		'-ms-user-select: none;' +
		'user-select: none;';

	var fpsDiv = document.createElement('div');
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild(fpsDiv);

	var fpsText = document.createElement('div');
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild(fpsText);

	var fpsGraph = document.createElement('div');
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
	fpsDiv.appendChild(fpsGraph);

	while (fpsGraph.children.length < 74) {
		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild(bar);
	}

	var msDiv = document.createElement('div');
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
	container.appendChild(msDiv);

	var msText = document.createElement('div');
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
	msText.innerHTML = 'MS';
	msDiv.appendChild(msText);

	var msGraph = document.createElement('div');
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
	msDiv.appendChild(msGraph);

	while (msGraph.children.length < 74) {
		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild(bar);
	}

	var infoDiv = document.createElement('div');
	infoDiv.id = 'info';
	infoDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200';
	container.appendChild(infoDiv);

	var infoText = document.createElement('div');
	infoText.id = 'infoText';
	infoText.style.cssText = 'color:#f66;font-family:Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:13px';
	infoText.innerHTML = 'INFO';
	infoDiv.appendChild(infoText);

	var setModeP = function (value) {
		mode = value;
		switch (mode)
		{
		case 0:
			fpsDiv.style.display = 'block';
			msDiv.style.display = 'none';
			break;
		case 1:
			fpsDiv.style.display = 'none';
			msDiv.style.display = 'block';
			break;
		}
	};

	var updateGraph = function (dom, value) {
		var child = dom.appendChild(dom.firstChild);
		child.style.height = value + 'px';
	};

	this.domElement = container;
	this.setMode = setModeP;
	this.begin = function () {
		startTime = Date.now();
	};

	this.end = function (info) {
		var time = Date.now();

		if (time > prevTimeMs + 100) {
			ms = time - startTime;
			msMin = Math.min(msMin, ms);
			msMax = Math.max(msMax, ms);

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph(msGraph, Math.min(30, 30 - (ms / 200) * 30));

			prevTimeMs = time;

			if (info) {
				infoText.innerHTML = info;
			}
		}

		frames++;

		if (time > prevTime + 1000) {
			fps = Math.round((frames * 1000) / (time - prevTime));
			fpsMin = Math.min(fpsMin, fps);
			fpsMax = Math.max(fpsMax, fps);

			fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
			updateGraph(fpsGraph, Math.min(30, 30 - (fps / (Math.min(500, fpsMax) + 10)) * 30));

			prevTime = time;
			frames = 0;
		}

		return time;
	};

	this.update = function (info) {
		startTime = this.end(info);
	};
}

module.exports = Stats;