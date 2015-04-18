jQuery.noConflict();
(function($) {
	
	// show progressbar
	$('progress').show();
		
	/*
	 * メッセージ表示secitonの作成
	 * @param	i		number index
	 * @param	ch		string チャネル名
	 */
	function createMsg( i, chname ){
		
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
			<label for="input_'+i+'">\
				<h2>'+ chname +'</h2>\
			</label>\
			<div class="chat_list" id="chat_'+i+'">\
				'+say+'\
				<ol class="chat">\
					<li><em>Join</em> '+chname+'</li>\
				</ol>\
			</div>\
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
		var password = storageGet( 'password' );
		
		// convert to reserved word
		if( storageGet( 'encode' ) == 'iso-2022-jp' ){
			var encode = 'JIS';
		} else {
			var encode = 'UTF8';
		}
		
		window.onkeypress = keypress;
		
		// get input channel lines
		var ch = storageGet( 'ch' );
		// No channel.
		if( ch ){} else { // rubbish
			ch = '!NaN!';
		}
		ch = ch.replace(/\r\n|\r/g, "\n").split('\n');
		// If single line push ch object.
		if( typeof ch != 'object' ){
			ch.push( ch );
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
			password: password,
			userName: username,
			realName: 'FoxkehChat on FirefoxOS',
			//stripColors: true,
			autoConnect: false, // require call client.connect()
			debug: true,
			//channels: [ch],
		});

				
		/**
		 * 今日もがんばって接続するぞい！
		 * @param	5	number is try reconnection count
		 */
		chat.connect( 5, function() {
		
			//ch = Encoding.convert( ch, { to: encode, from: 'UNICODE' });
			// channels each
			$.each( ch, function( i, chname ){
			
				// channel name encoding
				chname = Encoding.convert( chname, { to: encode, from: 'UNICODE' });
				console.log( '>>>>>>> chname encode detect: '+ Encoding.detect( chname ) );
				console.log( '>>>>>>> connect each chname: ' + chname);
				
				// if None channel.
				if( chname == '!NaN!' ){
					$('progress').fadeOut('slow'); // progress
				
				} else {
					// Self JOIN
					chat.join( chname, function() {
						
						chname = Encoding.convert( chname, { to: 'UNICODE', from: 'AUTO' });
						
						console.log( 'JOIN: i: '+i+' //ch: '+chname );
											
						// CH section create
						createMsg( i, chname );
						
						$('progress').fadeOut('slow'); // progress
					});
				}
			});
	
			createMsg( ch.leigth++ , 'backlog' );
					
		});
				
		
		/**
		 * 発言input欄で何らかのキー入力が行われた
		 * @param	e	object イベント
		 */
		function keypress(e) {
			if( e.which === 13 && e.target.value != '' ){ // enter key event
				var say_id = $('#'+e.target.id).parent().parent().parent().attr('id');
				var say_val = e.target.value;
				
				console.log( "say_id: "+ say_id + " // say_val: "+ say_val );
				console.log( "ch[say_id]: "+ ch[say_id] + " // ch: "+ch);
				
				// message encoding
				ch_id_encode = Encoding.convert( ch[say_id], { to: encode, from: 'AUTO' });
				say_val_encode = Encoding.convert( say_val, { to: encode, from: 'AUTO' });
				// message send to server
				chat.say( ch_id_encode, say_val_encode );
				
				// message display to target chat list
				say_val = escapeText( say_val );
				prependChat( say_id, nickname, say_val, 'ME' );
				
				// reset input
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
			var command = 'MESSAGE';
			
			// text encode for display
			text = Encoding.convert( text, { to: 'UNICODE', from: encode });
			text = escapeText( text );
            text = keywordCheck( text );
			to = Encoding.convert( to, { to: 'UNICODE', from: encode });

			console.log('MESSAGE: ' + nick + ' => ' + to + ' // ' + text);
			//console.log(message);
			
			// It null message is system message
			if( nick == null ){
				prependBacklog( 'Console', text, message.command );
			
			// It private message
			} else if( to == nickname ){
				prependBacklog( nickname, text, 'ME' );
				
			// It channel message
			} else {
				// search channel id in array
				var to_id = $.inArray( to, ch );
				
				// if non id, add channel.
				if( to_id == -1 ){
					ch.push( to );
					createMsg( ch.length-1, to );
					to_id = $.inArray( to, ch );
				}
				
				prependChat( to_id, nick, text, command );
			}
		});
		

		/**
		 * Notice イベント
		 * @param	nick	string nickname
		 * @param	to		string channel name
		 * @param	text	string message body
		 * @param	message	object なんかいろいろ
		 */
		chat.addListener('notice', function (nick, to, text, message) {
			var command = 'NOTICE';

			// text encode for display
			text = Encoding.convert( text, { to: 'UNICODE', from: encode });
			text = escapeText( text );
			to = Encoding.convert( to, { to: 'UNICODE', from: encode });
			
			console.log('NOTICE: '+ nick + ' => ' + to + ' // ' + text);
			//console.log(message);
			
			// It null message is system message
			if( nick == null ){
				prependBacklog( 'Console', text, message.command );
			
			// It private message
			} else if( to == nickname ){
				prependBacklog( nickname, text, 'ME' );
				
			} else {
				// search channel id in array
				var to_id = $.inArray( to, ch );
				
				// if non id, add channel.
				if( to_id == -1 ){
					ch.push( to );
					createMsg( ch.length-1, to );
					to_id = $.inArray( to, ch );
				}
				
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
			var command = 'PM';
			
			// encode
			text = Encoding.convert( text, { to: 'UNICODE', from: encode });
			
			console.log('PM: ' + nick + ' => ME // ' + text );
			//console.log(message);
			
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

			// encode
			chname = Encoding.convert( chname, { to: 'UNICODE', from: encode });
			reason = Encoding.convert( reason, { to: 'UNICODE', from: encode });
			
			console.log( 'PART: chname: ' + chname + ' // nick: ' + nick + ' // reason: ' + reason );
			//console.log( message );
			
			// none comment
			if( reason == undefined ){
				reason = '...';
			}
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			//console.log( "to_id: " + to_id );
			
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
			
			// encoding
			reason = Encoding.convert( reason, { to: 'UNICODE', from: encode });
			
			console.log( 'QUIT: ' + nick + '//' + reason );
			//console.log( message );
			//console.log( channels );

			// search channel id in array
			$.each( channels, function( i, value ){
				
				value = Encoding.convert( value, { to: 'UTF8', from: 'AUTO' });
				
				var to_id = $.inArray( value, ch );
				console.log( i + " QUIT >> value: " + value );
				
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
			
			//encode
			chname = Encoding.convert( chname, { to: 'UNICODE', from: encode });
			
			console.log( '---- JOIN: chname: ' + chname + ' // nick: ' + nick );
			//console.log( message );

			// search channel id in array
			var to_id = $.inArray( chname, ch );
			console.log( "---- to_id: " + to_id );
			// if non id, add channel.
			if( to_id == -1 ){
				ch.push( chname );
				createMsg( ch.length-1, chname );
				to_id = $.inArray( chname, ch );
			}
			
			prependChat( to_id, nick, 'enter the ch. ('+message.user+'@'+message.host+')', message.command );
			
		});
		
		
		/**
		 * Error イベント, とりあえずエラーならここに来るっぽい
		 * @param	text	object error
		 */
		chat.addListener('error', function(text) {
			var command = 'ERROR';
			var err_text = '';
			
			if( typeof text == 'object' ){
				$.each( text.args, function( i, val ){
					err_text += Encoding.convert( val+' ', { to: 'UNICODE', from: encode });
				});
			} else {
				err_text = Encoding.convert( text, { to: 'UNICODE', from: encode });
			}
			
			console.log('!!! ERROR: ', err_text);
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

			chname = Encoding.convert( chname, { to: 'UNICODE', from: encode });

			console.log('+MODE: chname: ' + chname + ' // by: ' + by + ' // mode: ' + mode + ' // target: ' + target );
			//console.log( message );
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			//console.log( "to_id: " + to_id );
			
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

			chname = Encoding.convert( chname, { to: 'UNICODE', from: encode });
		
			console.log('-MODE: chname: ' + chname + ' // by: ' + by + ' // mode: ' + mode + ' // target: ' + target );
			//console.log( message );
			
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			//console.log( "to_id: " + to_id );
			
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

			chname = Encoding.convert( chname, { to: 'UNICODE', from: encode });

			console.log('NAMES: chname: ' + chname + '' );
			console.log( nicks );
			
			var namesArry = [];
			$.each( nicks, function( name, oper ){
				namesArry.push( oper + name );
			});
	
			// search channel id in array
			var to_id = $.inArray( chname, ch );
			//console.log( "to_id: " + to_id );
			
			prependChat( to_id, 'Console', '<em>&lt;'+namesArry.join('&gt; &lt;')+'&gt;</em>' , 'NAMES' );
		
		});


		/**
		 * Nick イベント
		 * @param	oldnick		string old nicname
		 * @param	newnick		string new nickname
		 * @param	channels	array channels
		 * @param	message		etc
		 */
		chat.addListener('nick', function ( oldnick, newnick, channels, message) {
			
			console.log( 'NICK: '+ oldnick +' >> '+ newnick +'' );
			//console.log( message );
			//console.log( channels );

			// search channel id in array
			$.each( channels, function( i, value ){

				value = Encoding.convert( value, { to: 'UNICODE', from: encode });

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
