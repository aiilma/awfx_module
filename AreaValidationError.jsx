function AreaValidationError(id, message) {
    this.id = id;
    this.message = message || "Undefined error.";
}

var AreaValidationErrorPrototype = {};
AreaValidationErrorPrototype.prototype = Error.prototype;

AreaValidationError.prototype = AreaValidationErrorPrototype;
AreaValidationError.prototype.name = "AreaValidationError";
AreaValidationError.prototype.constructor = AreaValidationError;
AreaValidationError.prototype.toString = function() {
    var res = '';

    res += "name: " + this.name + "\n";
    res += "id: " + this.id + "\n";
    res += "message: " + this.message;

    return res;
}