"use strict";
var AnekdotStorage = (function () {
    function AnekdotStorage() {
        this.anekdots = [];
        this.index = 0;
    }
    AnekdotStorage.prototype.update = function (anekdots) {
        this.anekdots = anekdots;
        this.index = 0;
    };
    AnekdotStorage.prototype.getNext = function () {
        this.index++;
        //TODO временно зациклим
        if (this.index >= this.anekdots.length) {
            this.index = 0;
        }
        return this.anekdots[this.index];
    };
    AnekdotStorage.prototype.hasNext = function () {
        if (this.index < this.anekdots.length) {
            return true;
        }
        return false;
    };
    return AnekdotStorage;
}());
exports.AnekdotStorage = AnekdotStorage;
