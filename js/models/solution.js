App.Models.Solution = Backbone.Model.extend({
	defaults: {
		id: '',
		solution: []
	},
	
	validate: function ( attrs ) {
		"use strict";
		if( !attrs.id || !attrs.solution ){
			return 'You must enter a solution for this blank input';
		}
	}

});