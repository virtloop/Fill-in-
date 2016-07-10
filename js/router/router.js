App.Router = Backbone.Router.extend({
	routes: {
		'' : 'index'
	},

	index: function() {
		"use strict";

		console.log("This is index page");
	}
});