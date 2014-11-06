jQuery.noConflict();
(function($) {
	
	// show progressbar
	$('progress').show();
	
	// section height
	var bodyHeight = $(window).innerHeight();
	var sectionHeight = bodyHeight - $('header').innerHeight() - $('.bx-pager').innerHeight() - 100;
	$('head').append('<style>\
		#chat, #chat body { height: '+ bodyHeight +'px; }\
		#chat article { height: '+ bodyHeight +'px; }\
		#msg section { height: '+ sectionHeight +'px; }\
	</style>');
	
	/*
	 * メッセージ表示secitonの作成
	 * @param	i		number index
	 * @param	ch		string チャネル名
	 */
	function createMsg( i, chname, msgSlider ){
		
		// backlog id attr value is backlog
		if( chname == 'backlog' ){
			
			var i = 'backlog';
			var say = '';
		
		// other say input
		} else {
			var say = '<p class="say">\
				<input id="input_'+i+'" type="text" placeholder="Wow">\
				</p>';
		}
			
		var html = '\
		<section id="'+i+'" class="slide">\
			<h2>'+ chname +'</h2>\
			'+say+'\
			<ol class="chat">\
				<li><em>Join</em> '+chname+'</li>\
			</ol>\
		</section>';
		
		$('#msg').prepend(html);
		
		console.log( 'createMsg(): chname: ' + chname + ' //id: ' + i + ' // #' + i);
		console.log('---------------------------------------------------');
	}
	
	/**
	 * ターゲットに発言htmlをprependしちゃう
	 * @param	id			number ch配列id(number)
	 * @param	nick		string 名前
	 * @param	text		string 内容
	 * @param	command		string IRCコマンド
	 */
	function prependChat( id, nick, text, command ){
		
		// nick is undef
		if( nick == undefined ){ nick = 'Console'; }

		// noticeならクラス付ける
		if( command == 'NOTICE' ){
			var li_class = 'from notice';
			var label = '<em>&lt;'+ nick + '&gt;</em>';
		} else if ( command == 'PRIV' ){
			var li_class = 'from priv';
			var label = '<em>&lt;'+ nick + '&gt;</em>';
		} else if ( command == 'ME' ){
			var li_class = 'me';
			var label = '<em>&lt;'+ nick + '&gt;</em>';
		} else if ( command == 'NAMES' ){
			var li_class = 'names';
			var label = '';
		} else {
			var li_class = 'from';
			var label = '<em>&lt;'+ nick + '&gt;</em>';
		}
		console.log( 'prependChat(): id: ' + id + ' //nick: ' + nick + ' //text: ' + text + ' //command: '+ command );

		text = textLinker( text, true );

		var html ='\
		<li class="'+ li_class +'">\
			'+ label +'\
			'+ text +'\
		</li>';
		
		$( '#' + id + ' .chat').prepend(html);
		console.log('---------------------------------------------------');
	}
	
	
	/**
	 * backlogにhtmlをprependしちゃう
	 * @param	nick		string 名前とか
	 * @param	text		string 内容
	 * @param	command		string IRCコマンド
	 */
	function prependBacklog( nick, text, command ){

		// nick is undef
		if( nick == undefined ){ nick = 'Console'; }

		// noticeならクラス付ける
		if ( command == 'PRIV' ){
			var li_class = 'from priv';
		} else if ( command == 'ME' ){
			var li_class = 'me';
		} else {
			var li_class = 'from';
		}
		console.log( 'prependBacklog(): nick: ' + nick + ' //text: ' + text + ' //command: '+ command );
		
		text = textLinker( text, false );

		var html ='\
		<li class="'+ li_class +'">\
			<em>&lt;'+ nick + '&gt;</em>\
			' + text +'\
		</li>';
		
		$( '#backlog' + ' .chat').prepend(html);
		console.log('---------------------------------------------------');
	}
	

	window.addEventListener('DOMContentLoaded', function() {

		// get settings
		var nickname = storageGet( 'nickname' );
		var username = storageGet( 'username' );
		var name = storageGet( 'name' );
		var host = storageGet( 'host' );
		var port = storageGet( 'port' );
		window.onkeypress = keypress;
		
		var ch = storageGet( 'ch' );
		ch = ch.replace(/\r\n|\r/g, "\n").split('\n');
		if( typeof ch != 'object' ){
			ch = { 0: ch }
		}
		console.log(ch);
		
		// Header my nickname display
		$('header h1').append( name +' ('+nickname+')' );
			
		/**
		 * Client インスタンスを呼んじゃう
		 * @param	host		string hostname
		 * @param	nickname	string my nickcname
		 */
		var chat = new Client( host, nickname, {
			port: port,
			userName: username,
			realName: 'FoxkehChat on FirefoxOS',
			//stripColors: true,
			autoConnect: false, // require call client.connect()
			debug: true,
			//channels: [ch],
		});

		
		/**
		 * bxSlider initialize
		 */
		var msgSlider = $('#msg').bxSlider({
			slideSelector: 'section.slide',
			infiniteLoop: true,
			controls: false,
			swipeThreshold: 100
			//adaptiveHeight: true
		});
			
		
		/**
		 * 今日もがんばって接続するぞい！
		 * @param	5	number is try reconnection count
		 */
		chat.connect( 5, function() {
			
			// channels each
			$.each( ch, function( i, chname ){
				
				// Self JOIN
				chat.join( chname, function() {
					
					console.log( 'JOIN: i: '+i+' //ch: '+chname );
										
					// CH section create
					createMsg( i, chname );
					msgSlider.reloadSlider();
					
					$('progress').fadeOut('slow'); // progress
				});
			
			});
		
			createMsg( ch.leigth++ , 'backlog' );
			msgSlider.reloadSlider();
					
		});
				
		
		/**
		 * 発言input欄で何らかのキー入力が行われた
		 * @param	e	object イベント
		 */
		function keypress(e) {
			// enter?
			if( e.which === 13 && e.target.value != '' ){
				// get id attr value
				var say_id = $('#'+e.target.id).parent().parent().attr('id');
				// get input value
				var say_val = e.target.value;
				
				say_val_encode = textEncode(say_val,'utf-8');
				
				//console.log( e );
				console.log( "say_id: "+ say_id + " // say_val: "+ say_val );
				console.log( "ch[say_id]: "+ ch[say_id] + " // ch: "+ch);
				
				chat.say( ch[say_id], say_val_encode );
				
				prependChat( say_id, nickname, say_val, 'ME' );
				
				$('#input_'+say_id).val('');
			}
		}
				

		/**
		 * Message イベント
		 * @param	nick	string nickname
		 * @param	to		string channel name
		 * @param	text	string message body
		 * @param	message	object なんかいろいろ
		 */
		chat.addListener('message', function (nick, to, text, message) {
			console.log('MESSAGE: ' + nick + ' => ' + to + ' // ' + text);
			console.log(message);
			
			var command = 'MESSAGE';
			
			// to channel message or private message
			if( to == nickname ){
				prependBacklog( nickname, text, 'ME' );
			} else {
				// search channel id in array
				var to_id = $.inArray( to, ch );
				console.log( "to_id: " + to_id );
			}
			
			// decode
			text = textDecode( text );
			
			prependChat( to_id, nick, text, command );
		});
		

		/**
		 * Notice イベント
		 * @param	nick	string nickname
		 * @param	to		string channel name
		 * @param	text	string message body
		 * @param	message	object なんかいろいろ
		 */
		chat.addListener('notice', function (nick, to, text, message) {
			console.log('NOTICE: '+ nick + ' => ' + to + ' // ' + text);
			console.log(message);
			
			var command = 'NOTICE';

			// decode
			text = textDecode( text );
			
			// non nick == system notice
			if( nick == null ){
			
				prependBacklog( 'Console', text, message.command );
			
			} else {
				// search channel id in array
				var to_id = $.inArray( to, ch );
				console.log( "to_id: " + to_id );
				
				prependChat( to_id, nick, text, command );
			}
		});

		
		/**
		 * Priv Message イベント
		 * @param	nick	string nickname
		 * @param	text	string message body
		 * @param	message	object なんかいろいろ
		 */
		chat.addListener('pm', function (nick, text, message) {
			console.log('PM: ' + nick + ' => ME // ' + text );
			console.log(message);
			
			var command = 'PM';
			
			text = textDecode( text );
			
			prependBacklog( nick, text, command );
		});


		/**
		 * Part イベント
		 * @param	chname		string	part channel name
		 * @param	nick		string	part nickname
		 * @param	reason		string	part comment
		 * @param	message		object	いろいろ
		 */
		chat.addListener('part', function( chname, nick, reason, message ) {
			
			console.log( 'PART: chname: ' + chname + ' // nick: ' + nick + ' // reason: ' + reason );
			console.log( message );
			
			// none comment
			if( reason == undefined ){
				reason = '...';
			}
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "to_id: " + to_id );
			
			prependChat( to_id, nick, 'leave the ch. ('+reason+')', message.command );
			
		});
		
		
		/**
		 * Quit イベント
		 * @param	nick		string	quit nickname
		 * @param	reason		string	quit comment
		 * @param	channels	object	quit channels arry { n: 'channelname' }
		 * @param	message		object	いろいろ
		 */
		chat.addListener('quit', function(nick, reason, channels, message) {
			
			console.log( 'QUIT: ' + nick + '//' + reason );
			console.log( message );
			console.log( channels );

			// search channel id in array
			$.each( channels, function( i, value ){
				var to_id = $.inArray( value, ch );
				console.log( i + " >> to_id: " + to_id );
				
				prependChat( to_id, nick, 'leave the ch. ('+reason+')', message.command );
			});
			
		});

	
		/**
		 * Join イベント
		 * @param	chname		string	part channel name
		 * @param	nick		string	part nickname
		 * @param	message		object	いろいろ
		 */
		chat.addListener('join', function( chname, nick, message ) {
			
			console.log( 'JOIN: chname: ' + chname + ' // nick: ' + nick );
			console.log( message );

			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "to_id: " + to_id );
			
			prependChat( to_id, nick, 'enter the ch. ('+message.user+'@'+message.host+')', message.command );
			
		});
		
		
		/**
		 * Error イベント, とりあえずエラーならここに来るっぽい
		 * @param	text	object error
		 */
		chat.addListener('error', function(text) {
			
			console.log('ERROR: ', text);
			
			var command = 'ERROR';
			var err_text = '';
			
			if( typeof text == 'object' ){
				$.each( text.args, function( i, val ){
					err_text += textDecode( val +' ' );
				});
			} else {
				err_text = textDecode( text );
			}
			
			prependBacklog( 'Error', err_text, command );
			
		});


		/**
		 * + Mode イベント
		 * @param	chname		string target channel name
		 * @param	by			string by nickname
		 * @param	mode		string mode name
		 * @param	target		string mode set target user nickname
		 * @param	message		object misc
		 */
		chat.addListener('+mode', function( chname, by, mode, target, message ) {
			
			console.log('+MODE: chname: ' + chname + ' // by: ' + by + ' // mode: ' + mode + ' // target: ' + target );
			console.log( message );
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "to_id: " + to_id );
			
			// target undef is mode for channel
			if( target == null ){
			
				prependChat( to_id, by, 'changed mode +'+mode +' for '+ chname, message.command );

			// target !undef is mode for user
			} else {
				
				prependChat( to_id, by, 'changed mode +'+mode +' for '+ target, message.command );
			}
			
		});
		
		
		/**
		 * - Mode イベント
		 * @param	chname		string target channel name
		 * @param	by			string by nickname
		 * @param	mode		string mode name
		 * @param	target		string mode set target user nickname	
		 * @param	message		object misc
		 */
		chat.addListener('-mode', function( chname, by, mode, target, message ) {
			
			console.log('-MODE: chname: ' + chname + ' // by: ' + by + ' // mode: ' + mode + ' // target: ' + target );
			console.log( message );
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "to_id: " + to_id );
			
			// target undef is mode for channel
			if( target == null ){
			
				prependChat( to_id, by, 'changed mode +'+mode +' for '+ chname, message.command );

			// target !undef is mode for user
			} else {
				
				prependChat( to_id, by, 'changed mode +'+mode +' for '+ target, message.command );
			}
			
		});
		
		
		/**
		 * Nick イベント
		 * @param	channel		string channel name
		 * @param	nicks		object nicknames arry { nickname: '@' or '' }
		 */
		chat.addListener('names', function ( chname, nicks ) {
		
			console.log('NAMES: chname: ' + chname + '' );
			console.log( nicks );
			
			var namesArry = [];
			$.each( nicks, function( name, oper ){
				namesArry.push( oper + name );
			});
	
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "to_id: " + to_id );
			
			prependChat( to_id, 'Console', '<em>&lt;'+namesArry.join('&gt; &lt;')+'&gt;</em>' , 'NAMES' );
		
		});


		/**
		 * Nick イベント
		 * @param	chname		string target channel name
		 * @param	by			string by nickname
		 * @param	mode		string mode name
		 */
		chat.addListener('nick', function ( oldnick, newnick, channels, message) {
			
			console.log( 'NICK: '+ oldnick +' >> '+ newnick +'' );
			console.log( message );
			console.log( channels );

			// search channel id in array
			$.each( channels, function( i, value ){
				var to_id = $.inArray( value, ch );
				console.log( i + " >> to_id: " + to_id );
				
				prependChat( to_id, oldnick, 'has been changed to <em>&lt;'+newnick+'&gt;</em>', message.command );
			});

		});


		/**
		 * ニックネームの変更
		 * 
		 */
		$('#change_nickname').on('click', function(){
			var result = window.prompt( 'Change nickname?', nickname );
			// Input
			if( result.match(/^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/) ){
				
				console.log('Change Nickname: ' + result );
				
				chat.send('nick', result);
				
				nickname = result;
				
				// Header my nickname display
				$('header h1').text( name +' ('+nickname+')' );

			
			} else {
				window.alert('This input can not be changed.');
			}
		
		});

		
		/**
		 * 切断するぞい！
		 * @param	'click'	event
		 */
		$('#disconnect').on('click', function(){
			var result = window.confirm( name + ' disconnect ok?' );
			// Confirm YES
			if( result == true ){
				
				// chat disconnect
				chat.disconnect( "byebye", function() {
					
					console.log("DISCONNECT");
					
					delete chat;
					$('#msg').empty();
					
					window.location.href = '/index.html?disconnect=true';
				
				});
				
			}
		});
		
		

	
	});
	
})(jQuery);
