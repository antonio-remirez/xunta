define(['dojo/_base/declare', 'jimu/BaseWidget','esri/layers/WMSLayer', 'esri/config', 'dojo/request'],
function(declare, BaseWidget, WMSLayer, esriConfig, request) {

	var clazz = declare([BaseWidget], {
	
		name: 'WMSLoader',
		baseClass: 'jimu-widget-wmsloader',
		addWMS: function(){
	        if(this.wmsTextBox.value && this.wmsTextBox.value != "")
	        {
				//esriConfig.defaults.io.proxyUrl = this.config.proxyUrl;
	        	var wmsLayer = new WMSLayer(this.wmsTextBox.value, {
            		format: "png",
            		visibleLayers: [0]
          		});
          		wmsLayer.on("load", function(layer){
					if(layer.layer.layerInfos.length > 0)
					{
						var visibleLayers = [];
						for(var i = 0; i < layer.layer.layerInfos.length; i++)
						{
							visibleLayers.push(i);
						}
						wmsLayer.setVisibleLayers(visibleLayers);
					}
				});
	        	this.map.addLayer(wmsLayer);
	        }
      	}
	});
	
	return clazz;
});
