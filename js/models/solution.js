App.Models.Solution = Backbone.Model.extend({
	defaults: {
		id: '',
		value: []
	}
});

App.Models.FIB = Backbone.Model.extend({
	defaults: {
		instr_text      : '',
		sentence_text   : '',
		max_attempts    : 5,
		choosen_attempt : 0,
		number_of_blanks: 0,
		blanksIDs       : []
	}
});


