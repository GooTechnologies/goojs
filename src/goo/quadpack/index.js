import DoubleQuad from './DoubleQuad';
import QuadComponent from './QuadComponent';
import QuadComponentHandler from './QuadComponentHandler';

module.exports = {
	DoubleQuad,
	QuadComponent,
	QuadComponentHandler
};

import ObjectUtils from './../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}