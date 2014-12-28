/**
 * 定数宣言
 * @param	REGEX_HTTP	httpから始まる恋物語
 */
const REGEX_HTTP = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;


/**
 * localStrorageに保存する関数, obj対応(したい)
 * @param	name	setItem名義
 * @param	value	保存する値 
 */
function storageSet( name, value ){
	
	if( typeof value === 'object' ){
		/// valueにオブジェクトが渡されたらJSON.stringify(value)する
		value = JSON.stringify(value);
		localStorage.setItem( name, value );
		console.log( 'save localstorage: "' + name + '"=> ' + JSON.parse(value) );
		
	} else {
		/// オブジェクト以外は素直に保存
		localStorage.setItem( name, value );
		console.log( 'save localstorage: "' + name + '"=> ' + value );
	}
}

/**
 * localStrorageを参照する関数, obj対応(したかった)
 * @param	name	setItem名義
 * @param	type	obj == JSON.parseして返す
 */
function storageGet( name, type ){
	var type = type || '';

	//暫定
	var value = localStorage.getItem( name );
	console.log( 'get localstorage: (' + name + ') => ' + value );
	return value;

	/* これなぜかifが仕事しない糞い
	if( type != '' && type === 'object' || 'obj' ){
		/// type == obj なら、json parse
		var value = localStorage.getItem( name );
		console.log( 'get object type localstorage: "' + name + '"=> ' + value );
		return value;
		
	} else {
		/// オブジェクト以外は素直に保存
		var value = localStorage.getItem( name );
		console.log( 'get localstorage: "' + name + '"=> ' + value );
		return value;
	}
	*/
}


/**
 * 来たテキストにURL無いか探してリンクする、画像ならimgにしちゃう
 * @param	text		string	search text body
 * @param	thumbnail	boolean	false == none thumb
 */
function textLinker( text, thumbnail ){
	
	text = text.replace( REGEX_HTTP, function( all, matchstr ) {
		console.log( matchstr );
		
		replaced_text = matchstr.toLowerCase();
		
		if( thumbnail == false ){
			
			return replaced_text = '<a href="'+ matchstr +'" target="_blank">'+ matchstr +'</a>';
			
		} else if( replaced_text.match(/\.(gif|jpe?g|png)$/i) ){
			
			return replaced_text = '<a href="'+ matchstr +'" target="_blank">'+ matchstr +'</a>\
				<br><img class="thumbnail" src="'+ matchstr +'">';
		
		} else if( replaced_text.match(/\.(pdf)$/i) ){
			
			var url = textEncode( matchstr, 'url' );
			return replaced_text = '<a href="'+ matchstr +'" target="_blank">'+ matchstr +'</a>\
				<br><img class="thumbnail" src="http://capture.heartrails.com/128x128/pdf?'+ matchstr +'">';
		
		} else {
		
			return replaced_text = '<a href="'+ matchstr +'" target="_blank">'+ matchstr +'</a>';
		
		}
	});
	
	return text;
}


/**
 * HTMLエスケープする関数
 * @param	text	string	エスケープするテキスト
 */
function escapeText( text ){
	// HTML escape!
	var dammy_element = document.createElement('div');
	dammy_element.appendChild(document.createTextNode(text));
	return dammy_element.innerHTML;
}



jQuery.noConflict();
(function($) {

	window.addEventListener('DOMContentLoaded', function( ) {
	
		// YOU
		if( storageGet('nickname') ){
			$('#nickname').val( storageGet('nickname') );
		}
		if( storageGet('username') ){
			$('#username').val( storageGet('username') );
		}
		
		// SERVER
		if( storageGet('name') ){
			$('#name').val( storageGet('name') );
		}
		if( storageGet('host') ){
			$('#host').val( storageGet('host') );
		}
		if( storageGet('port') ){
			$('#port').val( storageGet('port') );
		}
		if( storageGet('password') ){
			$('#password').val( storageGet('password') );
		}
		if( storageGet('encode') ){
			$('#encode').val( storageGet('encode') );
		}
		if( storageGet('ch') ){
			$('#ch').val( storageGet('ch') );
		}


		/**
		 * Index: Connect を押したら値を保存するぞい！
		 */
		$('#connect').on('click', function(){
			
			//YOU
			if( $('#nickname').val() == "" ){
				alert('No nickname');
				return false;
			}
			if( $('#username').val() == "" ){
				alert('No username');
				return false;
			}
			
			// YOU
			storageSet( "nickname", $('#nickname').val() );
			storageSet( "username", $('#username').val() );
			
			// SERVER
			storageSet( "name", $('#name').val() );
			storageSet( "host", $('#host').val() );
			storageSet( "port", $('#port').val() );
			storageSet( "password", $('#password').val() );
			storageSet( "encode", $('#encode').val() );
			storageSet( "ch", $('#ch').val() );
		});


		/**
		 * Index: Commands menu の Test Connect Settingの設定
		 */
		$('#test_setting').on('click', function(){
			
			$('#name').val( 'Freenode' );
			$('#host').val( 'chat.freenode.net' );
			$('#port').val( '6667' );
			$('#password').val( '' );
			$('#ch').val( '#foxkehchat' );
			$('#encode').val( 'utf-8' );
			alert( 'Test Connect Setting Done!' );
			
		});
		
		
		/// Toolbar
		$('header').find('menu').find('a').on('click', function(e){
		
			id_name = $(this).attr('href');
			console.log( 'click toolbar : ' + id_name );
			$(id_name).toggle('fast');
		
		});
		$('aside nav h3').on('click', function(e){
			$(this).parent().toggle('fast');
		});
		$('aside nav button').on('click', function(e){
			//そのうちなんとかする...
			$(this).parent().parent().parent().toggle('fast');
		});

		
		/// tap on toggle box and jumpin
		$(document).on('click', 'label', function(){
			// toggle chat list
			var say_input = '#'+$(this).attr('for');
			var jump_id = '#'+$(this).parent().attr('id');
			
			//console.log('say_input:' + say_input);
			//console.log('jump_id: ' + jump_id);
			
			$(this).next('.chat_list').toggle();
		
			if (jump_id) {
				var jump_offset = $(jump_id).offset().top;
				//console.log(jump_offset);
				$('html,body').animate({scrollTop: jump_offset},200);
				$(say_input).focus();
				return false;
			}
			
		});
		
		
	});
	

})(jQuery);
