/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([20],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(508);


/***/ },

/***/ 508:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		AbstractTimelineChannel: __webpack_require__(509),
		EventChannel: __webpack_require__(510),
		TimelineComponent: __webpack_require__(511),
		TimelineComponentHandler: __webpack_require__(512),
		TimelineSystem: __webpack_require__(514),
		ValueChannel: __webpack_require__(513)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 509:
/***/ function(module, exports) {

	function AbstractTimelineChannel(id) {
		this.id = id;
		this.enabled = true;

		this.keyframes = [];
		this.lastTime = 0;
	}

	/**
	 * Searching for the entry that is previous to the given time
	 * @private
	 * @param sortedArray
	 * @param time
	 */
	//! AT: could convert into a more general ArrayUtils.pluck and binary search but that creates extra arrays
	AbstractTimelineChannel.prototype._find = function (sortedArray, time) {
		var start = 0;
		var end = sortedArray.length - 1;
		var lastTime = sortedArray[sortedArray.length - 1].time;

		if (time > lastTime) { return end; }

		while (end - start > 1) {
			var mid = Math.floor((end + start) / 2);
			var midTime = sortedArray[mid].time;

			if (time > midTime) {
				start = mid;
			} else {
				end = mid;
			}
		}

		return start;
	};

	/**
	 * Called only when mutating the start times of entries to be sure that the order is kept
	 * @private
	 */
	AbstractTimelineChannel.prototype.sort = function () {
		this.keyframes.sort(function (a, b) {
			return a.time - b.time;
		});
		this.lastTime = this.keyframes[this.keyframes.length - 1].time;

		return this;
	};

	module.exports = AbstractTimelineChannel;

/***/ },

/***/ 510:
/***/ function(module, exports, __webpack_require__) {

	var AbstractTimelineChannel = __webpack_require__(509);

	function EventChannel(id) {
		AbstractTimelineChannel.call(this, id);

		this.oldTime = 0;
		this.callbackIndex = 0;
	}

	EventChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
	EventChannel.prototype.constructor = AbstractTimelineChannel;

	/**
	 * Add a callback to be called at a specific point in time
	 * @param {string} id
	 * @param {number} time
	 * @param {Function} callback
	 */
	EventChannel.prototype.addCallback = function (id, time, callback) {
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
	EventChannel.prototype.update = function (time) {
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
	EventChannel.prototype.setTime = function (time) {
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

	module.exports = EventChannel;

/***/ },

/***/ 511:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/**
	 * Timeline component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/timelinepack/TimelineComponent/TimelineComponent-vtest.html Working example
	 */
	function TimelineComponent() {
		Component.apply(this, arguments);

		this.type = 'TimelineComponent';

		this.channels = [];

		/**
		 * Current time, locally in this timeline.
		 * @type {number}
		 */
		this.time = 0;

		this.duration = 0;
		this.loop = false;

		this.playing = true;

		/**
		 * If set to true, the TimelineSystem will automatically run .start() on the component when the TimelineSystem starts.
		 * @type {Boolean}
		 */
		this.autoStart = true;
	}

	TimelineComponent.prototype = Object.create(Component.prototype);
	TimelineComponent.prototype.constructor = TimelineComponent;

	/**
	 * Adds a channel
	 * @param {Channel} channel
	 * @returns {TimelineComponent} Returns self to allow chaining
	 */
	TimelineComponent.prototype.addChannel = function (channel) {
		this.channels.push(channel);
		return this;
	};

	/**
	 * Updates all channels with the time per last frame
	 * @param {number} tpf
	 */
	TimelineComponent.prototype.update = function (tpf) {
		if (!this.playing) {
			return;
		}

		var time = this.time + tpf;
		if (time > this.duration) {
			if (this.loop) {
				time %= this.duration;
			} else {
				time = this.duration;
			}
		}
		if (time === this.time) {
			return;
		}
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.update(this.time);
		}
	};

	/**
	 * Resumes updating the entities
	 */
	TimelineComponent.prototype.start = function () {
		this.playing = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	TimelineComponent.prototype.resume = TimelineComponent.prototype.start;

	/**
	 * Stops updating the entities
	 */
	TimelineComponent.prototype.pause = function () {
		this.playing = false;
	};


	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	TimelineComponent.prototype.stop = function () {
		this.playing = false;
		this.setTime(0);
	};

	/**
	 * Sets the time on all channels
	 * @param {number} time
	 */
	TimelineComponent.prototype.setTime = function (time) {
		this.time = time;

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			channel.setTime(this.time);
		}

		return this;
	};

	/**
	 * Retrieves the values of all channels
	 * @private
	 * @returns {Object}
	 */
	TimelineComponent.prototype.getValues = function () {
		var retVal = {};

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			if (typeof channel.value !== 'undefined' && channel.keyframes.length) {
				retVal[channel.id] = channel.value;
			}
		}

		return retVal;
	};

	module.exports = TimelineComponent;

/***/ },

/***/ 512:
/***/ function(module, exports, __webpack_require__) {

	var ComponentHandler = __webpack_require__(88);
	var TimelineComponent = __webpack_require__(511);
	var ValueChannel = __webpack_require__(513);
	var EventChannel = __webpack_require__(510);
	var ArrayUtils = __webpack_require__(86);
	var SystemBus = __webpack_require__(44);
	var ObjectUtils = __webpack_require__(6);
	var Easing = __webpack_require__(173);

	/**
	 * @hidden
	 */
	function TimelineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'TimelineComponent';
	}

	TimelineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TimelineComponentHandler.prototype.constructor = TimelineComponentHandler;
	ComponentHandler._registerClass('timeline', TimelineComponentHandler);

	TimelineComponentHandler.prototype._prepare = function (/*config*/) {};

	TimelineComponentHandler.prototype._create = function () {
		var component = new TimelineComponent();
		return component;
	};

	TimelineComponentHandler.tweenMap = {
		translationX: ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 'x'),
		translationY: ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 'y'),
		translationZ: ValueChannel.getSimpleTransformTweener.bind(null, 'translation', 'z'),
		scaleX: ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 'x'),
		scaleY: ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 'y'),
		scaleZ: ValueChannel.getSimpleTransformTweener.bind(null, 'scale', 'z'),
		rotationX: ValueChannel.getRotationTweener.bind(null, 0),
		rotationY: ValueChannel.getRotationTweener.bind(null, 1),
		rotationZ: ValueChannel.getRotationTweener.bind(null, 2)
	};

	function getEasingFunction(easingString) {
		if (!easingString) {
			return Easing.Linear.None;
		}
		var separator = easingString.indexOf('.');
		var easingType = easingString.substr(0, separator);
		var easingDirection = easingString.substr(separator + 1);
		return Easing[easingType][easingDirection];
	}

	function updateValueChannelKeyframe(keyframeConfig, keyframeId, channel) {
		var needsResorting = false;

		var keyframe = ArrayUtils.find(channel.keyframes, function (keyframe) {
			return keyframe.id === keyframeId;
		});

		var easingFunction = getEasingFunction(keyframeConfig.easing);

		// create a new keyframe if it does not exist already or update it if it exists
		if (!keyframe) {
			channel.addKeyframe(
				keyframeId,
				keyframeConfig.time,
				keyframeConfig.value,
				easingFunction
			);
		} else {
			// the time of one keyframe changed so we're not certain anymore that they're sorted
			if (keyframe.time !== +keyframeConfig.time) {
				needsResorting = true;
			}
			keyframe.time = +keyframeConfig.time;
			keyframe.value = +keyframeConfig.value;
			keyframe.easingFunction = easingFunction;
		}

		return {
			needsResorting: needsResorting
		};
	}

	function updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig) {
		var needsResorting = false;

		var callbackEntry = ArrayUtils.find(channel.keyframes, function (callbackEntry) {
			return callbackEntry.id === keyframeId;
		});

		// create the event emitter callback, we're gonna use it anyway
		var eventEmitter = function () {
			SystemBus.emit(channelConfig.eventName, keyframeConfig.value);
		};

		// create a new callback entry in the callback agenda if it does not exist already or update it if it exists
		if (!callbackEntry) {
			channel.addCallback(keyframeId, keyframeConfig.time, eventEmitter);
		} else {
			// the time of one keyframe changed so we're not certain anymore that they're sorted
			if (callbackEntry.time !== +keyframeConfig.time) {
				needsResorting = true;
			}
			callbackEntry.time = +keyframeConfig.time;
			callbackEntry.callback = eventEmitter;
		}

		return {
			needsResorting: needsResorting
		};
	}

	function updateChannel(channelConfig, channelId, component, entityResolver, rotationMap) {
		// search for existing one
		var channel = ArrayUtils.find(component.channels, function (channel) {
			return channel.id === channelId;
		});

		// and create one if needed
		if (!channel) {
			var key = channelConfig.propertyKey;
			if (key) {
				var entityId = channelConfig.entityId;
				if (entityId && !rotationMap[entityId]) {
					rotationMap[entityId] = [0, 0, 0];
				}
				var updateCallback =
					TimelineComponentHandler.tweenMap[key](entityId, entityResolver, rotationMap[entityId]);

				channel = new ValueChannel(channelId, {
					callbackUpdate: updateCallback
				});
			} else {
				channel = new EventChannel(channelId);
			}
			component.channels.push(channel);
		} else if (channelConfig.entityId && channel.callbackUpdate && channel.callbackUpdate.rotation) {
			var rotation = rotationMap[channelConfig.entityId] = channel.callbackUpdate.rotation;
			rotation[0] = 0;
			rotation[1] = 0;
			rotation[2] = 0;
		}

		channel.enabled = channelConfig.enabled !== false;

		// remove existing keyframes in the channel that are not mentioned in the config anymore
		// filter preserves the order, otherwise the channel would fail to work
		// the keyframes need always be sorted by their time property
		channel.keyframes = channel.keyframes.filter(function (keyframe) {
			return !!channelConfig.keyframes[keyframe.id];
		});

		var needsResorting = false;

		if (channelConfig.propertyKey) {
			for (var keyframeId in channelConfig.keyframes) {
				var keyframeConfig = channelConfig.keyframes[keyframeId];
				var updateResult = updateValueChannelKeyframe(keyframeConfig, keyframeId, channel, channelConfig);
				needsResorting = needsResorting || updateResult.needsResorting;
			}
		} else {
			for (var keyframeId in channelConfig.keyframes) {
				var keyframeConfig = channelConfig.keyframes[keyframeId];
				var updateResult = updateEventChannelKeyFrame(keyframeConfig, keyframeId, channel, channelConfig);
				needsResorting = needsResorting || updateResult.needsResorting;
			}
		}

		// !AT: if time was changed for any keyframe then the whole channel might not work as expected
		// could make this even faster but let's not go that far
		if (needsResorting) {
			channel.sort();
		}
	}

	TimelineComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			if (!isNaN(config.duration)) {
				component.duration = +config.duration;
			}
			component.loop = (config.loop.enabled === true);

			component.autoStart = (config.autoStart !== undefined ? config.autoStart : true);
			if (component.autoStart) {
				component.start();
			} else {
				component.stop();
			}

			// remove existing channels in the component that are not mentioned in the config anymore
			component.channels = component.channels.filter(function (channel) {
				return !!config.channels[channel.id];
			});

			var entityResolver = function (entityId) {
				return that.world.entityManager.getEntityById(entityId);
			};
			var rotationMap = {};

			ObjectUtils.forEach(config.channels, function (channelConfig) {
				updateChannel(channelConfig, channelConfig.id, component, entityResolver, rotationMap);
			}, null, 'sortValue');

			return component;
		});
	};

	module.exports = TimelineComponentHandler;

/***/ },

/***/ 513:
/***/ function(module, exports, __webpack_require__) {

	var AbstractTimelineChannel = __webpack_require__(509);
	var MathUtils = __webpack_require__(9);

	function ValueChannel(id, options) {
		AbstractTimelineChannel.call(this, id);

		this.value = 0;

		options = options || {};
		this.callbackUpdate = options.callbackUpdate;
		this.callbackEnd = options.callbackEnd;
	}

	ValueChannel.prototype = Object.create(AbstractTimelineChannel.prototype);
	ValueChannel.prototype.constructor = ValueChannel;

	/**
	 * Schedules a tween
	 * @param id
	 * @param time Start time
	 * @param value
	 * @param {function (number)} easingFunction
	 */
	ValueChannel.prototype.addKeyframe = function (id, time, value, easingFunction) {
		var newKeyframe = {
			id: id,
			time: time,
			value: value,
			easingFunction: easingFunction
		};

		if (time > this.lastTime) {
			this.keyframes.push(newKeyframe);
			this.lastTime = time;
		} else if (!this.keyframes.length || time < this.keyframes[0].time) {
			this.keyframes.unshift(newKeyframe);
		} else {
			var index = this._find(this.keyframes, time) + 1;
			this.keyframes.splice(index, 0, newKeyframe);
		}

		return this;
	};

	/**
	 * Update the channel to a given time.
	 * @param time
	 */
	ValueChannel.prototype.update = function (time) {
		if (!this.enabled) { return this.value; }
		if (!this.keyframes.length) { return this.value; }

		var newValue;
		var newEntryIndex;
		if (time <= this.keyframes[0].time) {
			newValue = this.keyframes[0].value;
		} else if (time >= this.keyframes[this.keyframes.length - 1].time) {
			newValue = this.keyframes[this.keyframes.length - 1].value;
		} else {
			newEntryIndex = this._find(this.keyframes, time);
			var newEntry = this.keyframes[newEntryIndex];
			var nextEntry = this.keyframes[newEntryIndex + 1];

			var progressInEntry = (time - newEntry.time) / (nextEntry.time - newEntry.time);
			var progressValue = newEntry.easingFunction(progressInEntry);

			newValue = MathUtils.lerp(progressValue, newEntry.value, nextEntry.value);
		}

		//! AT: comparing floats with === is ok here
		// if (this.value !== newValue || true) { // overriding for now to get time progression
		//! AT: not sure if create people want this all the time or not
		this.value = newValue;
		this.callbackUpdate(time, this.value, newEntryIndex);
		// }

		return this;
	};

	ValueChannel.prototype.setTime = ValueChannel.prototype.update;

	// tween factories
	ValueChannel.getSimpleTransformTweener = function (type, vectorComponent, entityId, resolver) {
		var entity;
		return function (time, value) {
			if (!entity) { entity = resolver(entityId); }

			//
			// REVIEW:
			// what about a guard instead?
			// if (!entity) { return; }
			// I used to be pro-guard as it reduces indentation, but is it easier to read..?
			//

			//! AT: this prevents the timeline from blowing up if the entity is absent
			// it's a temporary fix in the engine until the issue is patched in create
			// https://trello.com/c/cj8XQnUz/1588-normal-user-can-t-import-prefabs-with-timelines-if-not-all-animated-objects-are-in-the-prefab
			if (entity) {
				entity.transformComponent.transform[type][vectorComponent] = value;
				entity.transformComponent.setUpdated();
			}
		};
	};

	ValueChannel.getRotationTweener = function (angleIndex, entityId, resolver, rotation) {
		var entity;
		var func = function (time, value) {
			if (!entity) { entity = resolver(entityId); }
			//! AT: same here as above; a tmp fix
			if (entity) {
				var rotation = func.rotation;
				rotation[angleIndex] = value * MathUtils.DEG_TO_RAD;
				entity.transformComponent.transform.rotation.fromAngles(rotation[0], rotation[1], rotation[2]);
				entity.transformComponent.setUpdated();
			}
		};
		func.rotation = rotation;
		return func;
	};

	module.exports = ValueChannel;


/***/ },

/***/ 514:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);

	/**
	 * Manages entities with a TimelineComponent
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/timelinepack/TimelineComponent/TimelineComponent-vtest.html Working example
	 */
	function TimelineSystem() {
		System.call(this, 'TimelineSystem', ['TimelineComponent']);
	}

	TimelineSystem.prototype = Object.create(System.prototype);
	TimelineSystem.prototype.constructor = TimelineSystem;

	TimelineSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];

			entity.timelineComponent.update(tpf);
		}
	};

	/**
	 * Resumes updating the entities
	 */
	TimelineSystem.prototype.play = function () {
		this.passive = false;
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].timelineComponent;
			if (component.autoStart) {
				component.start();
			}
		}
	};

	/**
	 * Stops updating the entities
	 */
	TimelineSystem.prototype.pause = function () {
		this.passive = true;
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].timelineComponent;
			component.pause();
		}
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	TimelineSystem.prototype.resume = TimelineSystem.prototype.play;

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	TimelineSystem.prototype.stop = function () {
		this.passive = true;
		var entities = this._activeEntities;
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].timelineComponent;
			component.stop();
		}
	};

	module.exports = TimelineSystem;

/***/ }

});
