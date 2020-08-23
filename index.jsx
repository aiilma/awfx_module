#include 'AreaValidator.jsx';
#include 'AWTextLayerHelper.jsx';

// PREPARE PROJECT
var p = app.project.activeItem, // текущая композиция (main при тестах)
    lrs = p.layers, dataLr, v, helper;

try {
    helper = new AWTextLayerHelper(lrs);
    v = new AreaValidator(helper);

    dataLr = helper.getFirstByName('data');
    var res = v.validate(dataLr);

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