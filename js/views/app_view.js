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
				{name:'Solution', id:'view_solution', class: 'btn btn-primary disabled'},
				{name:'Check', id:'check', class: 'btn btn-primary'},
				{name:'Retry', id:'retry', class: 'btn btn-primary hide'}
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
		
		this.writeInstrInput(this.container);
		this.writeTextArea(this.container);
		this.writeButtons(btnObj);
		this.writeSelectAttempts( $('.footer_controls'), App.model_default.get('max_attempts') );
		
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
		$(container).append('<div class="sentence form-group"><div></div></div>');

		$.each(textareaAttr, function(){
			$('.sentence div').attr(this.key, this.value);
			
			if(this.key === 'data-placeholder'){
				if(App.model_default.get('sentence_text') !== ''){
					$('.sentence div').html(App.model_default.get('sentence_text'));	
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
		this.collection.remove($(this.focused).attr('data-id'));
	},

	solutionMgr: function (array) {
		"use strict";
		var fields = array.replace( /\|\s?\/\>/g, "|" ).split( '|' );

		return fields;
	},

	addSolution: function (e) {
		"use strict";
		e.preventDefault();
		var solutionId = $( e.currentTarget ).attr( 'data-id' );
		var blankId = $( e.currentTarget );

		var solutionArray = this.solutionMgr( blankId.val() );
		
		if( blankId.val() !== '' ) {
			this.collection.add( {
				id: solutionId,
				value: solutionArray
			} );
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
	container: $('#student_view'),
	attempt: 0,
	currentAttempt: 0,
	model_settings: {},
	events: {
		'click #check': 'check_response',
		//'change #attempts': 'get_attempts_value',
		'click #retry': 'retry_answer',
		'click #view_solution': 'showSolution'
	},

	get_attempts_value: function (e){
		"use strict";
		this.attempt = this.currentAttempt = $(e.currentTarget).val();
	},

	initialize: function (){
		this.model_settings = App.model_default.toJSON();
		console.log(this.model_settings);
	},

	render: function(btnObj) {
		'use strict';
		//console.log(this.model_settings.toJSON());
		/*var sentence = '';
		if( $('#instr_teacher').val() !== '' ) {
			$('#student_view').append('<p class="instr"><strong>'+ $('#instr_teacher').val() +'</strong></p>');
		}

		if($('#sentence').text() !== '' && $('#instr_teacher').val() !== ''){
			$('.instr').after('<p class="sentence">'+ $('#sentence').html() +'</p>');
		}else if($('#sentence').text() !== ''){
			$('#student_view').append('<p class="sentence">'+ $('#sentence').html() +'</p>');	
		}else{
			$('#student_view').append('There is no text to show');
		}*/

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
		if(this.model_settings.sentence_text === ''){
			return;
		}
		sentenceOpts = this.HTML.sentence;

		htmlTag += '<' + sentenceOpts.tag + ' class="'+sentenceOpts.class+'">' + this.model_settings.sentence_text + '</' + sentenceOpts.tag + '>';

		container.append(htmlTag);
	},

	writeStudentButtons: function (btnsObj) {
		"use strict";
		$('.footer_controls').html('<button id="preview" title="Preview Mode" class="btn btn-default"></button><div class="button_group col-md-4"></div>');

		$.each(btnsObj, function (){
			$('.button_group').append('<buttons class="'+ this.class +'" id="'+this.id+'">'+this.name+'</buttons>');
		});
	},

	check_response: function () {
		"use strict";
		var i, j, solObj, answer, eval_sentence = true, score;
		
		App.solutions.each(function(){
			
			solObj = App.solutions.toJSON();
			
			for(i = 0; i < solObj.length; i++ ) {

				answer = $('#student_view #blank' + solObj[i].id).val();
				if(solObj[i].value.length > 1){
					for( j = 0; j < solObj[i].value.length; j++ ) {
						if(solObj[i].value[j] == answer){
							$('#student_view #blank' + solObj[i].id).addClass('correctAnswer');
							break;
						}else{
							$('#student_view #blank' + solObj[i].id).addClass('wrongAnswer');
						}
					}
				}else{
					if(solObj[i].value == answer){
						$('#student_view #blank' + solObj[i].id).addClass('correctAnswer');	
					}else{
						$('#student_view #blank' + solObj[i].id).addClass('wrongAnswer');
					}	
				}	
			}
		});

		if(this.currentAttempt > 1){
			$('#student_view .blank').each(function(){
				if( $(this).hasClass('wrongAnswer') ){
					eval_sentence = false;
				}
			});

			if(!eval_sentence){
				$('#check').addClass('hide');
				$('#retry').removeClass('hide');
				this.currentAttempt--;
			}else{
				score = 10 - ( ( this.attempt - this.currentAttempt )/this.attempt );

				this.openPopup('Correct', score);
				('#check').addClass('hide');
			}
		}else{
			$('#view_solution').removeClass('disabled');
			$('#check').addClass('hide');
		}
	},

	retry_answer: function () {
		$('#check').removeClass('hide');
		$('#retry').addClass('hide');
		$('#student_view .blank').val('');

		$('#student_view .blank').each(function () {
			$(this).removeClass('correctAnswer').removeClass('wrongAnswer');
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