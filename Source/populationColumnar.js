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


function WebGLGlobeDataSource(name) {
    //All public configuration is defined as ES5 properties
    //These are just the "private" variables and t+heir defaults.
    this._name = name;
    this._changed = new Cesium.Event();
    this._error = new Cesium.Event();
    this._isLoading = false;
    this._loading = new Cesium.Event();
    this._entityCollection = new Cesium.EntityCollection();
    this._seriesNames = [];
    this._seriesToDisplay = undefined;
    this._heightScale = 10000000;
    this._entityCluster = new Cesium.EntityCluster();
}

Object.defineProperties(WebGLGlobeDataSource.prototype, {
    //The below properties must be implemented by all DataSource instances

    
    name : {
        get : function() {
            return this._name;
        }
    },
   
    clock : {
        value : undefined,
        writable : false
    },
  
    entities : {
        get : function() {
            return this._entityCollection;
        }
    },
   
    isLoading : {
        get : function() {
            return this._isLoading;
        }
    },
   
    changedEvent : {
        get : function() {
            return this._changed;
        }
    },
    
    errorEvent : {
        get : function() {
            return this._error;
        }
    },
   
    loadingEvent : {
        get : function() {
            return this._loading;
        }
    },

    //These properties are specific to this DataSource.

  
    seriesNames : {
        get : function() {
            return this._seriesNames;
        }
    },
 
    seriesToDisplay : {
        get : function() {
            return this._seriesToDisplay;
        },
        set : function(value) {
            this._seriesToDisplay = value;

            //Iterate over all entities and set their show property
            //to true only if they are part of the current series.
            var collection = this._entityCollection;
            var entities = collection.values;
            collection.suspendEvents();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.show = value === entity.seriesName;
            }
            collection.resumeEvents();
        }
    },
  
    heightScale : {
        get : function() {
            return this._heightScale;
        },
        set : function(value) {
            if (value > 0) {
                throw new Cesium.DeveloperError('value must be greater than 0');
            }
            this._heightScale = value;
        }
    },
  
    show : {
        get : function() {
            return this._entityCollection;
        },
        set : function(value) {
            this._entityCollection = value;
        }
    },
   
    clustering : {
        get : function() {
            return this._entityCluster;
        },
        set : function(value) {
            if (!Cesium.defined(value)) {
                throw new Cesium.DeveloperError('value must be defined.');
            }
            this._entityCluster = value;
        }
    }
});


WebGLGlobeDataSource.prototype.loadUrl = function(url) {
    if (!Cesium.defined(url)) {
        throw new Cesium.DeveloperError('url is required.');
    }

    //Create a name based on the url
    var name = Cesium.getFilenameFromUri(url);

    //Set the name if it is different than the current name.
    if (this._name !== name) {
        this._name = name;
        this._changed.raiseEvent(this);
    }

    //Use 'when' to load the URL into a json object
    //and then process is with the `load` function.
    var that = this;
    return Cesium.Resource.fetchJson(url).then(function(json) {
        return that.load(json, url);
    }).otherwise(function(error) {
        //Otherwise will catch any errors or exceptions that occur
        //during the promise processing. When this happens,
        //we raise the error event and reject the promise.
        this._setLoading(false);
        that._error.raiseEvent(that, error);
        return Cesium.when.reject(error);
    });
};

WebGLGlobeDataSource.prototype.load = function(data) {
    //>>includeStart('debug', pragmas.debug);
    if (!Cesium.defined(data)) {
        throw new Cesium.DeveloperError('data is required.');
    }
    //>>includeEnd('debug');

    //Clear out any data that might already exist.
    this._setLoading(true);
    this._seriesNames.length = 0;
    this._seriesToDisplay = undefined;

    var heightScale = this.heightScale;
    var entities = this._entityCollection;

    //It's a good idea to suspend events when making changes to a
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    entities.suspendEvents();
    entities.removeAll();

    //WebGL Globe JSON is an array of series, where each series itself is an
    //array of two items, the first containing the series name and the second
    //being an array of repeating latitude, longitude, height values.
    //
    //Here's a more visual example.
    //[["series1",[latitude, longitude, height, ... ]
    // ["series2",[latitude, longitude, height, ... ]]

    // Loop over each series
    for (var x = 0; x < data.length; x++) {
        var series = data[x];
        var seriesName = series[0];
        var coordinates = series[1];

        //Add the name of the series to our list of possible values.
        this._seriesNames.push(seriesName);

        //Make the first series the visible one by default
        var show = x === 0;
        if (show) {
            this._seriesToDisplay = seriesName;
        }

        //Now loop over each coordinate in the series and create
        // our entities from the data.
        for (var i = 0; i < coordinates.length; i += 3) {
            var latitude = coordinates[i];
            var longitude = coordinates[i + 1];
            var height = coordinates[i + 2];

            //Ignore lines of zero height.
            if(height === 0) {
                continue;
            }

            var color = Cesium.Color.fromHsl((0.6 - (height * 0.5)), 1.0, 0.5);
            var surfacePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
            var heightPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height * heightScale);

            //WebGL Globe only contains lines, so that's the only graphics we create.
            var polyline = new Cesium.PolylineGraphics();
            polyline.material = new Cesium.ColorMaterialProperty(color);
            polyline.width = new Cesium.ConstantProperty(2);
            polyline.followSurface = new Cesium.ConstantProperty(false);
            polyline.positions = new Cesium.ConstantProperty([surfacePosition, heightPosition]);

            //The polyline instance itself needs to be on an entity.
            var entity = new Cesium.Entity({
                id : seriesName + ' index ' + i.toString(),
                show : show,
                polyline : polyline,
                seriesName : seriesName //Custom property to indicate series name
            });

            //Add the entity to the collection.
            entities.add(entity);
        }
    }

    //Once all data is processed, call resumeEvents and raise the changed event.
    entities.resumeEvents();
    this._changed.raiseEvent(this);
    this._setLoading(false);
};

WebGLGlobeDataSource.prototype._setLoading = function(isLoading) {
    if (this._isLoading !== isLoading) {
        this._isLoading = isLoading;
        this._loading.raiseEvent(this, isLoading);
    }
};

//Now that we've defined our own DataSource, we can use it to load
//any JSON data formatted for WebGL Globe.
var dataSource = new WebGLGlobeDataSource();
dataSource.loadUrl('./Source/json/population909500.json').then(function() {

    //After the initial load, create buttons to let the user switch among series.
    function createSeriesSetter(seriesName) {
        return function() {
            dataSource.seriesToDisplay = seriesName;
        };
    }

    for (var i = 0; i < dataSource.seriesNames.length; i++) {
        var seriesName = dataSource.seriesNames[i];
        Sandcastle.addToolbarButton(seriesName, createSeriesSetter(seriesName));
    }
});

//Create a Viewer instances and add the DataSource.
// var viewer = new Cesium.Viewer('cesiumContainer', {
//     animation : false,
//     timeline : false
// });
viewer.dataSources.add(dataSource);


// 鼠标事件

var isBarShow = true;

document.getElementById('toolbar_btn').addEventListener('click', function () {
       var camera = viewer.camera;

        flyTo(100, 50, 25069999, 10, -80, 100)
        //3变远了 4变大了6变黑了

       // console.log(dataSource.show)


        if(isBarShow){
            dataSource.show.show = true
        }else{
            dataSource.show.show = false
        }
       isBarShow = !isBarShow;


  }, false);

}())