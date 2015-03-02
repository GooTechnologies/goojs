define(['goo/math/MathUtils'], function (MathUtils) {
    'use strict';
    __touch(10776);
    function Matrix(rows, cols) {
        this.rows = rows || 0;
        __touch(10802);
        this.cols = cols || 0;
        __touch(10803);
        this.data = new Float32Array(this.rows * this.cols);
        __touch(10804);
    }
    __touch(10777);
    Matrix.setupAliases = function (prototype, aliases) {
        for (var i = 0; i < aliases.length; i++) {
            (function (index) {
                for (var j = 0; j < aliases[index].length; j++) {
                    Object.defineProperty(prototype, aliases[index][j], {
                        get: function () {
                            return this.data[index];
                            __touch(10808);
                        },
                        set: function (value) {
                            this.data[index] = value;
                            __touch(10809);
                        }
                    });
                    __touch(10807);
                }
                Object.defineProperty(prototype, i, {
                    get: function () {
                        return this.data[index];
                        __touch(10810);
                    },
                    set: function (value) {
                        this.data[index] = value;
                        __touch(10811);
                    }
                });
                __touch(10806);
            }(i));
            __touch(10805);
        }
    };
    __touch(10778);
    Matrix.add = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(10812);
        var cols = lhs.cols;
        __touch(10813);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10815);
        }
        if (rhs instanceof Matrix) {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] + rhs.data[i];
                __touch(10816);
            }
        } else {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] + rhs;
                __touch(10817);
            }
        }
        return target;
        __touch(10814);
    };
    __touch(10779);
    Matrix.prototype.add = function (rhs) {
        return Matrix.add(this, rhs, this);
        __touch(10818);
    };
    __touch(10780);
    Matrix.sub = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(10819);
        var cols = lhs.cols;
        __touch(10820);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10822);
        }
        if (rhs instanceof Matrix) {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] - rhs.data[i];
                __touch(10823);
            }
        } else {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] - rhs;
                __touch(10824);
            }
        }
        return target;
        __touch(10821);
    };
    __touch(10781);
    Matrix.prototype.sub = function (rhs) {
        return Matrix.sub(this, rhs, this);
        __touch(10825);
    };
    __touch(10782);
    Matrix.mul = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(10826);
        var cols = lhs.cols;
        __touch(10827);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10829);
        }
        if (rhs instanceof Matrix) {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] * rhs.data[i];
                __touch(10830);
            }
        } else {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] * rhs;
                __touch(10831);
            }
        }
        return target;
        __touch(10828);
    };
    __touch(10783);
    Matrix.prototype.mul = function (rhs) {
        return Matrix.mul(this, rhs, this);
        __touch(10832);
    };
    __touch(10784);
    Matrix.div = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(10833);
        var cols = lhs.cols;
        __touch(10834);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10836);
        }
        if (rhs instanceof Matrix) {
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] / rhs.data[i];
                __touch(10837);
            }
        } else {
            rhs = 1 / rhs;
            __touch(10838);
            for (var i = 0; i < lhs.data.length; i++) {
                target.data[i] = lhs.data[i] * rhs;
                __touch(10839);
            }
        }
        return target;
        __touch(10835);
    };
    __touch(10785);
    Matrix.prototype.div = function (rhs) {
        return Matrix.div(this, rhs, this);
        __touch(10840);
    };
    __touch(10786);
    Matrix.combine = function (lhs, rhs, target) {
        var rows = lhs.rows;
        __touch(10841);
        var cols = rhs.cols;
        __touch(10842);
        var size = lhs.cols = rhs.rows;
        __touch(10843);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10845);
        }
        if (target === lhs || target === rhs) {
            return Matrix.copy(Matrix.combine(lhs, rhs), target);
            __touch(10846);
        }
        for (var c = 0; c < cols; c++) {
            var o = c * rows;
            __touch(10847);
            for (var r = 0; r < rows; r++) {
                var sum = 0;
                __touch(10848);
                for (var i = 0; i < size; i++) {
                    sum += lhs.data[i * lhs.rows + r] * rhs.data[c * rhs.rows + i];
                    __touch(10850);
                }
                target.data[o + r] = sum;
                __touch(10849);
            }
        }
        return target;
        __touch(10844);
    };
    __touch(10787);
    Matrix.prototype.combine = function (rhs) {
        return Matrix.combine(this, rhs, this);
        __touch(10851);
    };
    __touch(10788);
    Matrix.transpose = function (source, target) {
        var rows = source.cols;
        __touch(10852);
        var cols = source.rows;
        __touch(10853);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10855);
        }
        if (target === source) {
            return Matrix.copy(Matrix.transpose(source), target);
            __touch(10856);
        }
        for (var c = 0; c < cols; c++) {
            var o = c * rows;
            __touch(10857);
            for (var r = 0; r < rows; r++) {
                target.data[o + r] = source.data[r * cols + c];
                __touch(10858);
            }
        }
        return target;
        __touch(10854);
    };
    __touch(10789);
    Matrix.prototype.transpose = function () {
        return Matrix.transpose(this, this);
        __touch(10859);
    };
    __touch(10790);
    Matrix.copy = function (source, target) {
        var rows = source.rows;
        __touch(10860);
        var cols = source.cols;
        __touch(10861);
        if (!target) {
            target = new Matrix(rows, cols);
            __touch(10864);
        }
        target.data.set(source.data);
        __touch(10862);
        return target;
        __touch(10863);
    };
    __touch(10791);
    Matrix.prototype.copy = function (source) {
        return Matrix.copy(source, this);
        __touch(10865);
    };
    __touch(10792);
    Matrix.equals = function (lhs, rhs) {
        if (lhs.rows !== rhs.rows || lhs.cols !== rhs.cols) {
            return false;
            __touch(10867);
        }
        for (var i = 0; i < lhs.data.length; i++) {
            if (Math.abs(lhs.data[i] - rhs.data[i]) > MathUtils.EPSILON) {
                return false;
                __touch(10868);
            }
        }
        return true;
        __touch(10866);
    };
    __touch(10793);
    Matrix.prototype.equals = function (rhs) {
        return Matrix.equals(this, rhs);
        __touch(10869);
    };
    __touch(10794);
    Matrix.prototype.isOrthogonal = function () {
        for (var ca = 0; ca < this.cols; ca++) {
            for (var cb = ca + 1; cb < this.cols; cb++) {
                var oa = ca * this.rows;
                __touch(10871);
                var ob = cb * this.rows;
                __touch(10872);
                var sum = 0;
                __touch(10873);
                for (var r = 0; r < this.rows; r++) {
                    sum += this.data[oa + r] * this.data[ob + r];
                    __touch(10874);
                }
                if (Math.abs(sum) > MathUtils.EPSILON) {
                    return false;
                    __touch(10875);
                }
            }
        }
        return true;
        __touch(10870);
    };
    __touch(10795);
    Matrix.prototype.isNormal = function () {
        for (var c = 0; c < this.cols; c++) {
            var o = c * this.rows;
            __touch(10877);
            var sum = 0;
            __touch(10878);
            for (var r = 0; r < this.rows; r++) {
                sum += this.data[o + r] * this.data[o + r];
                __touch(10879);
            }
            if (Math.abs(sum - 1) > MathUtils.EPSILON) {
                return false;
                __touch(10880);
            }
        }
        return true;
        __touch(10876);
    };
    __touch(10796);
    Matrix.prototype.isOrthonormal = function () {
        return this.isOrthogonal() && this.isNormal();
        __touch(10881);
    };
    __touch(10797);
    Matrix.prototype.clone = function () {
        return Matrix.copy(this);
        __touch(10882);
    };
    __touch(10798);
    Matrix.prototype.set = function () {
        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            if (arguments[0] instanceof Matrix) {
                this.copy(arguments[0]);
                __touch(10884);
            } else {
                for (var i = 0; i < arguments[0].length; i++) {
                    this.data[i] = arguments[0][i];
                    __touch(10885);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                this.data[i] = arguments[i];
                __touch(10886);
            }
        }
        return this;
        __touch(10883);
    };
    __touch(10799);
    Matrix.prototype.toString = function () {
        var string = '';
        __touch(10887);
        for (var c = 0; c < this.cols; c++) {
            var offset = c * this.rows;
            __touch(10889);
            string += '[';
            __touch(10890);
            for (var r = 0; r < this.rows; r++) {
                string += this.data[offset + r];
                __touch(10892);
                string += r !== this.rows - 1 ? ', ' : '';
                __touch(10893);
            }
            string += c !== this.cols - 1 ? '], ' : ']';
            __touch(10891);
        }
        return string;
        __touch(10888);
    };
    __touch(10800);
    return Matrix;
    __touch(10801);
});
__touch(10775);