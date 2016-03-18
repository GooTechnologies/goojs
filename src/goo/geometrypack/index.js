import FilledPolygon from './FilledPolygon';
import PolyLine from './PolyLine';
import RegularPolygon from './RegularPolygon';
import Surface from './Surface';
import TextComponent from './text/TextComponent';
import TextComponentHandler from './text/TextComponentHandler';
import TextMeshGenerator from './text/TextMeshGenerator';
import Triangle from './Triangle';

module.exports = {
	FilledPolygon,
	PolyLine,
	RegularPolygon,
	Surface,
	TextComponent,
	TextComponentHandler,
	TextMeshGenerator,
	Triangle
};

import ObjectUtils from './../util/ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}