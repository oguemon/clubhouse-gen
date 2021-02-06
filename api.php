<?php
// 終了時の返り値
const RC_NORMAL = 0;
const RC_ERROR  = 1;

// data:image/jpeg;base64,はいらん
$json_str = file_get_contents('php://input');
/*
$json_str = <<<EOM
{
    "user_icon":"iVBORw0KGgoAAAANSUhEUgAAAPAAAADwAQMAAAAEm3vRAAAAA1BMVEX///+nxBvIAAAAHUlEQVRYw+3BAQ0AAADCIPuntscHDAAAAAAAACDqHRAAAQu7BwkAAAAASUVORK5CYII=",
    "user_name":"text_user_name",
    "user_id":"text_user_id",
    "follwers":"100",
    "follwing":"200",
    "twitter_id":"text_twitter_id",
    "instagram_id":"text_instagram_id"
}
EOM;
*/

// JSON文字列が1.5MB以上あるとエラー終了
if (strlen($json_str) > 1500 * 1000) {
    exitWithOutputResponse(RC_ERROR, 'リクエストのデータサイズが大きすぎます。');
}

$json_obj = json_decode($json_str);
// 入力文字列の設定（文字列は指定文字数以降を切り捨て）
$json_user_icon_base64 = $json_obj->user_icon;
$json_user_name        = mb_substr($json_obj->user_name,    0, 30);
$json_user_id          = mb_substr($json_obj->user_id,      0, 30);
$json_follower_count   = mb_substr($json_obj->follwers,     0,  9);
$json_following_count  = mb_substr($json_obj->follwing,     0,  9);
$json_twitter_id       = mb_substr($json_obj->twitter_id,   0, 15);
$json_instagram_id     = mb_substr($json_obj->instagram_id, 0, 30);

// 入力文字列の加工
$user_icon_base64 = $json_user_icon_base64;
$user_name        = ($json_user_name !== '')?       $json_user_name       : 'Anonymous';
$user_id          = ($json_user_id !== '')?         $json_user_id         : 'null';
$follower_count   = (is_numeric($json_follower_count))?  $json_follower_count  : '0';
$following_count  = (is_numeric($json_following_count))? $json_following_count : '0';
$twitter_id       = $json_twitter_id;
$instagram_id     = $json_instagram_id;

// Nunitoだけで対応可能かチェック
$user_name_is_acceptable_for_nunito = false;
if(preg_match('/^[\w\s‘\?’“\!”\(%\)\[#\]\{@\}\/&\\<\-\+÷×=>®©\$€£¥¢:;,\.\*]+$/', $user_name)) {
    $user_name_is_acceptable_for_nunito = true;
}

// フォロー数のk,mチェック
$million = 1000000;
$thousand = 1000;

if ($follower_count > $million) {
    $follower_count = floor($follower_count / $million) . 'M';
} else if ($follower_count > $thousand) {
    $follower_count = floor($follower_count / $thousand) . 'k';
}

if ($following_count > $million) {
    $following_count = floor($following_count / $million) . 'M';
} else if ($following_count > $thousand) {
    $following_count = floor($following_count / $thousand) . 'k';
}

// GD の環境変数を設定
putenv('GDFONTPATH=' . realpath('./font'));
$font_file_l = 'Nunito-Light.ttf';
$font_file_r = 'Nunito-Regular.ttf';
$font_file_b = 'Nunito-Bold.ttf';
$font_file_b_jp = 'NotoSansJP-Bold.otf';
$font_file_sb = 'Nunito-SemiBold.ttf';

// アイコンのbase64デコード
$decoded_user_icon = base64_decode($user_icon_base64);

try{
    //既存の画像リソースを読み込む場合
    $base_img = imagecreatetruecolor(1125, 1380);
    $bg_img = imagecreatefrompng('./img/bg.png');
    $profile_img = imagecreatefromstring($decoded_user_icon);
    $profile_filter_img = imagecreatefrompng('./img/filter.png');
    $twitter_img = imagecreatefrompng('./img/twitter.png');
    $instagram_img = imagecreatefrompng('./img/instagram.png');

    # 元画像の幅と高さを取得
    $bg_w = ImageSx($bg_img);
    $bg_h = ImageSy($bg_img);

    # ロゴの幅と高さを取得
    $profile_w = ImageSx($profile_img);
    $profile_h = ImageSy($profile_img);

    # ロゴの幅と高さを取得
    $twitter_w = ImageSx($twitter_img);
    $twitter_h = ImageSy($twitter_img);

    # ロゴの幅と高さを取得
    $instagram_w = ImageSx($instagram_img);
    $instagram_h = ImageSy($instagram_img);

    // 寸法
    $margin_l = 47; //px

    $color_font = 0x333333; // gray
    $color_font_blue = 0x336699;
    //$color_font = 0xff0000; // red

    // 背景画像を貼る
    imagecopy($base_img, $bg_img,
        0,
        0,
        0, 0,
        $bg_w, $bg_h
    );

    // プロフィール画像を貼る
    imagecopyresampled($base_img, $profile_img,
        48, 144, 0, 0,
        240, 240, $profile_w, $profile_h
    );

    // プロフィール画像のフィルタリング
    imagecopy($base_img, $profile_filter_img,
        48 - 5,
        144 - 5,
        0, 0,
        250, 250
    );

    // Nunitoだけで対応可能かによってユーザ名の使用フォントを変える
    if ($user_name_is_acceptable_for_nunito) {
        $font_user_name = $font_file_b;
    } else {
        $font_user_name = $font_file_b_jp;
    }

    // ユーザ名を貼り付け
    imagettftext($base_img, 41, 0, $margin_l, 484, $color_font, $font_user_name, $user_name);
    // ユーザIDを貼り付け
    imagettftext($base_img, 32, 0, $margin_l, 560, $color_font, $font_file_r, '@' . $user_id);

    $follow_base_y = 688;

    // フォロワー数を貼り付け
    $pos_follower_count = imagettftext($base_img, 40, 0, $margin_l, $follow_base_y, $color_font, $font_file_b, $follower_count);
    $pos_follower_count_rb_x = $pos_follower_count[2]; // 右下のx座標
    $pos_follower_str = imagettftext($base_img, 32, 0, $pos_follower_count_rb_x + 12, $follow_base_y, $color_font, $font_file_r, 'followers');
    $pos_follower_str_rb_x = $pos_follower_str[2]; // 右下のx座標

    // フォロー数を貼り付け
    $pos_following_count = imagettftext($base_img, 40, 0, $pos_follower_str_rb_x + 100, $follow_base_y, $color_font, $font_file_b, $following_count);
    $pos_following_count_rb_x = $pos_following_count[2]; // 右下のx座標
    $pos_following_str = imagettftext($base_img, 32, 0, $pos_following_count_rb_x + 12, $follow_base_y, $color_font, $font_file_r, 'following');

    $sns_base_y = 1092;
    $sns_str_icon_gap = 6;
    $icon_width = 45;
    $icon_height = 45;

    // Twitter ID
    if ($twitter_id === '') {
        $color_twitter_font = $color_font_blue;
        $text_twitter = 'Add Twitter';
    } else {
        $color_twitter_font = $color_font;
        $text_twitter = $twitter_id;
    }

    // Instagram ID
    if ($instagram_id === '') {
        $color_instagram_font = $color_font_blue;
        $text_instagram = 'Add Instagram';
    } else {
        $color_instagram_font = $color_font;
        $text_instagram = $instagram_id;
    }

    // Twitterを貼り付け
    $pos_twitter_icon = imagecopyresampled($base_img, $twitter_img, $margin_l, $sns_base_y - $twitter_h, 0, 0, $icon_width, $icon_height, $twitter_w, $twitter_h);
    $pos_twitter_icon_rb_x = $margin_l + $twitter_w; // 右下のx座標
    $pos_twitter_id = imagettftext($base_img, 36, 0, $pos_twitter_icon_rb_x + 18, $sns_base_y - $sns_str_icon_gap, $color_twitter_font, $font_file_sb, $text_twitter);
    $pos_twitter_id_rb_x = $pos_twitter_id[2]; // 右下のx座標

    // Instagramを貼り付け
    $pos_start_x = $pos_twitter_id_rb_x + 80;
    $pos_instagram_icon = imagecopyresampled($base_img, $instagram_img, $pos_start_x, $sns_base_y - $instagram_h, 0, 0, $icon_width, $icon_height, $instagram_w, $instagram_h);
    $pos_instagram_icon_rb_x = $pos_twitter_id_rb_x + 80 + $instagram_w; // 右下のx座標
    $pos_instagram_id = imagettftext($base_img, 36, 0, $pos_instagram_icon_rb_x + 18, $sns_base_y - $sns_str_icon_gap, $color_instagram_font, $font_file_sb, $text_instagram);

    // 紹介日を貼り付け
    $text_join_date = 'Joined ' . date('M j, Y'); // Jan 31, 2021
    $pos_joindate_id = imagettftext($base_img, 28, 0, 190, 1275, $color_font, $font_file_l, $text_join_date);

    // 紹介者名を貼り付け
    $pos_nominator = imagettftext($base_img, 28, 0, 190, 1335, $color_font, $font_file_l, 'Nominated by');
    $pos_nominator_rb_x = $pos_nominator[2]; // 右下のx座標
    $pos_nominator = imagettftext($base_img, 28, 0, $pos_nominator_rb_x + 10, 1335, $color_font, $font_file_sb, 'https://oguemon.com/clubhouse-gen/');

    // ヘッダーを設定
    // header('Content-Type: image/png');
    header('Content-Type: application/json');

    // 画像を表示
    ob_start();
    imagepng($base_img);
    imagedestroy($base_img);
    $image_data = ob_get_contents();
    ob_end_clean();

    // 画像データを含めて正常終了
    exitWithOutputResponse(RC_NORMAL, base64_encode($image_data));
}
catch(Exception $e) {
  // エラー発生
  exitWithOutputResponse(RC_ERROR, '画像生成に失敗しました。');
}

// 設定したコードとレスポンス文字列を出力してプログラム終了する
function exitWithOutputResponse($code, $content) {
    echo json_encode([
        'code' => $code,
        'content' => $content,
    ]);
    exit();
}
