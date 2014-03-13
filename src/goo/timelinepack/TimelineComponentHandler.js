define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/timelinepack/TimelineComponent',
	'goo/timelinepack/Channel',
	'goo/util/PromiseUtil'
	],
/** @lends */
	function(
	ComponentHandler,
	TimelineComponent,
	Channel,
	PromiseUtil
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

	TimelineComponent.tweenMap = {
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

			//! AT: not sure if this is the best place
			for (var i = 0; i < config.channels.length; i++) {
				var channelConfig = config.channels[i];

				var channel = new Channel(TimelineComponent.tweenMap[channelConfig.entityProperty]);
				for (var j = 0; j < channelConfig.entries.length; i++) {
					var entryConfig = channelConfig.entries[j];
					var entry = {
						start: entryConfig.start,
						value: entryConfig.value,
						easingFunction: TWEEN.Easing[entryConfig.easingType][entryConfig.easingDirection]
					};
					channel.entries.push(entry);
				}

				component.channels.push(channel);
			}

			return PromiseUtil.createDummyPromise(component);
		});
	};

	return TimelineComponentHandler;
});