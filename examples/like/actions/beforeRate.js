Glomper.actions.beforeRate = function (e, el, prevArgs) {
	$(el).find('em').text(Number($(el).find('em').text()) + 1);
};