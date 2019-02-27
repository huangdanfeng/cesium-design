document.getElementById('checkbox3').addEventListener('change', function (e) {
    if (this.checked) {
        viewer.screenSpaceEventHandler.setInputAction(leftClick3, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
        viewer.screenSpaceEventHandler.setInputAction(undefined, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}, false);

// var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

var particleSystem;

function leftClick3(movement) {
    var cartesian = viewer.scene.pickPosition(movement.position);  
    if (Cesium.defined(cartesian)) {  
        // clickHandler(movement);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);  
        var lng = Cesium.Math.toDegrees(cartographic.longitude);  
        var lat = Cesium.Math.toDegrees(cartographic.latitude);  
        var height = cartographic.height;//模型高度  
        firePosition={x:lng,y:lat,z:height}  
    }  

    particleSystem = viewer.scene.primitives.add(new Cesium.ParticleSystem({
        image : './Source/Images/fire.png',
        imageSize : new Cesium.Cartesian2(20, 20),
        startScale : 1.0,
        endScale : 4.0,
        particleLife : 1.0,
        speed : 5.0,            //粒子速度
        emitter : new Cesium.CircleEmitter(0.5),   //粒子系统的粒子发射器； 包括四种发射器：圆形 CircleEmitter、锥体 ConeEmitter、球体 SphereEmitter、长方体 BoxEmitter
        emissionRate : 5.0,     //每秒发射的粒子数
        modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(firePosition.x,firePosition.y,firePosition.z)
        ),
        lifetime : 16.0,   //粒子系统会发射多久粒子，以秒为单位。默认为最大值 16
        // emissionRate: 10   //每秒发射的粒子数
    }));
}


///////////////////////////////////////////////////////////////////
//复原
///////////////////////////////////////////////////////////////////
$('#restore_btn3').click(function () { 
    viewer.scene.primitives._primitives.map(function(item,index){
        if(item.image == "./Source/Images/fire.png"){
            item.destroy();
        }
    })
});
