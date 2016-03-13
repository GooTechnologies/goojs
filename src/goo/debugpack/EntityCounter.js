

	/**
	 * The entity counter utility class creates a panel and updates it with data on the systems in the world and how many entities each contains
	 * @param {number} [skipFrames] Sets how many frames should it skip between refreshes
	 */
	function EntityCounter(skipFrames) {
		this.goo = null;
		this.skipFrames = skipFrames || 20;
		this.texHandle = null;
	}

	/**
	 * Inject the entity counter into the GooRunner instance and create the entity counter panel
	 *
	 * @param {GooRunner} goo A GooRunner reference
	 * @returns {EntityCounter} Self to allow chaining
	 */
	EntityCounter.prototype.inject = function (goo) {
		this.goo = goo;

		this.texHandle = createPanel();
		var that = this;

		var skippedFrame = 0;
		this.goo.callbacks.push(function () {
			skippedFrame--;
			if (skippedFrame <= 0) {
				skippedFrame = that.skipFrames;
				var outStr = '';

				for (var i in that.goo.world._systems) {
					var system = that.goo.world._systems[i];
					outStr += system.type + ': ' + system._activeEntities.length + '\n';
				}

				that.texHandle.value = outStr;
			}
		});

		return this;
	};

	/**
	 * Builds and appends the GUI for the entity counter
	 * @memberOf EntityCounter#
	 * @private
	 */
	function createPanel() {
		var div = document.createElement('div');
		div.id = '_entitycounterdiv';
		var innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Counter</span><br />' +
			'<textarea cols="30" rows="6" id="_entitycountertex">...</textarea>';
		div.innerHTML = innerHTML;
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#BBBBBB';
		div.style.left = '10px';
		div.style.bottom = '10px';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);

		return document.getElementById('_entitycountertex');
	}

	module.exports = EntityCounter;
