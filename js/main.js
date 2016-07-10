
window.App = {
	Models     : {},
	Views      : {},
	Collections: {},
	Router     : {}
};

/*window.template = function (id) {
	return _.template( $('#' + id).html() );
};
App.Router = Backbone.Router.extend({
	routes: {
		'' : 'index'
	},

	index: function () {
		console.log('This is teacher template');
	}
})*/

window.vent = _.extend({}, Backbone.Events);

window.template = function (id) {
	return _.template( $('#' + id).html() );
}