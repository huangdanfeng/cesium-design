var scene = viewer.scene;
var canvas = viewer.canvas;

//弹窗

var step = 0.10;
function change(type) {
    if(type == 0) {
        ajustHeight1("mul")
    } else if(type == 1){
        ajustHeight1();
    }else if(type == 2){

    }else if(type == 3){

    }else if(type == 4){
        ajustHeight("mul");
    }else if(type == 5){
        ajustHeight();
    }
    /*var modelMatrix =
        Cesium.Cartesian3.fromDegrees(x, y, z);
    tileset.modelMatrix = modelMatrix;*/

}

var heightOffset=0;
//此处为调整模型高度的函数
function ajustHeight(type){
    if(type == "mul"){

    heightOffset+=10;
    }else{
        heightOffset-=10;
    }
    var boundingSphere = tileset.boundingSphere;
    var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

}


//屏幕点击
var a = []
var selected = {
    feature: [],
    originalColor: new Cesium.Color()
};
var ellipsoid = viewer.scene.globe.ellipsoid;
/*
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    /!*var pickedFeature = viewer.scene.pick(movement.position);
    var con = []
    if(pickedFeature){

        var name = pickedFeature.getProperty("name")
        a.push(name)
    }
    for(var i=0; i<a.length;i++) {
        con.push(['(${name} ==="' + a[i]+ '")', 'false'])
    }
    con.push(['true', "color('white')"])
    console.log(a,con)
    console.log(con)
    console.log(pickedFeature)
    //if(selected.feature != pickedFeature) {
    selected.feature = pickedFeature;*!/
    // Cesium.Color.clone(pickedFeature.color, new Cesium.Color());
    //pickedFeature.color = Cesium.Color.YELLOW;
    //}
    console.log(name)
    /!*if(name){

        pickedFeature.tileset.style = new Cesium.Cesium3DTileStyle({
            color : {
                conditions:[
                    ['${name} ==="' + name+ '"', 'rgb(255, 0, 0)'],
                    ['true','color("white")']
                ]
            },
            show:
                {
                    conditions:con
                },

        });
    }*!/
    //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
    if (cartesian) {
        //将笛卡尔坐标转换为地理坐标
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        //将弧度转为度的十进制度表示
        longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        //获取相机高度
        height = Math.ceil(viewer.camera.positionCartographic.height);
    }
    console.log(longitudeString,latitudeString,height)
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
*/


var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
var stop = Cesium.JulianDate.addSeconds(start, 40, new Cesium.JulianDate());

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 5;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop);

//Generate a random circular pattern with varying heights.
function computeCirclularFlight(lon, lat, radius) {
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i <= 40; i++) {
        var radians = Cesium.Math.toRadians(i); //将度数转换为弧度
        var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        var position = Cesium.Cartesian3.fromDegrees(lon -(i/1000) , lat ,0);
        property.addSample(time, position);//添加新样本

    }
    return property;
}

//Compute the entity position property.
var position = computeCirclularFlight(116.39981753862487, 39.91000798134587, 0.03);
var entity = viewer.entities.add({
    name : 'Red line on terrain',
    availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start : start,
        stop : stop
    })]),
    //Use our computed positions
    position : position,

    //Automatically compute orientation based on position movement.
    orientation : new Cesium.VelocityOrientationProperty(position),
    /*polyline : {
        positions : Cesium.Cartesian3.fromDegreesArray([116.39981753862487, 39.91000798134587,
            116.37981753862487, 39.91000798134587]),
        width : 5,
        material : Cesium.Color.RED,
        clampToGround : true
    },*/
    //Load the Cesium plane model to represent the entity
    model : {
        uri : './model/GroundVehicle.glb',
        minimumPixelSize : 64
    },
});
function computeCirclularFlights(lon, lat, radius) {
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i <= 40; i+=10) {

        var radians = Cesium.Math.toRadians(i); //将度数转换为弧度
        var position = Cesium.Cartesian3.fromDegrees(lon, lat ,0);
        /*if(i==10){

        radians = Cesium.Math.toRadians(90); //将度数转换为弧度
        var position = Cesium.Cartesian3.fromDegrees(lon, lat + (radius * Math.sin(radians)/1.2) ,0);
        }else if(i==20){
            radians = Cesium.Math.toRadians(180); //将度数转换为弧度
        var position = Cesium.Cartesian3.fromDegrees(lon+ (radius * Math.cos(radians)), lat + (radius * Math.sin(Cesium.Math.toRadians(90))/1.2) ,0);
        }else if(i==30){
            radians = Cesium.Math.toRadians(270); //将度数转换为弧度
        var position = Cesium.Cartesian3.fromDegrees(lon+ (radius * Math.cos(Cesium.Math.toRadians(180))), lat + (radius * Math.sin(Cesium.Math.toRadians(radians))/1.2) ,0);
        }else{
            radians = Cesium.Math.toRadians(360); //将度数转换为弧度
        var position = Cesium.Cartesian3.fromDegrees(lon, lat ,0);

        }*/

        if(i==10){

            var position = Cesium.Cartesian3.fromDegrees(lon, 39.91916254314275 ,0);
        }else if(i==20){
            var position = Cesium.Cartesian3.fromDegrees(116.37493271365149, 39.91916254314275 ,0);
        }else if(i==30){
            var position = Cesium.Cartesian3.fromDegrees(116.37493271365149, 39.910912035899344 ,0);
        }else{
            var position = Cesium.Cartesian3.fromDegrees(lon, lat ,0);

        }
        var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        //var position = Cesium.Cartesian3.fromDegrees(lon + (radius * Math.cos(radians)), lat + (radius * Math.sin(radians)/1.5) ,0);
        property.addSample(time, position);//添加新样本

    }
    return property;
}

//Compute the entity position property.
//var positions = computeCirclularFlights(116.39981753862487, 39.91000798134587, 0.01);
var positions = computeCirclularFlights(116.40298611564276, 39.910912035899344, 0.01);
var entitys = viewer.entities.add({
    name : 'Red line on terrain',
    availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start : start,
        stop : stop
    })]),
    //Use our computed positions
    position : positions,

    //Automatically compute orientation based on position movement.
    orientation : new Cesium.VelocityOrientationProperty(positions),
    /*path : {
        resolution : 1,
        material : new Cesium.PolylineGlowMaterialProperty({
            glowPower : 0.1,//发光强度
            color : Cesium.Color.YELLOW
        }),
        width : 10
    },*/
    //Load the Cesium plane model to represent the entity
    model : {
        uri : './model/GroundVehicle.glb',
        minimumPixelSize : 64
    },
});