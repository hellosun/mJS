/**
 * 倒计时
 * User: @williamDong
 * Create Time: 13-3-12 下午5:12
 * Version: 0.1
 * API: $('.timeBlock').mTimeLast({
 *     getTimeUrl: ,   // ajax获取当前时间的毫秒，如没有填写，则取客户端时间
 *     yearEle: ,   // 显示年元素
 *     monthEle: ,  // 显示月元素
 *     dayEle: ,    // 显示天数元素
 *     hourEle: ,   // 显示小时元素
 *     minEle: ,    // 显示分钟元素
 *     secEle: ,    // 显示秒数元素
 *     msEle: ,    // 显示毫秒元素
 *     callback: function () {}   // 回调元素
 * });
 *<span class="mLastTime tar" data-endTime="2013/03/14 18:12:14"><span class="J_hour"></span>:<span class="J_min"></span>:<span class="J_sec"></span></span>
 */
;(function ( $, window, document, undefined ) {

    var defaults = {
            getTimeUrl: null,
            dayEle: null,
            hourEle: null,
            minEle: null,
            secEle: null,
            msEle: null,
            callback: function(){}
    }

    function TimeLast (element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );

        this.serverTime = null;
        this.init();
    }

    TimeLast.prototype = {
        init: function () {
            var that = this;
            that.getNowTime();
            that.renderTime();
            that.refreshTime();
        },

        /**
         * ajax 方式获取当前时间
         */
        getNowTime: function () {
            var _getTimeByAjaxUrl = this.options.getTimeUrl,
                that = this;
            if ( (typeof _getTimeByAjaxUrl).toLowerCase() === 'string' ){
                $.ajax({
                    url: _getTimeByAjaxUrl,
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    success: function (timeData) {
                        that.serverTime = timeData.time;
    //                    $('body').data('serverTime', timeData.time);
                    }
                })
            } else {
                var _nowTime = new Date();
                that.serverTime = _nowTime.getTime();
            }
        },

        /**
         * 显示初始的时间
         */
        renderTime: function () {
            var that = this,
                $timeBox = $(this.element),
                oTimeLast = that.timeRange();
            if (oTimeLast.a > 0) {
                if ( (typeof that.options.dayEle).toLowerCase() === 'string' ) {
                    var formatD = oTimeLast.d;
                    if (oTimeLast.d < 10 ){
                        formatD = '0' + oTimeLast.d
                    }
                    $timeBox.find(that.options.dayEle).text(formatD);
                }

                if ( (typeof that.options.hourEle).toLowerCase() === 'string' ) {
                    var formatH = oTimeLast.h;
                    if (oTimeLast.h < 10 ){
                        formatH = '0' + oTimeLast.h
                    }
                    $timeBox.find(that.options.hourEle).text(formatH);
                }

                if ( (typeof that.options.minEle).toLowerCase() === 'string' ) {
                    var formatM = oTimeLast.m;
                    if (oTimeLast.m < 10 ){
                        formatM = '0' + oTimeLast.m
                    }
                    $timeBox.find(that.options.minEle).text(formatM);
                }

                if ( (typeof that.options.secEle).toLowerCase() === 'string' ) {
                    var formatS = oTimeLast.s;
                    if (oTimeLast.s < 10 ){
                        formatS = '0' + oTimeLast.s
                    }
                    $timeBox.find(that.options.secEle).text(formatS);
                }

                if ( (typeof that.options.msEle).toLowerCase() === 'string' ) {
                    var formatMS = oTimeLast.ms;

                    if (oTimeLast.ms < 10 ){
                        formatMS = '0' + oTimeLast.ms
                    }
                    $timeBox.find(that.options.msEle).text(formatMS);
                }
            } else {
                $timeBox.find(that.options.dayEle).text('00');
                $timeBox.find(that.options.hourEle).text('00');
                $timeBox.find(that.options.minEle).text('00');
                $timeBox.find(that.options.secEle).text('00');
                $timeBox.find(that.options.msEle).text('00');
            }
        },

        /**
         * 由普通时间格式转化为毫秒时间
         * @return {Number}
         */
        dateToMillisecond: function () {
            var oTime = $(this.element).attr('data-endTime');
            return (new Date(oTime)).getTime();
        },

        /**
         * 计算时间差，并且返回天、时、分、秒、毫秒
         * @return {{d: Number, h: Number, m: Number, s: Number, ms: Number}}
         */
        timeRange: function () {
            var that = this,
                sTime = parseInt(that.serverTime),    // 当前服务器时间
                eTime = parseInt(that.dateToMillisecond()),   // 结束时间
                lastTime = eTime - sTime;       // 毫秒时间差

            var ldd = parseInt( lastTime / 1000 / 60 / 60 / 24, 10),    // 剩余天
                lhh = parseInt( lastTime / 1000 / 60 / 60 % 24, 10 ),   // 剩余时
                lmm = parseInt( lastTime / 1000 / 60 % 60, 10),         // 剩余分
                lss = parseInt( lastTime / 1000 % 60, 10),             // 剩余秒
                lms = parseInt( lastTime % 1000 / 10, 10 );                 // 剩余毫秒

            return {'d': ldd, 'h': lhh, 'm': lmm, 's': lss, 'ms': lms, 'a': lastTime}
        },

        /**
         * 刷新时间的显示
         */
        refreshTime: function () {
            var that = this;
            var _ex = 1000;
            if ( (typeof that.options.msEle).toLowerCase() === 'string' ) {
                _ex = 10;
            }
            var siTime = setInterval(function(){
                if (that.timeRange().a > 0) {
                    that.serverTime += _ex;
                    that.renderTime();
                } else {
                    if ((typeof that.options.callback).toLowerCase() === 'function') {
                        that.options.callback.call(that);
                    }
                    clearInterval(siTime);
                }
            }, _ex);
        }

    }

    $.fn.mTimeLast = function (options){
        return this.each(function () {
            new TimeLast(this, options);
        });
    }
})( jQuery, window, document );
