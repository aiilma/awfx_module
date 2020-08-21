#include 'AreaValidator.jsx';

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
function syncLr(fromLr, toLr) {
    // perhaps thot toLr belongs to inline boxText
    const PROPS = [
        'text', 'font', 'fontSize', 'applyFill', 'applyStroke', 'fillColor',
        'strokeColor', 'strokeOverFill', 'strokeWidth', 'justification', 'tracking',
    ];

    toLr.sourceText.value.resetCharStyle();
    for (var propId = 0, propName = PROPS[propId]; propId < PROPS.length; propId++) {
        toLr.sourceText.value[propName] = fromLr.sourceText.value[propName];
    }
    toLr.sourceText.setValue(fromLr.sourceText.value);
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
} // dev helper
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

// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers, dataLr, v,
    getLayer = getLayerCreator(lrs),
    createLayer = serveLayerCreator(lrs);

try {
    v = new AreaValidator(createLayer, syncLr, getContentDimensions, putChar);

    dataLr = getLayer('data');
    var res = v.validate(dataLr);
    alert(res.passes());
} catch (e) {
    alert(e);
}