document.getElementById('checkbox2').addEventListener('change', function (e) {
    if (this.checked) {
        viewer.screenSpaceEventHandler.setInputAction(leftClick2, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
        viewer.screenSpaceEventHandler.setInputAction(undefined, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}, false);

// var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

function leftClick2(movement) {
    console.log(222)

    var infoDiv = '<div id="trackPopUp" style="display:none;">'+
    '<div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">'+
    '<a class="leaflet-popup-close-button" href="#">×</a>'+
    '<div class="leaflet-popup-content-wrapper">'+
        '<div id="trackPopUpLink" class="leaflet-popup-content" style="max-width: 300px;"></div>'+
        '<video class="video" src="./Source/Images/video.mp4" controls="controls"></video>'+
    '</div>'+
    '<div class="leaflet-popup-tip-container">'+
        '<div class="leaflet-popup-tip"></div>'+
    '</div>'+
    '</div>'+
    '</div>';

    $("#cesiumContainer").append(infoDiv);

    var pick = viewer.scene.pick(movement.position);
    if(Cesium.defined(pick) && pick.getPropertyNames) {
        console.log(pick.getPropertyNames())
    }else{
        $('#trackPopUp').hide();
        return 
    }
    // clickHandler(movement);

    $('#trackPopUp').show();

    //转地理坐标（弧度）
    // var cartographic = Cesium.Cartographic.fromCartesian(movement.position);

    // //地理坐标（弧度）转经纬度坐标
    // var point=[cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180];

    // //经纬度坐标转世界坐标
    // var destination=Cesium.Cartesian3.fromDegrees(point[0], point[1], 3000.0);

    // var content = pick.getProperty('name');
    var content = ''
    var obj = {position:movement.position,content:content};
    videoWindow(obj);
}

function videoWindow(obj) { 
    var pick = viewer.scene.pick(obj.position);
    if(Cesium.defined(pick)) {
        $(".cesium-selection-wrapper").show();
        $('#trackPopUpLink').empty();
        $('#trackPopUpLink').append(obj.content);
        function positionPopUp (c) {
            var x = c.x - ($('#trackPopUpContent').width()) / 2;
            var y = c.y - ($('#trackPopUpContent').height()) + 70;
            $('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
        }
        //屏幕坐标转世界坐标
        var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
        $('#trackPopUp').show();
        positionPopUp(c); 
        removeHandler = viewer.scene.postRender.addEventListener(function () {
            //cesium中常用的坐标有两种WGS84地理坐标系和笛卡尔空间坐标系(世界坐标)。我们平时常用的以经纬度来指明一个地点就是用的WGS84坐标，笛卡尔空间坐标系常用来做一些空间位置变换如平移旋转缩放等等。
            var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pick);  //世界坐标转屏幕坐标
            if(changedC && ((c.x !== changedC.x) || (c.y !== changedC.y))){
                positionPopUp(changedC);
                c = changedC;
            }
        })
    }
}

$('.leaflet-popup-close-button').click(function () { 
    $('#trackPopUp').hide();
 });

 ///////////////////////////////////////////////////////////////////
//复原
///////////////////////////////////////////////////////////////////
$('#restore_btn2').click(function () { 
    $('#trackPopUp').hide();
});

