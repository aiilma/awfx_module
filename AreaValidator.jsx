#include 'AreaValidationError.jsx';

// TODO: конструктор класса не должен принимать callbacks (вынести в отдельный класс по работе со слоями)
// TODO: упростить _getLastRowIdIfExceedsByHeight
// TODO: _willExceedByWidthAfterPut И _willExceedByHeightAfterPut аналогичны (извлечь в один метод)
// TODO: класс должен решать проблему для слоёв только с горизонтальным текстом
// TODO: найти места, в которых можно выбрасывать исключение

function AreaValidator(textLrHelper) {
    this._INIT = false;
    this._dLr = null;
    this._mLr = null;
    this._exceededSub = '';

    this._textLrHelper = textLrHelper;
}

var AreaValidatorPrototype = {};
AreaValidatorPrototype.prototype = Object.prototype;
AreaValidator.prototype = AreaValidatorPrototype;
AreaValidator.prototype.constructor = AreaValidator;

AreaValidator.prototype.validate = function (dLr) {
    this._init(dLr);

    this._process();

    this._finish();

    return this;
}

AreaValidator.prototype.passes = function() {
    return !this._exceededSub.length;
}

AreaValidator.prototype._init = function (dLr) {
    // init a data layer
    if (!(dLr instanceof TextLayer)) throw new Error("A layer of type TextLayer must be passed.");
    if (!(dLr.sourceText.value.boxText)) throw new Error(dLr.name + " must be bounded.");
    this._dLr = dLr;

    // init a serve layer
    this._mLr = this._textLrHelper.create('mock', false);
    this._textLrHelper.syncAttrs(this._dLr, this._mLr);
    this._INIT = true;
}

AreaValidator.prototype._process = function () {
    var rows = this._splitIntoRows();
    var id = this._getLastRowIdIfExceedsByHeight(rows);

    if (id !== undefined) {
        this._exceededSub = this._extractExceededRow(rows, id);
    }
}

AreaValidator.prototype._splitIntoRows = function () {
    var oldText = this._mLr.sourceText.value.text; // нужен ли mockText.. может, убрать, чтобы зависеть от основного (обрезая его по условию) и закидывать буковки в результирующую строку
    var subs = [];

    while (this._mLr.sourceText.value.text.length) {
        // извлечь подстроку
        var newSub = this._getRowByWidth(this._dLr, this._mLr);
        // закинуть её в массив подстрок
        subs.push(newSub);

        // обновить значение слоя до обрезанного с самого начала по длинне подстроки
        var updatedText = (this._mLr.sourceText.value.text).slice(newSub.length);
        this._mLr.sourceText.setValue(updatedText);
    }

    this._mLr.sourceText.setValue(oldText);
    return subs;
}

AreaValidator.prototype._getRowByWidth = function () {
    var oldText = this._mLr.sourceText.value.text;
    var sub = '';
    this._mLr.sourceText.setValue(sub);

    for (var i = 0; i < oldText.length; i++) {
        var ch = oldText[i];

        if (this._willExceedByWidthAfterPut(ch)) break;

        sub = sub.concat(ch);
        this._mLr.sourceText.setValue(sub);
    }

    this._mLr.sourceText.setValue(oldText);
    return sub;
}

AreaValidator.prototype._willExceedByWidthAfterPut = function (ch) {
    var maxWidthArea = this._textLrHelper.getContentDimensions(this._dLr)['w'];
    var oldText = this._mLr.sourceText.value.text, result;

    this._textLrHelper.putChar(this._mLr)(ch);
    result = (this._textLrHelper.getContentDimensions(this._mLr)['w'] > maxWidthArea);

    this._mLr.sourceText.setValue(oldText); // revert old text
    return result;
}

AreaValidator.prototype._willExceedByHeightAfterPut = function (dupLr, row) {
    var maxHeightArea = this._textLrHelper.getContentDimensions(this._dLr)['h'];
    var oldText = dupLr.sourceText.value.text, result;

    this._textLrHelper.putChar(dupLr)(row);
    result = (this._textLrHelper.getContentDimensions(dupLr)['h'] > maxHeightArea);

    dupLr.sourceText.setValue(oldText); // revert old text
    return result;
}

AreaValidator.prototype._getLastRowIdIfExceedsByHeight = function (rowsArr) {
    // дублировать слой с данными
    var dataLrDuplicate = this._dLr.duplicate();
    var textDocument = dataLrDuplicate.sourceText.value;
    textDocument.boxTextSize = [textDocument.boxTextSize[0], textDocument.boxTextSize[1] * 2]; // высота box'a в два раза > от высоты слоя с данными
    textDocument.text = ""; // очистить текст дублированного слоя
    dataLrDuplicate.sourceText.setValue(textDocument);

    for (var i = 0; i < rowsArr.length; i++) {
        var row = rowsArr[i];

        // если i-ая строка может превысеть высоту слоя с данными, то вернуть индекс текущей строки
        if (this._willExceedByHeightAfterPut(dataLrDuplicate, row)) {
            this._unsetLayers(dataLrDuplicate);
            return i;
        }

        // положить i-ую строку из subs в дубликат
        var newStr = (dataLrDuplicate.sourceText.value.text).concat(row);
        dataLrDuplicate.sourceText.setValue(newStr);
    }

    this._unsetLayers(dataLrDuplicate);
    return undefined;
}

AreaValidator.prototype._extractExceededRow = function (rows, lastBoxRowId) {
    var fullStr = this._dLr.sourceText.value.text, visibleSub = '';

    for (var idx = 0; idx < lastBoxRowId; idx++) {
        visibleSub = visibleSub.concat(rows[idx]);
    }

    return fullStr.slice(visibleSub.length)
}

AreaValidator.prototype._finish = function () {
    this._unsetLayers(this._mLr);
    this._INIT = false;
}

AreaValidator.prototype._unsetLayers = function() {
    for (var layerId = 0; layerId < arguments.length; layerId++) {
        arguments[layerId].remove();
        arguments[layerId] = null;
    }
}

// ~~~~~API~~~~~:
// v.validate(AWTextLayer);
// v.validate(AWTextLayer).passes();

// v.validate(AWTextLayer).getErrros();