define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/timelinepack/TimelineComponent',
	'goo/timelinepack/Channel',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil'
	],
/** @lends */
	function(
	ComponentHandler,
	TimelineComponent,
	Channel,
	PromiseUtil,
	ArrayUtil
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
		'translationX': Channel.getTranslationXTweener,
		'translationY': Channel.getTranslationYTweener,
		'translationZ': Channel.getTranslationZTweener,
		'scaleX': Channel.getScaleXTweener,
		'scaleY': Channel.getScaleYTweener,
		'scaleZ': Channel.getScaleZTweener
	};

	TimelineComponentHandler.prototype.update = function(entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// remove unmentioned channels
			component.channels = component.channels.filter(function (channel) {
				return !!config.channels[channel.id];
			});

			for (var channelId in config.channels) {
				var channelConfig = config.channels[channelId];

				// search for existing one
				var channel = ArrayUtil.find(component.channels, function (channel) {
					return channel.id === channelId;
				});

				// and create one if needed
				if (!channel) {
					channel = new Channel(channelId, TimelineComponentHandler.tweenMap[channelConfig.propertyKey]);
					component.channels.push(channel);
				}

				// remove unmentioned keyframes
				// filter preserves the order, otherwise the channel would fail to work
				channel.keyframes = channel.keyframes.filter(function (keyframe) {
					return !!channelConfig.keyframes[keyframe.id];
				});

				var needsResorting = false;

				for (var keyframeId in channelConfig.keyframes) {
					var keyframeConfig = channelConfig.keyframes[keyframeId];

					var keyframe = ArrayUtil.find(channel.keyframes, function (keyframe) {
						return keyframe.id === keyframeId;
					});

					var easingType = 'Linear'; //keyframe.easing.substr
					var easingDirection = 'None';

					// create a new keyframe if it does not exist already or update it if it exists
					if (!keyframe) {
						// need to do some conversion over here between easingType/Direction and easing
						var easingFunction = TWEEN.Easing[easingType][easingDirection];
						channel.addKeyframe(keyframeConfig.time, keyframeConfig.value, easingFunction);
					} else {
						// the time of one keyframe changed so we're not certain anymore that they're sorted
						if (keyframe.time !== +keyframeConfig.time) {
							needsResorting = true;
						}
						keyframe.time = +keyframeConfig.time;
						keyframe.value = +keyframeConfig.value;
						keyframe.easingFunction = TWEEN.Easing[easingType][easingDirection];
					}
				}

				// !AT: if time was changed for any keyframe then the whole channel might not work as expected
				// could make this even faster but let's not go that far
				if (needsResorting) {
					channel.sort();
				}
			}

			return component;
		});
	};

	return TimelineComponentHandler;
});