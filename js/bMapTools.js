/**
 *
 * User: @williamDong
 * Create Time: 13-3-28 上午9:54
 * Version: 0.1
 * API: $('#maId').bMapTools({
 *     type: 'pin',                             // 工具功能： 'pin': 修改及设置坐标位置， 'show': 显示覆盖物信息
 *     pinLocation: 'hiddenId',                 // 用于保存设置坐标点的hidden 元素id
 *     pinTrigger: 'setLocation',              // 设置点击的设置坐标点的元素id
 *     showTip: {                               // 用于估计返回的ajax信息，显示相关的覆盖物
 *          ajaxURL: ''
 *      }
 * });
 */
;(function( $, window, document, undefined ) {
    var defaults = {
        type: 'pin',
        pinLocation: 'mapInfo',
        pinTrigger: 'setLocation',
        showTip: {ajaxURL: ''}
    };

    function BMapTools ( element, option ) {
        this.element = element;
        this.options = $.extend( {}, defaults, option );
        this.ajaxData = null;
        this.point = null;      // 经纬度信息
        this.marker = null;      // 经纬度信息
        window.BMT_Map = this.map = new BMap.Map( element );
        this.init();

    }

    BMapTools.prototype = {
        init: function() {
            this.pinInitTools();
            this.showMapArea();
        },

        /**
         * 追加地图标注所需的markerTool javascript 文件
         */
        appendJS: function() {
            if(this.options.type === 'pin') {
                var _scriptLink = document.createElement("script");
                _scriptLink.type="text/javascript";
                _scriptLink.src="/public/js/garten/markerTool.js";
                document.getElementsByTagName("head")[0].appendChild(_scriptLink);
            }
        },

        /**
         * 加载初始化地图位置定位的相关工具
         */
        pinInitTools: function () {
            var that = this;
            if(that.options.type === 'pin') {
                var $valSaved = $('#' +that.options.pinLocation).val();
                that.mkrTool = new BMapLib.MarkerTool(that.map, {autoClose: true}); // 地图工具
                that.map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL}));      // 添加控件

                if ( $valSaved.length ) {    // 判断是否已经设置了初始坐标位置
                    var logLat = $valSaved.split(','),
                        _log = logLat[0],
                        _lan = logLat[1];

                    that.map.centerAndZoom(new BMap.Point(_log, _lan), 14);
                    that.marker = new BMap.Marker(new BMap.Point(_log, _lan));  // 创建标注

                    that.map.addOverlay(that.marker);              // 将标注添加到地图中
                } else {        // 未设置则显示当前大概位置
                    that.map.centerAndZoom("浙江省杭州市西湖区",12);
                }
                that.pinEvent();
            }
        },

        /**
         * 设置坐标点的相关事件
         */
        pinEvent: function() {
            var that = this,
                mk = null;
            // 点击开始选择标注
            (function () {
                $('#'+ that.options.pinTrigger).on('click', function(){
                    var icon = BMapLib.MarkerTool.SYS_ICONS[2];     //设置工具样式，使用系统提供的样式BMapLib.MarkerTool.SYS_ICONS[0] - [23]
                    var $mp = $(that.map.getPanes().markerPane);
                    that.mkrTool.open();     //打开工具
                    $(this).hide();
                    that.mkrTool.setIcon(icon);
                    $(that.element).attr('data-selecting', 'on');

                    //移除上次的标注点
                    that.map.removeOverlay(that.marker);
                    for(var i = 0, len = $mp.find('.BMap_Marker').length; i < len; i++) {
                        var _z = $mp.find('.BMap_Marker').eq(i).css('z-index');
                        if (_z < 0 && len > 1) {
                            $mp.find('.BMap_Marker').eq(i).remove();
                        }
                    }

                });
            })();

            // 标注添加完成
            (function(){
                that.mkrTool.addEventListener("markend", function(event){
                    $(that.element).attr('data-selecting', 'off');
                    $('#'+ that.options.pinTrigger).show();
                    that.mkrTool.close();
                });
                that.map.addEventListener("click", function(event){
                    if($(that.element).attr('data-selecting') == 'on'){
                        $('#' + that.options.pinLocation ).val(event.point.lng+','+ event.point.lat);
                    }
                });
            })();
        },

        /**
         * 显示地图区域
         */
        showMapArea: function() {
            var that = this;
            if(that.options.type === 'show') {
                that.ajaxTipInfo();
                var _tipInfo = that.ajaxData,
                    _log = _tipInfo.log,
                    _lat = _tipInfo.lat;
                var centerPoint = new BMap.Point( _log, _lat );
                that.map.centerAndZoom(centerPoint, 14);

                that.showInfo();
            }
        },

        /**
         * 显示覆盖物的信息
         */
        showInfo: function() {
            var that = this;
            var mOverlay = new BMapOverLay( $(that.element), that.map, this.point, this.ajaxData.info );
            that.map.addOverlay(mOverlay);
        },

        /**
         * ajax 获取地图的相关信息
         */
        ajaxTipInfo: function() {
            var that = this,
                _url = that.options.showTip.ajaxURL;
            $.ajax({
                url: _url,
                type: 'get',
                dataType: 'json',
                async: false,
                success: function( JSONData ) {
                    if (JSONData.status && JSONData.status == 1) {
                        if(JSONData.data) {
                            that.ajaxData = JSONData.data;
                            that.point = new BMap.Point(JSONData.data.log, JSONData.data.lat);
                        }
                    }
                }
            });
        }

    };

    /**
     *
     * @param element   地图id
     * @param bmap      new bMap
     * @param point     经纬度
     * @param layText   提示信息
     * @constructor
     */
    function BMapOverLay ( element, bmap, point, layText ) {
        this.element = element;
        this.map = bmap;
        this.point = point;
        this.layText = layText;
    }

    BMapOverLay.prototype = new BMap.Overlay();

    /**
     * 初始化绘制覆盖物
     */
    BMapOverLay.prototype.initialize = function () {
        var _id = this._id =  this.element.attr('id') + '_ovl',
            _html = this._html = '<div id="'+_id+'" class="mapSchoolTip"><div class="mapSchoolBD"">'+this.layText+'</div><div class="mapSchoolTipArrow"><span></span></div></div>';
        $(this.map.getPanes().labelPane).append(_html);
    }

    /**
     * 将地图坐标信息转成left，top的形式
     */
    BMapOverLay.prototype.draw = function () {
        var pixel = this.map.pointToOverlayPixel(this.point);   // 坐标位置转换成像素位置
        $('#' + this._id).css({
            'left': pixel.x - 120 + 'px',
            'top': pixel.y - 103 + 'px'
        });
    }


    $.fn.bMapTools = function( option ){
        return this.each(function(){
            var bdMap = new BMapTools( this, option );
        });
    };

})( jQuery, window, document );
