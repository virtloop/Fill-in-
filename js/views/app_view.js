/** 
	Global App View
**/

App.Views.App = Backbone.View.extend({
	el: '#content',
	
	events: {
		
		'click #preview': 'preview_mode' 
	},
	
	title_container: $('#page-title'),

	MODE: {
		init_mode: true,

		teacher: {
			'selector': $('#teacher_view'),
			'title': 'Teacher View',
			'color_class' : 'teacher-color',
			'buttons' : [
				{name:'New Input', id:'new', class: 'btn btn-primary'},
				{name:'Delete Input', id:'remove', class: 'btn btn-danger'}
			],
		},

		student: {
			'selector': $('#student_view'),
			'title': 'Student View',
			'color_class' : 'student-color',
			'buttons' : [
				{name:'Solution', id:'view_solution', class: 'btn btn-primary disabled student-color', disabled:'disabled'},
				{name:'Check', id:'check', class: 'btn btn-primary student-color'},
				{name:'Retry', id:'retry', class: 'btn btn-primary hide student-color'}
			],
		}
	},

	attempt: 0,

	initialize: function() {
		"use strict";
		var teacherView = new App.Views.Teacher({collection: App.solutions, model_settings: App.model_default});
		this.title_container.html(teacherView.title).addClass(this.MODE.teacher.color_class);
		
		teacherView.render(this.MODE.teacher.buttons);
	},
	
	preview_mode: function (e) {
		"use strict";
		e.preventDefault();
		e.stopPropagation();
		this.MODE.init_mode = !this.MODE.init_mode;

		if( !this.MODE.init_mode ) {
			e.preventDefault();
			$('.button_group').html('');
			var studentView = new App.Views.Student({collection: App.solutions, model_settings: App.model_default});
			studentView.render(this.MODE.student.buttons);
			this.MODE.teacher.selector.html('');

			//changing page title
			this.title_container.html(studentView.title).removeClass(this.MODE.teacher.color_class).addClass(this.MODE.student.color_class);
			$('#preview').addClass('hideShowPassword-toggle-hide').attr('title', 'Edit Mode');

		} else {
			$('.button_group').html('');
			var teacherView = new App.Views.Teacher({collection: App.solutions, model_settings: App.model_default});
			this.MODE.student.selector.html('');
			teacherView.render(this.MODE.teacher.buttons);
			
			//changing page title
			this.title_container.html(teacherView.title).removeClass(this.MODE.student.color_class).addClass(this.MODE.teacher.color_class);
			$('#preview').removeClass('hideShowPassword-toggle-hide').attr('title', 'Preview Mode');
		}
	}
	
});


/** 
	Teacher View
**/
App.Views.Teacher = Backbone.View.extend({
	el: '#content',
	title: 'teacher view',
	container: $('#teacher_view'),
	countClick : 0,
	errors: [],
	blanksArray: [],
	focused: null,
	events: {
		'focusin .blank': 'focusedBlank',
		'click .footer_controls > .button_group > #new' : 'addBlank',
		'click #remove' : 'removeBlank',
		'focusout #teacher_view .blank': 'addSolution',
		'focusout #sentence': 'saveSentence',
		'focusout #instr_teacher': 'saveInstr',
		'change #attempts': 'saveNoAttempts'
	},

	initialize: function () {

	},
	
	render: function (btnObj) {
		"use strict";
		this.container.empty();
		this.writeInstrInput(this.container);
		this.writeTextArea(this.container);
		this.writeButtons(btnObj);
		this.writeSelectAttempts( $('.footer_controls'), App.model_default.get('max_attempts') );
		this.container.append('<div class="errors"></div>');
	},

	writeErrorsOnScreen: function (container, error){
		"use strict";
		var htmlError;
		if(error.length === 0){
			return;
		}

		
		htmlError = '<p>'+error+'</p>';


		container.html(htmlError);
	},

	writeSelectAttempts: function ( container, no_attempts ) {
		"use strict";
		var i, selectContainer;
		$(container).append('<select id="attempts" class="custom-select"></select>');
		selectContainer = $('#attempts');
		
		for( i = 0; i <= no_attempts; i++){
			if( i === 0 ) {
				selectContainer.append('<option value="'+ i +'">Attempts</option>');
			}else{
				
				selectContainer.append('<option value="'+ i +'">'+i+'</option>');
				if(App.model_default.get('choosen_attempt') === i ){
					$('option').last().attr('selected','selected');
				}
			}
		}
	},

	writeButtons: function (btnsObj) {
		"use strict";
		$('.footer_controls').html('<button id="preview" title="Preview Mode" class="btn btn-default"></button><div class="button_group col-md-4"></div>');
		$.each(btnsObj, function (){
			$('.button_group').append('<buttons class="'+ this.class +'" id="'+this.id+'">'+this.name+'</buttons>');
		});
	},

	writeInstrInput: function (container) {
		"use strict";
		
		var inputAttr = [
							{ key: 'type', value: 'text' },
							{ key: 'class', value: 'form-control' },
							{ key: 'id', value: 'instr_teacher' },
							{ key: 'placeholder', value: App.model_default.get('instr_text') == '' ? 'Type here the work instruction' : '' },
							{ key: 'autocomplete', value: 'off' },
							{ key: 'value', value: App.model_default.get('instr_text') }
						]

		$(container).append('<div class="instr form-group"><input/></div>')

		$.each( inputAttr, function(){
			
			$('.instr input').attr(this.key, this.value);
		} );

	}, 

	writeTextArea: function (container) {
		"use strict";
		var textareaAttr = [
								{ key: 'class', value: 'form-control' },
								{ key: 'data-placeholder', value: 'Start typing here the text. Add blanks using New Input button bellow' },
								{ key: 'id', value: 'sentence' },
								{ key: 'contenteditable', value: 'true' }
						   ];
		var text_placeholder;
		var collection = this.collection.toJSON();
		$(container).append('<div class="sentence form-group"><div></div></div>');

		$.each(textareaAttr, function(){
			$('.sentence div').attr(this.key, this.value);
			
			if(this.key === 'data-placeholder'){
				if(App.model_default.get('sentence_text') !== ''){
					$('.sentence div').html(App.model_default.get('sentence_text'));	
					$.each(App.model_default.get('blanksIDs'), function(blank){
						if( collection[blank].value.length > 1 ){
							$('#' + App.model_default.get('blanksIDs')[blank]).val(collection[blank].value.join('|'));	
						}else{
							$('#' + App.model_default.get('blanksIDs')[blank]).val(collection[blank].value);	
						}
						
					});
				}else{
					$('.sentence div').text(this.value);
				}
			}
		});

		
	},
	
	saveNoAttempts: function (e) {
		"use strict";
		
		App.model_default.set( 'choosen_attempt', parseInt( $(e.currentTarget).val() ) );

	},

	saveInstr: function (e) {
		"use strict";
		App.model_default.set( 'instr_text', $(e.currentTarget).val() );
	},

	saveSentence: function (e) {
		"use strict";
		App.model_default.set( 'sentence_text', $(e.currentTarget).html() );

	},

	pasteHtmlAtCaret: function(html, el) {
		"use strict";
	    var sel = window.getSelection(), range;
	   	if( sel ){
			if ( sel.getRangeAt && sel.rangeCount ) {
				range = sel.getRangeAt(0);
            	range.deleteContents();

            	var el = document.createElement("span");
            	el.innerHTML = html;
            	var frag = document.createDocumentFragment(), node, lastNode;
	            while ( (node = el.firstChild) ) {
	                lastNode = frag.appendChild(node);
	            }
	            var firstNode = frag.firstChild;
	            range.insertNode(frag);
	            
	            // Preserve the selection
	            if (lastNode) {
	                range = range.cloneRange();
	                range.setStartAfter(lastNode);
	                range.setStartBefore(firstNode);
	                sel.removeAllRanges();
	                sel.addRange(range);
	            }
			}
		}

	},

	addBlank: function (e) {
		"use strict";
		e.preventDefault();
		e.stopPropagation();

		App.model_default.set('number_of_blanks', App.model_default.get('number_of_blanks')+1 );
		var count =  App.model_default.get('number_of_blanks');
		
		this.blanksArray.push('blank' + count);
		App.model_default.set({'blanksIDs':this.blanksArray});


		var html = '<input id="blank'+ count + '" class="blank" data-id="'+count+'">';
		var el = document.getElementById("sentence");
    	this. pasteHtmlAtCaret(html, el);

		$('#blank' + count).focus();
		
	},

	focusedBlank: function (e) {
		this.focused = e.currentTarget;
	},

	removeBlank: function () {
		"use strict";
		this.focused.remove();
		this.collection.remove( $(this.focused).attr('data-id') );
	},

	solutionMgr: function (array) {
		"use strict";
		var fields = array.replace( /\|\s?\/\>/g, "|" ).split( '|' );

		return fields;
	},

	addSolution: function (e) {
		"use strict";
		var solutionId = $( e.currentTarget ).attr( 'data-id' );
		var blankId = $( e.currentTarget );

		var solutionArray = this.solutionMgr( $.trim( blankId.val() ) );
		
		if( blankId.val() !== '' ) {

			$.each(this.collection.toJSON(), function(index){
				if(this.id === solutionId){
					this.value = solutionArray;
					
					return;
				}
			});
			this.collection.add( {
				id: solutionId,
				value: solutionArray
			} );
			
			blankId.removeClass('error');
			$('#preview').removeClass('disabled').removeProp('disabled');
			this.errors = 0;
			$('.errors').empty();
		}else{
			blankId.addClass('error');
			$('#preview').addClass('disabled').attr('disabled','disabled');
			this.errors = 'You must add a solution to highlighted blank';
			
			this.writeErrorsOnScreen($('.errors'), this.errors);
		}
	}
});


/** 
	Student View
**/

App.Views.Student = Backbone.View.extend({
	el: '#content',
	title: 'student view',
	template: template('feedback_modal'),
	HTML: {
		instruction: {
			tag: 'p',
			class: 'instr'
		},
		sentence: {
			tag: 'p',
			class: 'sentence'
		}
	},
	check_btn: $('#check'),
	view_solution_btn: $('#view_solution'),
	retry_btn: $('#retry'),
	container: $('#student_view'),
	attempt: 0,
	currentAttempt: 0,
	model_settings: {},
	events: {
		'click #check': 'check_response',
		'click #retry': 'retry_answer',
		'click #view_solution': 'showSolution'
	},

	remaining_attempts: function (){
		"use strict";
		
		return parseInt( this.model_settings.choosen_attempt - this.currentAttempt );
	},

	initialize: function (){
		this.model_settings = App.model_default.toJSON();
	},

	render: function(btnObj) {
		'use strict';

		this.writeInstr(this.container);

		this.writeStudentModeSentence(this.container);

		this.writeStudentButtons(btnObj);
	},

	writeInstr: function (container){
		"use strict";
		var htmlTag = '', instrOpts;
		if(this.model_settings.instr_text === ''){
			return;
		}
		instrOpts = this.HTML.instruction;

		htmlTag += '<' + instrOpts.tag + ' class="'+instrOpts.class+'">' + this.model_settings.instr_text + '</' + instrOpts.tag + '>';

		container.append(htmlTag);
	},


	writeStudentModeSentence: function (container){
		"use strict";
		var htmlTag = '', sentenceOpts;
		
		sentenceOpts = this.HTML.sentence;

		htmlTag += '<' + sentenceOpts.tag + ' class="'+sentenceOpts.class+'">' + this.model_settings.sentence_text + '</' + sentenceOpts.tag + '>';

		container.append(htmlTag);
	},

	writeStudentButtons: function (btnsObj) {
		"use strict";
		$('.footer_controls').html('<button id="preview" title="Preview Mode" class="btn btn-default"></button><div class="button_group col-md-4"></div>');

		$.each(btnsObj, function (){
			$('.button_group').append('<button class="'+ this.class +'" id="'+this.id+'">'+this.name+'</button>');
		});
	},

	check_response: function () {
		"use strict";
		var i, j, solObj, answer, eval_sentence = true, score, solutions, blank,blanksArray;
		solObj = App.solutions.toJSON();

		$.each(solObj, function(index){

			blank =  $('#student_view #blank' + this.id);
			solutions = this.value;
			answer = $.trim( blank.val() );
			
			$.each(solutions, function (key){
				//debugger;
				if(this == answer){
					//correct answer
					blank.addClass('correct').removeClass('wrong');
					return false;
				}else{
					//wrong answer
					blank.removeClass('correct').addClass('wrong');
					
				}
			});
		});
		
		if(this.remaining_attempts() < 1 || this.model_settings.choosen_attempt === 0 ){
			this.view_solution_btn.removeClass('disabled');
			$('#check').addClass('hide');

			if(eval_sentence){
				score =  10 - ( ( 10 * this.currentAttempt ) / this.model_settings.choosen_attempt ) ;

				this.openPopup('Correct', score);
				$('#check').addClass('hide');
				$('#view_solution').addClass('hide');
			}
			
		}else{
			$('#student_view .blank').each(function(){
				if( $(this).hasClass('wrong') ){
					eval_sentence = false;
				}
			});
		
			if(!eval_sentence){
				$('#check').addClass('hide');
				$('#retry').removeClass('hide');
				
			}else{
				score =  10 - ( ( 10 * this.currentAttempt ) / this.model_settings.choosen_attempt ) ;

				this.openPopup('Correct', score);
				$(this.check_btn).addClass('hide');
				$('#check').addClass('hide');
				$('#view_solution').addClass('hide');
			}
			this.currentAttempt++;
		}
	},

	retry_answer: function () {
		this.check_btn.removeClass('hide');
		this.retry_btn.addClass('hide');
		$('#student_view .blank').val('');

		$('#student_view .blank').each(function () {
			$(this).removeClass('correct').removeClass('wrong');
		});
	},

	openPopup: function ( feedbackTitle, score ) {
		"use strict";

		$('#content').append( this.template( score ) );

		$('#myModal .modal-title').html(feedbackTitle);
		$('#myModal .modal-body p').html("Your score is: " + score);
		$('#myModal').modal('show');

	},

	showSolution: function (){
		"use strict";
		var i, j, solObj, answer;				

		App.solutions.each(function(){
				
			solObj = App.solutions.toJSON();
			
			for(i = 0; i < solObj.length; i++ ) {
				answer = $('#student_view #blank' + solObj[i].id).val();
				for( j = 0; j < solObj[i].value.length; j++ ) {
					
					$('#student_view #blank' + solObj[i].id).val(solObj[i].value);
				}
			}
		});
	}	
});