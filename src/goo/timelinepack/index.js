import AbstractTimelineChannel from './AbstractTimelineChannel';
import EventChannel from './EventChannel';
import TimelineComponent from './TimelineComponent';
import TimelineComponentHandler from './TimelineComponentHandler';
import TimelineSystem from './TimelineSystem';
import ValueChannel from './ValueChannel';
import ObjectUtils from '../util/ObjectUtils';

module.exports = {
	AbstractTimelineChannel,
	EventChannel,
	TimelineComponent,
	TimelineComponentHandler,
	TimelineSystem,
	ValueChannel
};

ObjectUtils.extend(window.goo, module.exports);