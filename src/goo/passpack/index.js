import BloomPass from './BloomPass';
import BlurPass from './BlurPass';
import DepthPass from './DepthPass';
import DofPass from './DofPass';
import DogPass from './DogPass';
import index from './index';
import MotionBlurPass from './MotionBlurPass';
import PassLib from './PassLib';
import PosteffectsHandler from './PosteffectsHandler';
import ShaderLibExtra from './ShaderLibExtra';
import SsaoPass from './SsaoPass';

module.exports = {
	BloomPass,
	BlurPass,
	DepthPass,
	DofPass,
	DogPass,
	index,
	MotionBlurPass,
	PassLib,
	PosteffectsHandler,
	ShaderLibExtra,
	SsaoPass
};

import ObjectUtils from './../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}