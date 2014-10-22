jQuery.noConflict();
(function($) {
	
	// show progressbar
	$('#connecting').show();
	
	/*
	 * メッセージ表示secitonの作成
	 * @param	i		index
	 * @param	ch		チャネル配列
	 */
	function createMsg( i, ch ){
		
		// id attr value is change: id -> count number "i".
		//var id = ch.replace(/#/g,'');
		
		// backlog id attr value is backlog
		if( ch == 'backlog' ){
			i = 'backlog';
			say = '';
		}
		
		var say = '<p class="say"><input id="'+i+'" type="text" placeholder="Wow" onkyedown="_sayKeydown(e)"></p>';
		
		var html = '\
		<section id="'+i+'">\
			<h2>'+ ch +'</h2>\
			'+say+'\
			<ol class="chat">\
				<li><em>Join</em> '+ch+'</li>\
			</ol>\
		</section>';
		
		$('#msg').prepend(html);
		
		console.log( 'createMsg: ch: ' + ch + ' //id: ' + i );
		console.log('---------------------------------------------------');
	}
	
	/**
	 * ターゲットに発言htmlをprependしちゃう
	 * @param	ch			array チャネル配列
	 * @param	to			string 発言先チャネル名
	 * @param	nick		string 名前
	 * @param	text		string 内容
	 * @param	command		string IRCコマンド
	 */
	function prependChat( ch, to, nick, text, command ){

		say_ch_id = $.inArray( to, ch ); // ch name search in array index
		console.log('prependChat: say_ch_id: '+say_ch_id);
		if( say_ch_id == -1 ){
			to = 'backlog';
		} else {
			to = say_ch_id;
		}
		
		// nick is undef
		if( nick == undefined ){ nick = 'Console'; }

		// noticeならクラス付ける
		if( command == 'NOTICE' ){
			var li_class = 'from notice';
		} else if ( command == 'PRIV' ){
			var li_class = 'from priv';
		} else if ( command == 'ME' ){
			var li_class = 'me';
		} else {
			var li_class = 'from';
		}

		console.log( 'prependChat: ch[say_ch_id]: ' + ch[say_ch_id] + ' //to: ' + to + ' //nick: ' + nick + ' //text: ' + text + ' //command: '+ command );
		var html ='\
		<li class="'+ li_class +'">\
			<em>&lt;'+ nick + '&gt;</em>\
			' + text +'\
		</li>';
		
		$( '#' + to + ' .chat').prepend(html);
		console.log('---------------------------------------------------');
	}
	

	window.addEventListener('DOMContentLoaded', function( ) {

		// get settings
		var nickname = storageGet( 'nickname' );
		var username = storageGet( 'username' );
		var name = storageGet( 'name' );
		var host = storageGet( 'host' );
		var port = storageGet( 'port' );
		window.onkeypress = keypress;
		
		var ch = storageGet( 'ch' );
		ch = ch.replace(/\r\n|\r/g, "\n").split('\n');
		// Backlog section create
		console.log(ch);
		
		var chat = new Client( host, nickname, {
			port: port,
			userName: username,
			realName: 'FoxkehChat on FirefoxOS',
			//stripColors: true,
			autoConnect: false, // require call client.connect()
			debug: true,
			//channels: [ch],
		});
		
		// Header my nickname display
		$('header h1').append( name +' ('+nickname+')' );
		
		// Connect
		chat.connect( 5, function() {
			
			var progress_val = '10';
			$('#connecting').val(progress_val); // progress

			// channels each
			$.each( ch, function( i, chname ){
				
				console.log( 'JOIN: i: '+i+' //ch: '+chname );
				
				// Self JOIN
				chat.join( chname, function() {
										
					// CH section create
					createMsg( i, chname );
					
					progress_val += '10';
					$('#connecting').val(progress_val);
	
				});
			
			});
		
			createMsg( ch.leigth++ , 'backlog' );
			$('#connecting').val('100').slideUp('slow'); // progress
					
		});
		
		
		
		// Say Send Message
		function _sayKeydown( e ){
			console.log(e);
			if( e.which === 13 ){
				alert('enter');
			}
		}
		
		
		// Say Input Enter & Send Message
		function keypress(e) {
			
			var say_id = e.target.id
			
			if( e.which === 13 ){
				console.log(e);
				console.log(  );
				console.log("say return presses");
			}
		}
		
		$('.say input').keydown( function( e ) {
			alert('a');
			if ( e.which === 13 ) {
				
				// get channel id
				var say_ch_id = $(this).parent().parent().attr('id');
				console.log( 'say_ch_id: ' + say_ch_id );
				
				var say_text = $(this).val();
				say_text = textEncode(say_text,'utf-8');
				
				chat.say( ch[say_ch_id], say_text );
				console.log( 'ch[say_ch_id]: '+ch[say_ch_id]);
				
				prependChat( ch, say_ch_id, nickname, text, 'ME' );
				
				$(this).val('');
				
			}
		});
		
		
		// Someone Part
		chat.addListener('part', function( ch_name, nick, reason, message ) {
			
			if( reason == undefined ){
				reason = '...';
			}
			
			var command = 'PART';
			
			console.log( 'PART: ' + nick + '//' + reason );
			console.log( message );
			
			prependChat( ch, ch_name, nick, reason, message.command );
			
		});
	
		// Someone Join
		chat.addListener('join', function( ch_name, nick, message ) {
			
			console.log( 'JOIN: ' + ch );
			console.log( message );
			
			var command = 'JOIN';
			
			prependChat( ch, ch_name, nick, '('+message.user+'@'+message.host+')', message.command );
			
		});
		
		// Msg
		chat.addListener('message', function (nick, to, text, message) {
			console.log('MESSAGE: ' + nick + ' => ' + to + ': ' + text);
			console.log(message);
			
			var command = 'MESSAGE';
			
			// decode
			text = textDecode( text );
			
			// to channel message or private message
			if( to == nickname ){
				to = 'backlog';
				command = 'ME';
			}
			
			prependChat( ch, to, nick, text, command );
		});
		
		// Notice
		chat.addListener('notice', function (nick, to, text, message) {
			console.log('NOTICE: '+ nick + ' => ' + to + ': ' + text);
			console.log(message);
			
			// decode
			text = textDecode( text );
			
			prependChat( ch, to, nick, text );
		});
		
		// Priv
		/*
		chat.addListener('pm', function (nick, text, message) {
			console.log('PM: ' + nick + ' => ME: ' + text );
			console.log(message);
			
			text = textDecode( text );
			
			prependChat( ch, 'me', nick, text );
		});*/
		
		// Error
		chat.addListener('error', function(text) {
			console.log('error: ', text);
			
			text = textDecode( text );
			
			prependChat( 'backlog', ch_id, 'Error', text );
		});


		
/*
		// Someone Quit
		chat.addListener('quit', function(nick, reason, channels, message) {
			
			console.log( 'QUIT: ' + nick + '//' + reason );
			console.log( message );
			console.log( channels );
			
			prependCommand( ch, channels, nick, reason, message.command );
			
		});


		// Change Nick
		chat.addListener('nick', function ( oldnick, newnick, channels, message) {
			console.log('NICK: ' + nick + ' => ME: ' + text );
			console.log(message);
			console.log(channels);
			
			prependCommand( ch, channels, oldnick, '->'+newnick, 'NICK' );
		});

*/

		
		
		// Disconnect
		$('#disconnect').on('click', function(){
			
			var result = window.confirm( 'Disconnect ok?' );
			
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
