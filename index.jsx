// function useHandler() {
// }
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
function initLayersCreator(lrGetterCb, lrCreatorCb) {
    return function (dataLrName, mockLrName) {
        var dataLr, mockLr, res = {};

        if (!(dataLr = lrGetterCb(dataLrName)))
            throw new Error("Such a layer doesn't exist");

        // test
        dataLr.sourceText
            // .setValue("");
            // .setValue("abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaawwwwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiihhhoeoeoaeaoeaoaaaaaaaaemm,aoccmjw,aw,wuwiwiiiiicca");
            .setValue("abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaa");

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
// ^ stable


// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers,
    bunchLrs, dataLr, mockLr;

// HOCS CONFIG
var getLayer = getLayerCreator(lrs),
    createServeLayer = serveLayerCreator(lrs),
    initLayers = initLayersCreator(getLayer, createServeLayer),
    syncLrAttributes = syncLrAttributesCreator(createServeLayer),
    useAsAreaExceeder = areaExceedCreator(getContentDimensions, putChar),
    splitSub = splitSubCreator(useAsAreaExceeder),
    getSubs = getSubsCreator(splitSub);

try {
    // INIT
    bunchLrs = initLayers('data', 'mock');
    dataLr = bunchLrs['data'];
    mockLr = syncLrAttributes(dataLr, bunchLrs['mock']);

    // MAIN LOGIC
    // обращаться по индексу массива к строке, которая будет содержать последний видимый символ в слое реальных данных
    var subs = getSubs(dataLr, mockLr).join('\n');
    alert(subs);
    mockLr.sourceText.setValue(subs);

    alert('width' + '\n\n' + 'data: ' + '\t' + getContentDimensions(dataLr)['w'] + '\n' + 'mock: ' + '\t' + getContentDimensions(dataLr)['w']);
    alert('height' + '\n\n' + 'data: ' + '\t' + getContentDimensions(dataLr)['h'] + '\n' + 'mock: ' + '\t' + getContentDimensions(mockLr)['h']);
    // alert(subs.join('\n'));
} catch (e) {
    alert(e.message)
}