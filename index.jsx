try {
    layer = app.project.item(1).layer("my1")

    if (!layer) throw new Error("Such a layer doesn't exist")

    alert(layer.sourceText.value.text)
} catch (e) {
    alert(e.message)
}