// ========================================DEV HELPERS==================================================
function testDims(data, mock, dim) {
    dim = (dim === 'h' || dim === 'w') ? dim : 'all';

    var dataW = getContentDimensions(data)['w'];
    var mockW = getContentDimensions(mock)['w'];
    var dataH = getContentDimensions(data)['h'];
    var mockH = getContentDimensions(mock)['h'];

    if (dim === 'w') {
        alert('\t' +'width' + '\n' + 'data: ' + dataW + '\n' + 'mock: ' + mockW + '\n' + 'equals: ' + eval(dataW === mockW));
    } else if (dim === 'h') {
        alert('\t' +'height' + '\n' + 'data: ' + dataH + '\n' + 'mock: ' + mockH + '\n' + 'equals: ' + eval(dataH === mockH));
    } else {
        alert('\t' +'width' + '\n' + 'data: ' + dataW + '\n' + 'mock: ' + mockW + '\n' + 'equals: ' + eval(dataW === mockW));
        alert('\t' +'height' + '\n' + 'data: ' + dataH + '\n' + 'mock: ' + mockH + '\n' + 'equals: ' + eval(dataH === mockH));
    }
}
// ========================================DEV HELPERS==================================================
function removeLayers() {
    for (var layerId = 0; layerId < arguments.length; layerId++) {
        if (!arguments[layerId] instanceof TextLayer) throw new Error(arguments[layerId].name + " must be an instance of TextLayer");
        arguments[layerId].remove();
    }
}
function getLayerCreator(layerCollection) {
    return function (name) {
        var layer;
        if (!(layer = layerCollection.byName(name))) return undefined;
        return layer;
    }
}
function serveLayerCreator(lrCollection) {
    return function (lrName, boxType) {
        var newLr;

        // generate new layer
        newLr = boxType ?
            lrCollection.addBoxText([100, 100]) : lrCollection.addText()

        newLr.sourceText.setValue("")
        newLr.name = lrName;

        return newLr;
    }
}
function initLayersCreator(lrGetterCb, lrCreatorCb, testStr) {
    testStr = (testStr !== undefined && typeof testStr === 'string') ? testStr : false;

    return function (dataLrName, mockLrName) {
        var dataLr, mockLr, res = {};

        if (!(dataLr = lrGetterCb(dataLrName)))
            throw new Error("Such a layer doesn't exist");

        if (testStr) {
            dataLr.sourceText.setValue(testStr);
        }

        if ((mockLr = lrGetterCb(mockLrName))) mockLr.remove();
        mockLr = lrCreatorCb(mockLrName, false);

        res[dataLrName] = dataLr;
        res[mockLrName] = mockLr;

        return res;
    }
}
function syncLrAttributesCreator(lrCreatorCb) {
    const PROPS = [
        'text', 'font', 'fontSize', 'applyFill', 'applyStroke', 'fillColor',
        'strokeColor', 'strokeOverFill', 'strokeWidth', 'justification', 'tracking',
    ];

    return function (fromLr, toLr) {
        var tmpLr = lrCreatorCb(toLr.name, toLr.sourceText.value.boxText);

        tmpLr.sourceText.value.resetCharStyle();
        for (var propId = 0, propName = PROPS[propId]; propId < PROPS.length; propId++) {
            tmpLr.sourceText.value[propName] = fromLr.sourceText.value[propName];
        }

        tmpLr.sourceText.setValue(fromLr.sourceText.value);
        toLr.remove();
        return tmpLr;
    }
}
function putChar(layer) {
    return function (ch) {
        var newText, oldText;
        oldText = layer.sourceText.value.text;
        newText = oldText.concat(ch);
        layer.sourceText.setValue(newText);
    }
}
function popChar(layer) {
    return function () {
        var newText, oldText;
        oldText = layer.sourceText.value.text;
        newText = oldText.substr(0, oldText.length - 1);
        layer.sourceText.setValue(newText);
    }
}
function areaExceedCreator(getContentDimensionsCb, putCharCb) {
    return function (areaLr) {
        var maxWidthArea = getContentDimensionsCb(areaLr)['w'];
        return function (mockLr, ch) {
            // alert(mockLr.sourceText.value.text);
            var oldText = mockLr.sourceText.value.text,
                result;

            putCharCb(mockLr)(ch);
            result = (getContentDimensionsCb(mockLr)['w'] > maxWidthArea);

            mockLr.sourceText.setValue(oldText); // revert old text
            return result;
        }
    }
}
function getContentDimensions(layer) {
    var contentDims,
        w, h,
        wScale, hScale,
        wPadding, hPadding,
        wDim, hDim;

    contentDims = layer.sourceRectAtTime(p.time, true);
    w = contentDims.width;
    h = contentDims.height;

    wScale = layer.transform.scale.value[0];
    hScale = layer.transform.scale.value[1];

    wPadding = (wScale - 100) * .01;
    hPadding = (hScale - 100) * .01;

    wDim = w + wPadding * w;
    hDim = h + hPadding * h;

    return {
        w: wDim,
        h: hDim,
    };
}
function splitSubCreator(useAsAreaExceederCb) {
    return function (dataLr, mockLr) {
        var willExceedAfterPutCb = useAsAreaExceederCb(dataLr);
        var oldText = mockLr.sourceText.value.text;
        var sub = '';
        mockLr.sourceText.setValue(sub);

        for (var i = 0; i < oldText.length; i++) {
            var ch = oldText[i];

            if (willExceedAfterPutCb(mockLr, ch)) break;

            sub = sub.concat(ch);
            mockLr.sourceText.setValue(sub);
        }

        mockLr.sourceText.setValue(oldText);
        return sub;
    }
}
function getSubsCreator(handleSubCb) {
    return function (dataLr, mockLr) {
        var oldText = mockLr.sourceText.value.text; // нужен ли mockText.. может, убрать, чтобы зависеть от основного (обрезая его по условию) и закидывать буковки в результирующую строку
        var subs = [];

        while (mockLr.sourceText.value.text.length) {
            // извлечь подстроку
            var newSub = handleSubCb(dataLr, mockLr);
            // закинуть её в массив подстрок
            subs.push(newSub);

            // обновить значение слоя до обрезанного с самого начала по длинне подстроки
            var updatedText = (mockLr.sourceText.value.text).slice(newSub.length);
            mockLr.sourceText.setValue(updatedText);
        }

        mockLr.sourceText.setValue(oldText);
        return subs;
    }
}
//---------
function willExceedHeightAfterPut(getContentDimensionsCb, putCharCb) {
    return function (areaLr) {
        var maxWidthArea = getContentDimensionsCb(areaLr)['h'];
        return function (dupLr, sub) {
            // alert(mockLr.sourceText.value.text);
            var oldText = dupLr.sourceText.value.text,
                result;

            putCharCb(dupLr)(sub);
            result = (getContentDimensionsCb(dupLr)['h'] > maxWidthArea);

            dupLr.sourceText.setValue(oldText); // revert old text
            return result;
        }
    }
}
function getLastSubIdIfExceedsByHeight(subsArr, dataLr) {
    // дублировать слой с данными
    var dataLrDuplicate = dataLr.duplicate();
    var textDocument = dataLrDuplicate.sourceText.value;
    textDocument.boxTextSize = [textDocument.boxTextSize[0], textDocument.boxTextSize[1] * 2]; // высота box'a в два раза > от высоты слоя с данными
    textDocument.text = ""; // очистить текст дублированного слоя
    dataLrDuplicate.sourceText.setValue(textDocument);

    for (var i = 0; i < subsArr.length; i++) {
        var s = subsArr[i];

        // если i-ая строка может превысеть высоту слоя с данными, то вернуть индекс текущей строки
        if (useAsHeightAreaExceeder(dataLr)(dataLrDuplicate, s)) {
            removeLayers(dataLrDuplicate);
            return i;
        }

        // положить i-ую строку из subs в дубликат
        var newStr = (dataLrDuplicate.sourceText.value.text).concat(s);
        dataLrDuplicate.sourceText.setValue(newStr);
    }

    removeLayers(dataLrDuplicate);
    return undefined;
}
function calcExceededSub(subsArr, lastBoxRowId, srcDataValue) {
    var exceededSub = '';

    if (lastBoxRowId !== undefined) {
        for(var idx = 0; idx < lastBoxRowId; idx++) {
            exceededSub = exceededSub.concat(subsArr[idx]);
        }

        exceededSub = srcDataValue.slice(exceededSub.length)
    }

    return exceededSub;
}


// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers,
    // testStr = '',
    // testStr = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    testStr = 'abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaawwwwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiihhhoeoeoaeaoeaoaaaaaaaaemm,aoccmjw,aw,wuwiwiiiiicca',
    // testStr = 'abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaawwwwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiihh',
    bunchLrs, dataLr, mockLr;

// HOCS CONFIG
var getLayer = getLayerCreator(lrs),
    createLayer = serveLayerCreator(lrs),
    initLayers = initLayersCreator(getLayer, createLayer, testStr),
    syncLrAttributes = syncLrAttributesCreator(createLayer),
    useAsAreaExceeder = areaExceedCreator(getContentDimensions, putChar),
    useAsHeightAreaExceeder = willExceedHeightAfterPut(getContentDimensions, putChar),
    splitSub = splitSubCreator(useAsAreaExceeder),
    getSubs = getSubsCreator(splitSub);

try {
    // INIT
    bunchLrs = initLayers('data', 'mock');
    dataLr = bunchLrs['data'];
    mockLr = syncLrAttributes(dataLr, bunchLrs['mock']);

    // MAIN LOGIC
    var subs = getSubs(dataLr, mockLr);
    var lastBoxRowId = getLastSubIdIfExceedsByHeight(subs, dataLr);
    var exceededSub = calcExceededSub(subs, lastBoxRowId, testStr);
    alert(exceededSub);

    removeLayers(mockLr);
} catch (e) {
    alert(e.message);
}