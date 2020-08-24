#include 'AreaValidationError.jsx';

// TODO: продумать обработку слоев с одинаковыми именами

// TODO: упростить _getLastRowIdIfExceedsByHeight

// TODO: класс должен решать проблему для слоёв только с горизонтальным текстом
//  (проверить гипотезу: измерить слой - создать новый слой (+синхра стилей и текста) - измерить слой).
//  сравнить значения измерений... если значения разные, то текст в слое был вертикальный.

// TODO: найти места, в которых можно выбрасывать исключение (в обоих классах)
// TODO: продумать обработку выбрасываемых исключений (возможно, запись в файл)

function AreaValidator(textLrHelper) {
    this._INIT = false;
    this._mLr = null;
    this._dataLayers = [];
    this._dataErrors = [];

    this._textLrHelper = textLrHelper;
}

var AreaValidatorPrototype = {};
AreaValidatorPrototype.prototype = Object.prototype;
AreaValidator.prototype = AreaValidatorPrototype;
AreaValidator.prototype.constructor = AreaValidator;

AreaValidator.prototype.validate = function (dataLayers) {
    this._init(dataLayers);

    this._process();

    this._finish();

    return this;
}

AreaValidator.prototype.passes = function() {
    return !this._dataErrors.length;
}

AreaValidator.prototype.getErrors = function() {
    // TODO: возвращать массив ошибок
    return this._dataErrors;
}

AreaValidator.prototype._init = function (dataLayers) {
    // init a data layer
    for (var idx = 0; idx < dataLayers.length; idx++) {
        var lr = dataLayers[idx];

        if (!(lr instanceof TextLayer)) throw new Error("A layer of type TextLayer must be passed.");
        if (!(lr.sourceText.value.boxText)) throw new Error(lr.name + " must be bounded.");
    }
    this._dataLayers = dataLayers;

    // init a serve layer
    this._mLr = this._textLrHelper.create('mock', false);
    this._INIT = true;
}

AreaValidator.prototype._process = function () {
    var dataLrs = this._dataLayers

    for (var idx = 0; idx < dataLrs.length; idx++) {
        var dataLr = dataLrs[idx],
            rows, lastRowId;

        this._textLrHelper.syncAttrs(dataLr, this._mLr);

        rows = this._splitIntoRows(dataLr);
        lastRowId = this._getLastRowIdIfExceedsByHeight(dataLr, rows);

        if (lastRowId !== undefined) {
            var error = dataLr;
            error['exceeded'] = this._extractExceededRow(dataLr, rows, lastRowId);
            this._dataErrors.push(error);
        }
    }
}

AreaValidator.prototype._splitIntoRows = function (dataLr) {
    var mockLr = this._mLr;
    var oldText = mockLr.sourceText.value.text; // нужен ли mockText.. может, убрать, чтобы зависеть от основного (обрезая его по условию) и закидывать буковки в результирующую строку
    var subs = [];

    while (mockLr.sourceText.value.text.length) {
        // извлечь подстроку
        var newSub = this._getRowByWidth(dataLr, mockLr);
        subs.push(newSub);

        // обновить значение слоя до обрезанного с самого начала по длинне подстроки
        var updatedText = (mockLr.sourceText.value.text).slice(newSub.length);
        mockLr.sourceText.setValue(updatedText);
    }

    mockLr.sourceText.setValue(oldText);
    return subs;
}

AreaValidator.prototype._getRowByWidth = function (dataLr, mockLr) {
    var oldText = mockLr.sourceText.value.text;
    var sub = '';
    mockLr.sourceText.setValue(sub);

    for (var i = 0; i < oldText.length; i++) {
        var ch = oldText[i];

        if (this._willExceedAfterPut('w', dataLr, mockLr, ch)) break;

        sub = sub.concat(ch);
        mockLr.sourceText.setValue(sub);
    }

    mockLr.sourceText.setValue(oldText);
    return sub;
}

AreaValidator.prototype._willExceedAfterPut = function (dim, dataLr, fakeLr, subStr) {
    var maxHeightArea = this._textLrHelper.getContentDimensions(dataLr)[dim],
        oldText = fakeLr.sourceText.value.text,
        result;

    this._textLrHelper.putChar(fakeLr)(subStr);
    result = (this._textLrHelper.getContentDimensions(fakeLr)[dim] > maxHeightArea);

    fakeLr.sourceText.setValue(oldText); // revert old text
    return result;
}

AreaValidator.prototype._getLastRowIdIfExceedsByHeight = function (dataLr, rowsArr) {
    // дублировать слой с данными
    var dataLrDuplicate = dataLr.duplicate(),
        textDocument = dataLrDuplicate.sourceText.value;

    textDocument.boxTextSize = [textDocument.boxTextSize[0], textDocument.boxTextSize[1] * 2]; // высота box'a в два раза > от высоты слоя с данными
    textDocument.text = ""; // очистить текст дублированного слоя
    dataLrDuplicate.sourceText.setValue(textDocument);

    for (var i = 0; i < rowsArr.length; i++) {
        var row = rowsArr[i];

        // если i-ая строка может превысеть высоту слоя с данными, то вернуть индекс текущей строки
        if (this._willExceedAfterPut('h', dataLr, dataLrDuplicate, row)) {
            this._unsetLayers(dataLrDuplicate);
            return i;
        }

        // извлечь i-ую строку из rowsArr в дубликат
        var newStr = (dataLrDuplicate.sourceText.value.text).concat(row);
        dataLrDuplicate.sourceText.setValue(newStr);
    }

    this._unsetLayers(dataLrDuplicate);
    return undefined;
}

AreaValidator.prototype._extractExceededRow = function (dataLr, rows, lastBoxRowId) {
    var fullStr = dataLr.sourceText.value.text,
        visibleSub = '';

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
// v.validate(dataLayers);
// v.validate(dataLayers).passes();

// v.validate(dataLayers).getErrros();