define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(496);
    function GamepadComponent(gamepadIndex) {
        this.type = 'GamepadComponent';
        __touch(506);
        this.buttonDownFunctions = {};
        __touch(507);
        this.buttonUpFunctions = {};
        __touch(508);
        this.buttonPressedFunctions = {};
        __touch(509);
        this.leftStickFunction = null;
        __touch(510);
        this.rightStickFunction = null;
        __touch(511);
        this.gamepadIndex = gamepadIndex || 0;
        __touch(512);
    }
    __touch(497);
    GamepadComponent.prototype = Object.create(Component.prototype);
    __touch(498);
    GamepadComponent.prototype.constructor = GamepadComponent;
    __touch(499);
    GamepadComponent.prototype.setButtonDownFunction = function (buttonIndex, buttonFunction) {
        this.buttonDownFunctions[buttonIndex] = buttonFunction;
        __touch(513);
    };
    __touch(500);
    GamepadComponent.prototype.setButtonUpFunction = function (buttonIndex, buttonFunction) {
        this.buttonUpFunctions[buttonIndex] = buttonFunction;
        __touch(514);
    };
    __touch(501);
    GamepadComponent.prototype.setButtonPressedFunction = function (buttonIndex, buttonFunction) {
        this.buttonPressedFunctions[buttonIndex] = buttonFunction;
        __touch(515);
    };
    __touch(502);
    GamepadComponent.prototype.setLeftStickFunction = function (stickFunction) {
        this.leftStickFunction = stickFunction;
        __touch(516);
    };
    __touch(503);
    GamepadComponent.prototype.setRightStickFunction = function (stickFunction) {
        this.rightStickFunction = stickFunction;
        __touch(517);
    };
    __touch(504);
    return GamepadComponent;
    __touch(505);
});
__touch(495);