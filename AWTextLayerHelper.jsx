function AWTextLayerHelper(layerCollection) {
    this._layerCollection = layerCollection;
}

var AWTextLayerHelperPrototype = {};
AWTextLayerHelperPrototype.prototype = Object.prototype;
AWTextLayerHelper.prototype = AWTextLayerHelperPrototype;
AWTextLayerHelper.prototype.constructor = AWTextLayerHelper;

// perhaps thot toLr belongs to inline boxText
AWTextLayerHelper.prototype._BASE_ATTRS = [
    'text', 'font', 'fontSize', 'applyFill', 'applyStroke', 'fillColor',
    'strokeColor', 'strokeOverFill', 'strokeWidth', 'justification', 'tracking',
];

AWTextLayerHelper.prototype.create = function (name, boxType) {
    var newLr;

    // generate new layer
    newLr = boxType ?
        (this._layerCollection).addBoxText([100, 100]) : (this._layerCollection).addText();

    newLr.sourceText.setValue("");
    newLr.name = name;

    return newLr;
}
AWTextLayerHelper.prototype.getFirstByName = function (name) {
    var lr;

    if (!(lr = (this._layerCollection).byName(name))) return undefined;

    return lr;
}

AWTextLayerHelper.prototype.syncAttrs = function (fromLr, toLr) {
    toLr.sourceText.value.resetCharStyle();
    for (var propId = 0; propId < this._BASE_ATTRS.length; propId++) {
        var propName = this._BASE_ATTRS[propId];
        toLr.sourceText.value[propName] = fromLr.sourceText.value[propName];
    }
    toLr.sourceText.setValue(fromLr.sourceText.value);
}
AWTextLayerHelper.prototype.getContentDimensions = function (lr) {
    var contentDims,
        w, h,
        wScale, hScale,
        wPadding, hPadding,
        wDim, hDim;

    contentDims = lr.sourceRectAtTime(p.time, true);
    w = contentDims.width;
    h = contentDims.height;

    wScale = lr.transform.scale.value[0];
    hScale = lr.transform.scale.value[1];

    wPadding = (wScale - 100) * .01;
    hPadding = (hScale - 100) * .01;

    wDim = w + wPadding * w;
    hDim = h + hPadding * h;

    return {
        w: wDim,
        h: hDim,
    };
}
AWTextLayerHelper.prototype.putChar = function (lr) {
    return function (ch) {
        var newText, oldText;
        oldText = lr.sourceText.value.text;
        newText = oldText.concat(ch);
        lr.sourceText.setValue(newText);
    }
}

// API
// l = new AWTextLayerHelper(lrs);
// l.create(name, boxType)
// l.syncAttrs(fromLr, toLr);