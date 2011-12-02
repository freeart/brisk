App.actions.formGrabber = function (e, el, prevArgs) {
    var dfd = new $.Deferred,
        $form = $(el).closest('form');

    if ($form.length){
        dfd.resolve($(el).closest('form').serializeObject());
    }else{
        dfd.resolve({});
    }

    return dfd.promise();
};