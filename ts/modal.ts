'use strict';

import $ from 'jquery';

/* ============================================================
    簡単モーダルクラス（modal.cssも要ります）

    $('パネルのセレクター').modal('show') : モーダル表示
    $('パネルのセレクター').modal('hide') : モーダル閉じる
    $('パネルのセレクター').modal() : モーダル表示

    パネルのHTML
    <div class="modal" id="パネルのセレクター">
        <div class="modal-dialog">
        好きなこと
        </div>
    </div>

    閉じるボタン
    <div data-dismiss="modal">閉じるボタン</div>
    ============================================================*/
export class Modal {
    private $body;
    private $element;
    private $dialog;
    private $backdrop = null;
    private supportTransition: string;
    private doAnimate: boolean;
    private isShown: boolean;
    private TRANSITION_DURATION: number = 300;
    private BACKDROP_TRANSITION_DURATION: number = 150;

    constructor (element) {
        this.$body     = $(document.body);
        this.$element  = $(element);
        this.$dialog   = this.$element.find('.modal-dialog');

        // トランジションのサポートチェック
        this.supportTransition = this.supporTransitionPropatyName();

        // アニメーションの可否をチェック
        this.doAnimate = (this.supportTransition !== "");
    }

    // モーダルを表示する
    public show () {
        const that: Modal = this;

        // 既に表示してたら終了
        if (this.isShown) return;

        // 表示してますフラグをオン
        this.isShown = true;

        // bodyにクラス追加
        this.$body.addClass('modal-open');

        // <div data-dismiss="modal">〜</div>を押すと閉じるリスナー設定
        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        // バックドロップの処理を実行
        this.backdrop(function () {

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            // モーダルを表示するための処理
            that.$element.show();
            that.$element.scrollTop(0);
            that.$element.addClass('in');

            // ダイアログにアニメーションを伴わせる
            that.emulateTransitionEnd(that.$dialog, this.TRANSITION_DURATION)
        })
    }

    // モーダルを隠す
    public hide () {

        // 既に消していたら終了
        if (!this.isShown) return;

        // 表示してますフラグをオフ
        this.isShown = false;

        // class="in"を消す
        this.$element.removeClass('in');

        // クリックで閉じる系のリスナー解除
        this.$element.off('click.dismiss.bs.modal');

        // アニメーションができそうなら
        if (this.doAnimate) {
            this.$element.one(this.supportTransition, $.proxy(this.hideModal, this));
            this.emulateTransitionEnd(this.$element, this.TRANSITION_DURATION);
        } else {
            // とりまモーダル消す
            this.hideModal();
        }
    }

    // モーダルを隠す
    public hideModal () {
        const that: Modal = this;
        this.$element.hide();

        this.backdrop(function () {
            that.$body.removeClass('modal-open');
        })
    }

    private backdrop (callback) {
        const that: Modal = this;

        // 開く途中に呼ばれたbackdropなら、生成処理を行う
        if (this.isShown) {
            this.$backdrop = $(document.createElement('div'));
            this.$backdrop.addClass('modal-backdrop');
            this.$backdrop.appendTo(this.$body);

            this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (e.target === e.currentTarget) {
                    that.hide();
                }
            }, this))

            if (this.doAnimate) {
                this.$backdrop[0].offsetWidth // force reflow
            }

            this.$backdrop.addClass('in');

            if (!callback) {
                return;
            }

            if (this.doAnimate) {
                this.$backdrop.one(this.supportTransition, callback);
                this.emulateTransitionEnd(this.$backdrop, this.BACKDROP_TRANSITION_DURATION);
            } else {
                callback();
            }

        // 閉じる途中に呼ばれたbackdropなら、削除処理を行う
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in');

            // バックドロップを消すコールバック関数
            const callbackRemove = function () {
                if (that.$backdrop) {
                that.$backdrop.remove();
                }
                that.$backdrop = null;

                if (callback) {
                callback();
                }
            }

            if (this.doAnimate) {
                this.$backdrop.one(this.supportTransition, callbackRemove);
                this.emulateTransitionEnd(this.$backdrop, this.BACKDROP_TRANSITION_DURATION);
            } else {
                callbackRemove();
            }
        } else if (callback) {
            callback();
        }
    }

    private supporTransitionPropatyName(): string {
        // テキトーな要素を作る
        const el = document.createElement('check');

        const transEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition    : 'transitionend',
            OTransition      : 'oTransitionEnd otransitionend',
            transition       : 'transitionend'
        };

        for (let name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return '';
    }

    private emulateTransitionEnd (ele, duration) {
        const that: Modal = this;
        let called: boolean = false;

        ele.one(this.supportTransition, function () {
            called = true
        });

        setTimeout(function () {
            if (!called) {
                ele.trigger(that.supportTransition);
            }
        }, duration);
    }
}

// MODAL PLUGIN DEFINITION
// =======================

const Plugin = function (option) {
    return this.each(function () {
        // bs.modalデータがなければ新規作成して設定
        if (!$(this).data('bs.modal')) {
            $(this).data('bs.modal', new Modal(this));
        }

        // bs.modalデータを代入
        const data = $(this).data('bs.modal');

        // 引数に応じて処理するメソッドを決める
        if (typeof option == 'string') {
            data[option]();
        } else {
            data.show();
        }
    });
}

export default Plugin;
