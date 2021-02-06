'use strict';

import $ from 'jquery';

// HTMLが読まれたら実行
$(function () {
	// スクロール
    $('a[href^="#"]').on('click', function () {
        const speed: number = 400; // ミリ秒
        const href = $(this).attr("href");
		const target = $((href == "#" || href == "" || href == undefined) ? 'html' : href);
		if (target !== undefined) {
			const position = target.offset().top - 10; //ゆとりを持たせる
			$('body,html').animate({ scrollTop: position }, speed, 'swing');
		}
	});

	// 画像がアップされたら
	$('#user_icon').on('change', e => {

        //fileの値は空ではなくなるはず
        if ($(e.target).val() === '') {
			return;
		}

		//propを使って、file[0]にアクセスする
		var img_data = $(e.target).prop('files')[0];

		if (!window.FileReader) {
			window.alert('このブラウザは対応しておりません。');
			return;
		}

		if (!/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/.test(img_data.name) || !/(jpg|jpeg|png|gif)$/.test(img_data.type)) {
			window.alert('JPG、GIF、PNGファイルの画像を添付してください。');
			return;
		}

		if (1048576 < img_data.size) {
			window.alert('1MB以下の画像を添付してください。');
			return;
		}

		//FileReaderをインスタンス化
		var fr = new FileReader();
		fr.addEventListener('load', e => {
			$('#user_icon_preview').attr('src', String(e.target?.result));
		});
		// base64を取得
		fr.readAsDataURL(img_data);
	});

	//キャンバスに文字を描く
	$('#submit').on('click', () => {

        // 結果画面を表示
        $('#result').slideDown(400);

        // 結果画面へスクロール
        const position: number = $('#result').offset().top - 10; //ゆとりを持たせる
		$('body,html').animate({ scrollTop: position }, 400, 'swing');

		// アイコンを取得
		let base64_user_icon = $('#user_icon_preview').attr('src');
		if (base64_user_icon !== undefined) {
			// 先頭のメタデータを削除する
			base64_user_icon = base64_user_icon.replace(/data:.*\/.*;base64,/, '');
		} else {
			base64_user_icon = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX///+nxBvIAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
		}

		// テキストを取得
		const text_user_name = $('#user_name').val();
		const text_user_id = $('#user_id').val();
		const text_follwers = $('#follwers').val();
		const text_follwing = $('#follwing').val();
		const text_twitter_id = $('#twitter_id').val();
		const text_instagram_id = $('#instagram_id').val();

		const output_json = {
			user_icon : base64_user_icon,
			user_name : text_user_name,
			user_id : text_user_id,
			follwers : text_follwers,
			follwing : text_follwing,
			twitter_id : text_twitter_id,
			instagram_id : text_instagram_id,
		}
		console.log(output_json);

		// 非同期送信
		$.ajax({
			url:           './api.php',
			type:          'post',
			dataType:      'json',
			contentType:   'application/json',
			scriptCharset: 'utf-8',
			data:          JSON.stringify(output_json)
		})
		.done(data => {
			console.log(data);
			if (data.code === 0) {
				$('#output_img').attr('src', 'data:image/png;base64,' + data.png_content)
			}
		})
		.fail(data => {
			console.log(data.responseText);

		})

		/* --------------------------------------------------
         * シェアリンク生成
         * --------------------------------------------------*/
        // Twitterとテキストボックス
        const message_body: string = 'なんかまだ良くわからないけど、Clubhouse始めました😂' + "\n"
								   + 'もしやってるよって方がいたらフォローお願いします🙏✨';
        const site_url: string = 'https://oguemon.com/clubhouse-gen/'
        const hashtag: string  = 'クラブハウス,Clubhouse,話題のSNSを始めた報告ジェネレーター';
        const textarea_body: string = message_body + "\n" + site_url + " #クラブハウス #Clubhouse #話題のSNSを始めた報告ジェネレーター";
        const twitter_parms: string = 'url=' + encodeURI(site_url) + '&text=' + encodeURI(message_body) + '&hashtags=' + encodeURI(hashtag);

        $('#copy-area-text').text(textarea_body);
        $('#share-twitter').attr('href', 'https://twitter.com/intent/tweet?' + twitter_parms);
	});
});

// HTMLのみならず画像を含む全コンテンツが読まれたら実行
$(window).on('load', function () {
});
