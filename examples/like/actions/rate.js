App.actions.output = {
    tryToSave: function (e, el, prevArgs, steps) {
        $('.output').text('Try To Save');
    },

    clear: function (e, el, prevArgs, steps) {
        $('.output').text('');
    },

    saved: function (e, el, prevArgs, steps) {
        $('.output').text('Saved');
    },

    error: function (e, el, prevArgs, steps) {
        $('.output').text('Error');
    }
}

App.actions.rate = {
    getResponseFromServer: function (e, el, prevArgs, steps) {
        return $.getJSON('/response.json');
    },
    getErrorFromServer: function (e, el, prevArgs, steps) {
        var dfd = $.Deferred();

        setTimeout(function () {
            console.log('rate.error', prevArgs, steps);
            dfd.reject(prevArgs);
        }, 1000);

        return dfd.promise();
    },
    actionEmulationOnClient: function (e, el, prevArgs, steps) {
        if (prevArgs.ready) return false;

        $(el).find('em').text(prevArgs.rate + 1);
        console.log('rate.before', prevArgs, steps);
    },
    rollback: function (e, el, prevArgs, steps) {
        $(el).find('em').text(prevArgs.rate);
        console.log('rate.rollback', prevArgs, steps);
    }
};