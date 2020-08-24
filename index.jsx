#include 'AreaValidator.jsx';
#include 'AWTextLayerHelper.jsx';

// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers,
    dataLrs, v, helper;


var data = [
    {
        "layerName": "username",
        // "value": ""
        // "value": "abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaawwwwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiihhhoeoeoaeaoeaoaaaaaaaaemm,aoccmjw,aw,wuwiwiiiiicca"
        "value": "abmeoa,d.guccuiigiigaceiiiiiiiiiiiiiiaawwwwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiihh"
    },
    {
        "layerName": "twitch",
        "value": "twitch.tv/ahmed",
    }
];

try {
    helper = new AWTextLayerHelper(lrs);
    v = new AreaValidator(helper);

    dataLrs = helper.setValuesIntoLayers(data).getLayers(data);
    var res = v.validate(dataLrs);
    alert(res.passes());

} catch (e) {
    var name = e.name;
    var msg = e.message;

    switch (name) {
        case 'AreaValidationError':
            alert(msg);
            // var id = e.id;
            //
            // switch (id) {
            //     case 100:
            //         break;
            //     default:
            //         break;
            // }

            break;
        default:
            alert(msg);
            break;
    }
}