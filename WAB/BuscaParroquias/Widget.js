define(['dojo/_base/declare', 
        'jimu/BaseWidget',
        'dojo/_base/lang',
        "esri/tasks/query", 
        "esri/tasks/QueryTask",
        "esri/SpatialReference",
        "esri/graphic",
        "esri/symbols/SimpleFillSymbol"
      ],
function(declare, BaseWidget, lang, Query, QueryTask, SpatialReference, Graphic, SimpleFillSymbol) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    baseClass: 'test-xunta-widget',

    postCreate: function() {
      this.inherited(arguments);
      console.log('TestXuntaWidget::postCreate');
    },

    
    cargaConcellos: function() {  
      
      // recogemos el código de provincia seleccionado
      var codigoProvincia = document.getElementById("selectProvincia").value;
      if(codigoProvincia == -1) return;
      
      // limpiamos el combo de concellos
      document.getElementById("selectConcellos").innerHTML = "";

      // cogemos la URL del fichero de configuracion
      var queryTask = new QueryTask(this.config.concellosService);

      // Establecemos los parámetros correctos
      var query = new Query();
      query.returnGeometry = false;
      query.outFields = ["CODCONC", "CONCELLO"];
      query.orderByFields = ["CONCELLO"];
      query.where = "CODPROV = " + codigoProvincia;

      queryTask.execute(query, function(results){

        // creamos la opción por defecto (-1)
        var selectConcellos = document.getElementById("selectConcellos");
        var opt = document.createElement("option");
        opt.value = -1;
        opt.text = "Seleccione concello";
        selectConcellos.add(opt);

        // para cada concello creamos la option correspondiente en el combo según la consulta
        for (var i = 0; i < results.features.length; i++) {
            var opt = document.createElement("option");
            opt.value = results.features[i].attributes.CODCONC;
            opt.text = results.features[i].attributes.CONCELLO;
            selectConcellos.add(opt);
        }

        // mostramos los concellos y ocultamos parroquias
        document.getElementById("trConcellos").style.display = "block";
        document.getElementById("trParroquias").style.display = "none";

      });

    },

    cargaParroquias: function() {
      
      // recogemos el código de concello seleccionado
      var codigoConcello = document.getElementById("selectConcellos").value;
      if(codigoConcello == -1) return;
      
      // limpiamos el combo de parroquias
      document.getElementById("selectParroquias").innerHTML = "";

      // cogemos la URL del fichero de configuracion
      var queryTask = new QueryTask(this.config.parroquiasService);

      // la consulta que hacemos será 
      var query = new Query();
      query.returnGeometry = false;
      query.outFields = ["CODPARRO", "PARROQUIA"];
      query.orderByFields = ["PARROQUIA"];
      query.where = "CODCONC = " + codigoConcello;

      queryTask.execute(query, function(results){
        
        // añadimos la primera opción
        var selectParroquias = document.getElementById("selectParroquias");
        var opt = document.createElement("option");
        opt.value = -1;
        opt.text = "Seleccione parroquia";
        selectParroquias.add(opt);
        for (var i = 0; i < results.features.length; i++) {
            opt = document.createElement("option");
            opt.value = results.features[i].attributes.CODPARRO;
            opt.text = results.features[i].attributes.PARROQUIA;
            selectParroquias.add(opt);
        }
        document.getElementById("trParroquias").style.display = "block";
      });
    },

    zoomConcello: function() {

      // recogemos el código de provincia seleccionado
      var codigoConcello = document.getElementById("selectConcellos").value;
      if(codigoConcello == -1) return;
      
      // consultamos el servicio para obtener los concellos de la provincia      
      var queryTask = new QueryTask(this.config.concellosService);
      var query = new Query();
      query.returnGeometry = true;
      query.where = "CODCONC = " + codigoConcello;
      query.outSpatialReference = new SpatialReference(102100);

      queryTask.execute(query, lang.hitch(this, function(results){
        
        if(results.features.length > 0){
          var geom = results.features[0].geometry;
          this.map.graphics.clear();
          this.map.graphics.add(new Graphic(geom, new SimpleFillSymbol()));
          this.map.setExtent(geom.getExtent(), true);
        }

      }));

    },  

    zoomParroquia: function() {
      // recogemos el código de provincia seleccionado
      var codigoParroquia = document.getElementById("selectParroquias").value;
      if(codigoParroquia == -1) return;
      
      // consultamos el servicio para obtener los concellos de la provincia      
      var queryTask = new QueryTask(this.config.parroquiasService);
      var query = new Query();
      query.returnGeometry = true;
      query.where = "CODPARRO = " + codigoParroquia;
      query.outSpatialReference = new SpatialReference(102100);
      queryTask.execute(query, lang.hitch(this, function(results){
        if(results.features.length > 0){
          var geom = results.features[0].geometry;
          this.map.graphics.clear();
          this.map.graphics.add(new Graphic(geom, new SimpleFillSymbol()));
          this.map.setExtent(geom.getExtent(), true);
        }
      }));
    }


  });

});
