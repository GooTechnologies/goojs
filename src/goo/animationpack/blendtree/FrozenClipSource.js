import Source from '../../animationpack/blendtree/Source';


	/**
	 * A blend tree node that does not update any clips or sources below it in the blend tree. This is useful for freezing an animation, often
	 *        for purposes of transitioning between two unrelated animations.
	 * @param {(ClipSource|BinaryLerpSource|FrozenClipSource|ManagedTransformSource)} source Our sub source.
	 * @param {number} frozenTime The time we are frozen at.
	 * @extends Source
	 */
	function FrozenClipSource (source, frozenTime) {
		Source.call(this);
		this._source = source;
		this._time = frozenTime;
	}

	FrozenClipSource.prototype = Object.create(Source.prototype);
	FrozenClipSource.prototype.constructor = FrozenClipSource;

	/**
	 * @returns a source data mapping for the channels in this clip source
	 */
	FrozenClipSource.prototype.getSourceData = function () {
		return this._source.getSourceData();
	};

	/**
	 * Sets start time of clipinstance to 0, so frozenTime will calculate correctly
	 */
	FrozenClipSource.prototype.resetClips = function () {
		this._source.resetClips(0);
	};

	/**
	 * This will be called by a {@link SteadyState}, but will not update the animation, and will return true, to indicate animation is still active
	 */
	FrozenClipSource.prototype.setTime = function () {
		this._source.setTime(this._time);
		return true;
	};

	/**
	 * @returns {FrozenClipSource}
	 */
	FrozenClipSource.prototype.clone = function () {
		var cloned = new FrozenClipSource(
			this._source.clone(),
			this._time
		);

		return cloned;
	};

	export default FrozenClipSource;