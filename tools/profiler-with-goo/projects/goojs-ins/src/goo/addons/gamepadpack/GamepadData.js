define(['goo/math/Vector2'], function (Vector2) {
    'use strict';
    __touch(519);
    function GamepadData() {
        this.leftStickDirection = new Vector2();
        __touch(528);
        this.rightStickDirection = new Vector2();
        __touch(529);
        this.buttonData = {};
        __touch(530);
        var BUTTON_BUFFER = 20;
        __touch(531);
        for (var i = 0; i < BUTTON_BUFFER; i++) {
            this.buttonData[i] = {
                pressed: false,
                down: false,
                value: 0
            };
            __touch(534);
        }
        this.leftAmount = 0;
        __touch(532);
        this.rightAmount = 0;
        __touch(533);
    }
    __touch(520);
    GamepadData.prototype.recalculateData = function (gamepad) {
        this.recalculateSticks(gamepad);
        __touch(535);
        this.recalculateButtons(gamepad);
        __touch(536);
    };
    __touch(521);
    GamepadData.prototype.resetData = function (gamepad) {
        var activeButtonLength = gamepad.buttons.length;
        __touch(537);
        for (var i = 0; i < activeButtonLength; i++) {
            this.buttonData[i].pressed = false;
            __touch(538);
        }
    };
    __touch(522);
    GamepadData.prototype.recalculateButtons = function (gamepad) {
        var buttons = gamepad.buttons;
        __touch(539);
        var numOfButtons = buttons.length;
        __touch(540);
        for (var i = 0; i < numOfButtons; i++) {
            var buttonValue = buttons[i];
            __touch(541);
            if (buttonValue === 1) {
                this.buttonData[i].down = true;
                __touch(543);
            } else {
                if (this.buttonData[i].down === true) {
                    this.buttonData[i].pressed = true;
                    __touch(545);
                }
                this.buttonData[i].down = false;
                __touch(544);
            }
            this.buttonData[i].value = buttonValue;
            __touch(542);
        }
    };
    __touch(523);
    GamepadData.prototype.recalculateSticks = function (gamepad) {
        var axes = gamepad.axes;
        __touch(546);
        var leftX = axes[0];
        __touch(547);
        var leftY = axes[1];
        __touch(548);
        this.calculateStickDirection(this.leftStickDirection, leftX, leftY);
        __touch(549);
        this.leftAmount = this.calculateStickAmount(leftX, leftY);
        __touch(550);
        var rightX = axes[2];
        __touch(551);
        var rightY = axes[3];
        __touch(552);
        this.calculateStickDirection(this.rightStickDirection, rightX, rightY);
        __touch(553);
        this.rightAmount = this.calculateStickAmount(rightX, rightY);
        __touch(554);
    };
    __touch(524);
    GamepadData.prototype.calculateStickDirection = function (dirVector, x, y) {
        dirVector.setd(x, y);
        __touch(555);
        var length = dirVector.length();
        __touch(556);
        if (length > 1e-7) {
            dirVector.data[0] /= length;
            __touch(557);
            dirVector.data[1] /= length;
            __touch(558);
        }
    };
    __touch(525);
    GamepadData.prototype.calculateStickAmount = function (x, y) {
        return Math.max(Math.abs(x), Math.abs(y));
        __touch(559);
    };
    __touch(526);
    return GamepadData;
    __touch(527);
});
__touch(518);