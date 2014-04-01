define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/timelinepack/TimelineComponent',
	'goo/timelinepack/ValueChannel',
	'goo/timelinepack/EventChannel',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil',
	'goo/entities/SystemBus'
	],
/** @lends */
	function(
	ComponentHandler,
	TimelineComponent,
	ValueChannel,
	EventChannel,
	PromiseUtil,
	ArrayUtil,
	SystemBus
	) {
	'use strict';

	/**
	 * @class
	 * @private
	 */
	function TimelineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'TimelineComponent';
	}

	TimelineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TimelineComponentHandler.prototype.constructor = TimelineComponentHandler;
	ComponentHandler._registerClass('timeline', TimelineComponentHandler);

	TimelineComponentHandler.prototype._prepare = function(/*config*/) {};

	TimelineComponentHandler.prototype._create = function() {
		return new TimelineComponent();
	};

	TimelineComponentHandler.tweenMap = {
		'translationX': ValueChannel.getTranslationXTweener,
		'translationY': ValueChannel.getTranslationYTweener,
		'translationZ': ValueChannel.getTranslationZTweener,
		'scaleX': ValueChannel.getScaleXTweener,
		'scaleY': ValueChannel.getScaleYTweener,
		'scaleZ': ValueChannel.getScaleZTweener,
		'event': function () {}
	};

	//! AT: requires TWEEN
	function getEasingFunction(easingString) {
		if (!easingString) {
			return TWEEN.Easing.Linear.None;
		}
		var separator = easingString.indexOf('.');
		var easingType = easingString.substr(0, separator);
		var easingDirection = easingString.substr(separator + 1);
		return TWEEN.Easing[easingType][easingDirection];
	}

	function updateKeyframe(keyframeConfig, keyframeId, channel) {
		var needsResorting = false;

		var keyframe = ArrayUtil.find(channel.keyframes, function (keyframe) {
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

	function updateCallbackEntry(keyframeConfig, keyframeId, channel, channelConfig) {
		var needsResorting = false;

		var callbackEntry = ArrayUtil.find(channel.keyframes, function (callbackEntry) {
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

	function updateChannel(channelConfig, channelId, component) {
		// search for existing one
		var channel = ArrayUtil.find(component.channels, function (channel) {
			return channel.id === channelId;
		});

		// and create one if needed
		if (!channel) {
			if (channelConfig.propertyKey) {
				// REVIEW should be called with (id, options) not (id, callback) according to Channel
				var updateCallback = channelConfig.propertyKey ?
					TimelineComponentHandler.tweenMap[channelConfig.propertyKey] :
					function () {};

				channel = new ValueChannel(channelId, {
					callbackUpdate: updateCallback
				});
			} else {
				channel = new EventChannel(channelId);
			}

			// REVIEW Channel needs to be connected to child entity somewhere
			component.channels.push(channel);
		}

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
				var updateResult = updateKeyframe(keyframeConfig, keyframeId, channel);
				needsResorting = needsResorting || updateResult.needsResorting;
			}
		} else {
			for (var keyframeId in channelConfig.keyframes) {
				var keyframeConfig = channelConfig.keyframes[keyframeId];
				var updateResult = updateCallbackEntry(keyframeConfig, keyframeId, channel);
				needsResorting = needsResorting || updateResult.needsResorting;
			}
		}

		// !AT: if time was changed for any keyframe then the whole channel might not work as expected
		// could make this even faster but let's not go that far
		if (needsResorting) {
			channel.sort();
		}
	}

	TimelineComponentHandler.prototype.update = function(entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// remove existing channels in the component that are not mentioned in the config anymore
			component.channels = component.channels.filter(function (channel) {
				return !!config.channels[channel.id];
			});

			for (var channelId in config.channels) {
				var channelConfig = config.channels[channelId];
				updateChannel(channelConfig, channelId, component);
			}

			return component;
		});
	};

	return TimelineComponentHandler;
});