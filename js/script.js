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
	console.log( 'get localstorage: "' + name + '"=> ' + value );
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
 * node-ircから来たテキストをURLデコードする
 * @param	text	テキストデータ
 */
function textDecode( text ){
	
	text = Url.decode(text);

	return text;
}


/**
 * 来たテキストをエンコードする
 * @param	text		テキストデータ
 * @param	codetype	url, utf-8
 */
function textEncode( text, codetype ){
	
	if( codetype == 'url' ){
		text = Url.encode( text );
	} else {
		text = Utf8.encode( text );
	}
		
	return text;
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
		if( storageGet('ch') ){
			$('#ch').val( storageGet('ch') );
		}


		/// push Connect
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
			storageSet( "ch", $('#ch').val() );
		});
		
		
		/// Toolbar
		$('header menu a').on('click', function(e){
		
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
		
	
	});
	

})(jQuery);
