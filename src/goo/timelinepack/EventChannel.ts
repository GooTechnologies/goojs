import AbstractTimelineChannel = require('../timelinepack/AbstractTimelineChannel');

class EventChannel extends AbstractTimelineChannel {
	oldTime: number;
	callbackIndex: number;

	constructor(id) {
		super(id);
		this.oldTime = 0;
		this.callbackIndex = 0;
	}

	/**
	 * Add a callback to be called at a specific point in time
	 * @param {string} id
	 * @param {number} time
	 * @param {Function} callback
	 */
	addCallback(id, time, callback) {
		var newCallback = {
			id: id,
			time: time,
			callback: callback
		};
		var keyframes = this.keyframes;
		if (time > this.lastTime) {
			keyframes.push(newCallback);
			this.lastTime = time;
		} else if (!keyframes.length || time < keyframes[0].time) {
			keyframes.unshift(newCallback);
		} else {
			var index = this._find(keyframes, time) + 1;
			keyframes.splice(index, 0, newCallback);
		}

		return this;
	};

	/**
	 * Update the channel
	 * @param time
	 */
	update(time) {
		if (!this.enabled) { return this; }

		var keyframes = this.keyframes;
		if (!keyframes.length) { return this; }

		// loop
		if (time < this.oldTime) {
			while (this.callbackIndex < keyframes.length) {
				keyframes[this.callbackIndex].callback();
				this.callbackIndex++;
			}
			this.callbackIndex = 0;
		}

		while (this.callbackIndex < keyframes.length && time >= keyframes[this.callbackIndex].time && time !== this.oldTime) {
			keyframes[this.callbackIndex].callback();
			this.callbackIndex++;
		}

		this.oldTime = time;

		return this;
	};

	/**
	 * No events need be fired when scrubbing the timeline
	 * @private
	 * @param time
	 */
	setTime(time) {
		if (!this.enabled) { return this; }
		if (!this.keyframes.length) { return this; }

		if (time <= this.keyframes[0].time) {
			this.callbackIndex = 0;
		} else {
			this.callbackIndex = this._find(this.keyframes, time) + 1;
		}

		this.oldTime = time;

		return this;
	};
}

export = EventChannel;