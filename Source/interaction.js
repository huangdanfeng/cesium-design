(function () {

  var scene = viewer.scene;

  ///////////////////////////////////////////////////////////////////
  //键盘事件 控制wsadqe实现漫游模式
  ///////////////////////////////////////////////////////////////////
  var flags = {
    moveForward: false,
    moveBackward: false,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false
  };

  function getFlagForKeyCode(keyCode) {
    switch (keyCode) {
      case 'W'.charCodeAt(0):
        return 'moveForward';
      case 'S'.charCodeAt(0):
        return 'moveBackward';
      case 'Q'.charCodeAt(0):
        return 'moveUp';
      case 'E'.charCodeAt(0):
        return 'moveDown';
      case 'D'.charCodeAt(0):
        return 'moveRight';
      case 'A'.charCodeAt(0):
        return 'moveLeft';
      default:
        return undefined;
    }
  }

  document.addEventListener('keydown', function (e) {
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
      flags[flagName] = true;
    }
  }, false);

  document.addEventListener('keyup', function (e) {
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
      flags[flagName] = false;
    }
  }, false);

  viewer.clock.onTick.addEventListener(function (clock) {
    var camera = viewer.camera;
    var ellipsoid = scene.globe.ellipsoid;
    var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
    var moveRate = cameraHeight / 50.0;

    if (flags.moveForward) {
      camera.moveForward(moveRate);
    }
    if (flags.moveBackward) {
      camera.moveBackward(moveRate);
    }
    if (flags.moveUp) {
      camera.moveUp(moveRate);
    }
    if (flags.moveDown) {
      camera.moveDown(moveRate);
    }
    if (flags.moveLeft) {
      camera.moveLeft(moveRate);
    }
    if (flags.moveRight) {
      camera.moveRight(moveRate);
    }
  });


  ///////////////////////////////////////////////////////////////////
  //鼠标事件
  ///////////////////////////////////////////////////////////////////
  var deletedFeatures = ''; //记录删除的部件

  //点击鼠标左键选中部件
  var selectedEntity = new Cesium.Entity();
  var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

  function leftClick(movement) {
    var pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
      clickHandler(movement);
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ['true', "color('white')"]
          ]
        },
        show: "!(regExp(${name}) =~ '" + deletedFeatures + "')"
      });
      return;
    }
    var featureName = pickedFeature.getProperty('name');
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ["${name} === '" + featureName + "'", "color('blue')"],
          ['true', "color('white')"]
        ]
      },
      show: "!(regExp(${name}) =~ '" + deletedFeatures + "')"
    });

    //信息框
    selectedEntity.name = featureName;
    viewer.selectedEntity = selectedEntity;
  }

  function rightClick(movement) {
    var pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
      return;
    }
    var featureName = pickedFeature.getProperty('name');
    deletedFeatures += featureName + ';';
    tileset.style = new Cesium.Cesium3DTileStyle({
      show: "!(regExp(${name}) =~ '" + deletedFeatures + "')"
    });
  }

  document.getElementById('checkbox').addEventListener('change', function (e) {
    if (this.checked) {
      viewer.screenSpaceEventHandler.setInputAction(leftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      viewer.screenSpaceEventHandler.setInputAction(rightClick, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    } else {
      viewer.screenSpaceEventHandler.setInputAction(undefined, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      viewer.screenSpaceEventHandler.setInputAction(undefined, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }, false);

  ///////////////////////////////////////////////////////////////////
  //复原
  ///////////////////////////////////////////////////////////////////
  document.getElementById('restore_btn').addEventListener('click', function () {
    deletedFeatures = '';
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: "color('white')",
      show: "true"
    });
  }, false);

  ///////////////////////////////////////////////////////////////////
  //统计
  ///////////////////////////////////////////////////////////////////
  var myChart = echarts.init(document.getElementById('chart_canvas'));
  var option = {
    title: {
      text: 'ECharts示例'
    },
    tooltip: {},
    legend: {
      data:['销量']
    },
    xAxis: {
      data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }]
  };

  myChart.setOption(option);

  document.getElementById('chart_btn').addEventListener('click', function () {
    document.getElementById('chart_box').style.display = 'block';
  }, false);

  document.getElementById('chart_close').addEventListener('click', function () {
    document.getElementById('chart_box').style.display = 'none';
  }, false);
}());

