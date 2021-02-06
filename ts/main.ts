'use strict';

import $ from 'jquery';
import ModalPlugin from './modal';

// モーダルプラグインの定義
$.fn.extend({
	modal: ModalPlugin,
});

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

	// ユーザ名が入力されたら
	$('#user_name').on('input', e => {
		const input = String($(e.target).val());
		const has_error: boolean = (input.length > 30);
		toggleHasErrorClass($(e.target), has_error);
		toggleErrorBox($(e.target), has_error, "文字数が多すぎます。")

		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();
	});

	// ユーザIDが入力されたら
	$('#user_id').on('input', e => {
		const input = String($(e.target).val());
		const reg = /^\w{0,30}$/;
		const has_error: boolean = (input.match(reg) === null);
		toggleHasErrorClass($(e.target), has_error);
		toggleErrorBox($(e.target), has_error, "無効な形式の文字列です。")

		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();
	});

	// フォロー数かフォロワー数が入力されたら
	$('#followers, #following').on('input', e => {
		const reg = /^\d*$/;
		let has_error = false;

		// フォロワー数
		const $followers = $('#followers');
		const input_followers = String($followers.val());
		const has_error_followers: boolean = (input_followers.match(reg) === null);
		if (has_error_followers) {
			toggleHasErrorClass($followers, true);
			toggleErrorBox($followers, true, "フォロワー数は数字で入力ください。")
			has_error = true;
		} else if (Number(input_followers) > 999999999) {
			toggleHasErrorClass($followers, true);
			toggleErrorBox($followers, true, "フォロワー数、さすがに見栄張りすぎやわ。")
			has_error = true;
		} else {
			toggleHasErrorClass($followers, false);
		}

		// フォロー数
		const $following = $('#following');
		const input_following = String($following.val());
		const has_error_following: boolean = (input_following.match(reg) === null);
		if (has_error_following) {
			toggleHasErrorClass($following, true);
			toggleErrorBox($following, true, "フォロー数は数字で入力ください。")
			has_error = true;
		} else if (Number(input_following) > 999999999) {
			toggleHasErrorClass($following, true);
			toggleErrorBox($following, true, "フォロー数が多すぎます。")
			has_error = true;
		} else {
			toggleHasErrorClass($following, false);
		}

		// エラーなし
		if (has_error === false) {
			toggleErrorBox($(e.target), false)
		}

		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();
	});

	// TwitterのIDが入力されたら
	$('#twitter_id').on('input', e => {
		const input = String($(e.target).val());
		const reg = /^\w{0,15}$/;
		const has_error: boolean = (input.match(reg) === null);
		toggleHasErrorClass($(e.target), has_error);
		toggleErrorBox($(e.target), has_error, "無効な形式の文字列です。")

		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();
	});

	// InstagramのIDが入力されたら
	$('#instagram_id').on('input', e => {
		const input = String($(e.target).val());
		const reg = /^[\w\.]{0,30}$/;
		const has_error: boolean = (input.match(reg) === null);
		toggleHasErrorClass($(e.target), has_error);
		toggleErrorBox($(e.target), has_error, "無効な形式の文字列です。")
		switchSubmitButtonFromHasErrorClass();

		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();
	});

	//キャンバスに文字を描く
	$('#submit').on('click', () => {
		// 生成ボタンの押下可能性を検証して有効無効を切替
		switchSubmitButtonFromHasErrorClass();

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
		const text_follwers = $('#followers').val();
		const text_follwing = $('#following').val();
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
			if (data.code === 0) {
				$('#output_img').attr('src', 'data:image/png;base64,' + data.content)
				toggleResultErrorBox(false);
			} else {
				toggleResultErrorBox(true, data.content);
			}
		})
		.fail(data => {
			toggleResultErrorBox(true, '通信エラーが発生しました。');
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

	// 詳細ボタンを押す
	$('#detail-button').on('click', () => {
		const move_modal: any = $('#moveModal'); // modalプラグインを使うための苦肉の策
		move_modal.modal('show');
	})
});

// HTMLのみならず画像を含む全コンテンツが読まれたら実行
$(window).on('load', function () {
});

/**
 * エラーメッセージボックスの表示を切り替える
 * @param $form フォームのJQuery要素
 * @param add_class 表示するか否か
 */
function toggleHasErrorClass($form: JQuery<HTMLElement>, add_class: boolean) {

	if (add_class) {
		$form.addClass('has-error');
	} else {
		$form.removeClass('has-error');
	}
}

/**
 * エラーメッセージボックスの表示を切り替える
 * @param $form フォームのJQuery要素
 * @param is_show 表示するか否か
 * @param message エラーメッセージボックス内に入れる文字列
 */
function toggleErrorBox($form: JQuery<HTMLElement>, is_show: boolean, message: string = "") {
	const $message_box = $form.parents('.line').children('.error-message-box');
	const duration = 200;

	if (is_show) {
		$message_box.text(message)
					.show(duration);
	} else {
		$message_box.text(message)
					.hide(duration);
	}
}

/**
 * エラーがあるかに応じて生成ボタンの有効・無効を切り替える
 */
function switchSubmitButtonFromHasErrorClass() {
	const $submit = $('#submit');
	const disabled = ($('.has-error').length > 0);
	$submit.prop("disabled", disabled);
}

/**
 * レスポンスのエラーの出力の表示を切り替わる
 * @param is_show 表示するか否か
 * @param message エラーメッセージボックス内に入れる文字列
 */
function toggleResultErrorBox(is_show: boolean, message: string = '') {
	const $error_response = $('#error-response');
	const duration = 200;

	if (is_show) {
		$error_response.text(message)
					   .show(duration);
	} else {
		$error_response.text(message)
					   .hide(duration);
	}
}
