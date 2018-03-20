import declare from 'dojo/_base/declare';
import lang from 'dojo/_base/lang';

import BaseWidget from 'jimu/BaseWidget';

import KMLLayer from 'esri/layers/KMLLayer';
import graphicsUtils from 'esri/graphicsUtils';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import UniqueValueRenderer from 'esri/renderers/UniqueValueRenderer';
import InfoTemplate from 'esri/InfoTemplate';
import esriRequest from 'esri/request';
import webMercatorUtils from 'esri/geometry/webMercatorUtils';
import graphic from 'esri/graphic';
import Point from 'esri/geometry/Point';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import Color from 'esri/Color';
import Graphic from 'esri/graphic';


export default declare([BaseWidget], {

	baseClass: 'london-widget',
	estacionesGraphicsLayer: null,

	postCreate () {
		this.inherited(arguments);
		console.log('LondonAPI::postCreate');
	},

	loadStations(){

		var kmlUrl = 'http://data.tfl.gov.uk/tfl/syndication/feeds/stations.kml?app_id=' + this.config.appID + '&app_key=' + this.config.appKey;

		var kmlLayer = new KMLLayer(kmlUrl);
		this.map.addLayer(kmlLayer);

		kmlLayer.on("load", lang.hitch(this, function(evt) {
			var kmlExtent = graphicsUtils.graphicsExtent(evt.layer.getLayers()[0].graphics);
			this.map.setExtent(kmlExtent.expand(2));
		}));

	},

	loadBiciMad(){

		this.estacionesGraphicsLayer = new GraphicsLayer();
		var renderer = new UniqueValueRenderer(new SimpleMarkerSymbol(), "activate");
		renderer.addValue("0", new SimpleMarkerSymbol().setColor(new Color([255, 0, 0, 1])));
		renderer.addValue("1", new SimpleMarkerSymbol().setColor(new Color([0, 255, 0, 1])));
		this.estacionesGraphicsLayer.setRenderer(renderer);
							
		var infoTemplate = new InfoTemplate("${name}", "Dirección: ${address} <br /> Total de bases: ${total_bases} <br /> Bicis disponibles: ${dock_bikes} <br /> Bases vacías: ${free_bases}");
		this.estacionesGraphicsLayer.setInfoTemplate(infoTemplate);

		this.map.addLayer(this.estacionesGraphicsLayer);

		var url = "https://rbdata.emtmadrid.es:8443/BiciMad/get_stations/WEB.SERV.antonio.remirez@esri.es/139B110B-D944-4834-9C26-583213F97303/";

		var requestHandle = esriRequest({
			"url": url
		});
		requestHandle.then(lang.hitch(this, this.requestSucceeded), lang.hitch(this, this.requestFailed));
	},
  
	requestSucceeded(response){
		if(response.data){
			this.fetchData(JSON.parse(response.data).stations);
		}
	},

	requestFailed(error){
		console.log(error);
	},

	fetchData(stations){

		for(var i = 0; i < stations.length; i++){
			
			var geometry = webMercatorUtils.lngLatToXY(stations[i].longitude, stations[i].latitude);
			var pt = new Point(geometry[0],geometry[1], this.map.spatialReference);
			
			var attr = {"name":stations[i].name, "number":stations[i].number, "address":stations[i].address, "activate": stations[i].activate, "total_bases": stations[i].total_bases,"dock_bikes": stations[i].dock_bikes,"free_bases": stations[i].free_bases};

			var gr = new Graphic(pt, null, attr);

			this.estacionesGraphicsLayer.add(gr);
		}
		
		var biciMadExtent = graphicsUtils.graphicsExtent(this.estacionesGraphicsLayer.graphics);
		this.map.setExtent(biciMadExtent.expand(2));
	},

	ConvertDMSToDD(degrees, minutes, seconds, direction) {
		var dd = degrees + minutes/60 + seconds/(60*60);

		if (direction == "S" || direction == "W") {
			dd = dd * -1;
		} // Don't do anything for N or E
		return dd;
	}

  
});
