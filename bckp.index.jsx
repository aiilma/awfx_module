function anySpaceForNextCharCreator(getWidthCb) {
    return function (mockLr, dataLr, nextChar) {
        var prevStr = mockLr.sourceText.value.text,
            result;

        mockLr.sourceText.setValue(prevStr.concat(nextChar))
        result = getWidthCb(mockLr)['w'] <= getWidthCb(dataLr)['w']
        mockLr.sourceText.setValue(prevStr)

        return result
    }
}
// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers,
    dataLr, mockLr;

// PREPARE FUNCTIONS
var
    anySpaceForNextChar = anySpaceForNextCharCreator(getContentDimensions);

try {

    // function anySpaceForNextRow(mockLayer, authorLayer, nextRow, getHeightCb) {
    //     var prevStr = mockLayer.sourceText.value.text,
    //         result;
    //
    //     mockLayer.sourceText.setValue(prevStr.concat('\n' + nextRow))
    //     result = getHeightCb(mockLayer)['height'] < getHeightCb(authorLayer)['height']
    //     mockLayer.sourceText.setValue(prevStr)
    //
    //     return result;
    // }
    //
    // mock.sourceText.setValue(mockSubs[0])
    //
    //
    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])
    // mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[1]))
    //
    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])
    // mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[2]))
    //
    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])
    // mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[3]))
    //
    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])


    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])
    // mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[1]))
    //
    // alert(getContentDimensions(mock)['height'] + " / " + getContentDimensions(authorLayer)['height'])
    // mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[2]))


    // var authorLayerHeight = getContentDimensions(authorLayer)['height']
    // if (anySpaceForNextRow(mock, authorLayer, mockSubs[1], getContentDimensions)) {
    //     mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[1]))
    //     alert(getContentDimensions(mock)['height'] + "\n" + authorLayerHeight)
    // }
    // if (anySpaceForNextRow(mock, authorLayer, mockSubs[2], getContentDimensions)) {
    //     mock.sourceText.setValue(mock.sourceText.value.text.concat('\n' + mockSubs[2]))
    //     alert(getContentDimensions(mock)['height'] + "\n" + authorLayerHeight)
    // }


    // mock.sourceText.setValue(mockSubs.join('\n'))
    // var rowNum = 0;
    // getContentDimensions(mock)['height']
    // getContentDimensions(authorLayer)['height']

} catch
    (e) {
    alert(e.message)
}

// app.exitAfterLaunchAndEval = true
// function err(errString) {
//     alert(errString);
// }
// app.onError = err;

// x = tlayer.property("Source Text").value.boxTextSize[0]
// y = tlayer.property("Source Text").value.boxTextSize[1]
// alert(x + " " + y)

// var myTextDocument = new TextDocument("Happy Cake");
// tlayer.property("Source Text").setValue(myTextDocument)

// // exception
// app.exitCode = 2
// app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
// app.quit();