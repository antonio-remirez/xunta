import declare from 'dojo/_base/declare';
import array from 'dojo/_base/array';
import lang from 'dojo/_base/lang';
import dom from 'dojo/dom';
import domConstruct from 'dojo/dom-construct';

import BaseWidget from 'jimu/BaseWidget';
import LayerInfors from 'jimu/LayerInfos/LayerInfos';

export default declare([BaseWidget], {

  baseClass: 'grid-legend',
  _infoCapasMapa: null,
  currentNode: null,

  postCreate() {
    this.inherited(arguments);
    this._infoCapasMapa = this._obtenerCapasMapa();
  },

  startup() {
        
    array.forEach(this._infoCapasMapa.itemData.operationalLayers, (layer) => {

      let obj = this._findNode(layer.title);
      let node = null;      
      if(obj){
        node = dom.byId(`container${obj.name}`);
        let item = domConstruct.toDom(`<div class="flex-item" id=${layer.id}></div>`);
        item.appendChild(domConstruct.toDom(`<img src="${obj.item.imagen}" >`));
        item.appendChild(domConstruct.toDom(`<span>${obj.item.title}</span>`));
        domConstruct.place(item, node);

        if(obj.item.subItems && obj.item.subItems.length > 1){
          
          let subContainer = domConstruct.toDom(`<div class="flex-container sub" id=${layer.id}_SubContainer style="display:none"></div>`);
          domConstruct.place(subContainer, node.parentNode);

          array.forEach(layer.layerObject.layerInfos, (layerInfo) => {
            for(let i = 0; i < obj.item.subItems.length; i++){
              if(layerInfo.name.toLowerCase() == obj.item.subItems[i].title.toLowerCase()){
                let subItem = domConstruct.toDom(`<div class="flex-item" id=${layer.id}_${layerInfo.id}></div>`);
                subItem.appendChild(domConstruct.toDom(`<img src="${obj.item.subItems[i].imagen}" >`));
                subItem.appendChild(domConstruct.toDom(`<span>${obj.item.subItems[i].title}</span>`));
                subItem.onclick = () => {
                  if(!layer.layerObject.visible){
                    layer.layerObject.setVisibility(true);
                    dom.byId(layer.id).style.filter = "";
                  }
                    
                  let newVisibleLayers = layer.layerObject.visibleLayers.filter(layer => layer != layerInfo.id);
                  if(layer.layerObject.visibleLayers.indexOf(layerInfo.id) > -1){
                    layer.layerObject.setVisibleLayers(newVisibleLayers);
                    subItem.style.filter = "opacity(40%) grayscale(90%)";
                  }
                  else{
                    newVisibleLayers.push(layerInfo.id);
                    layer.layerObject.setVisibleLayers(newVisibleLayers);
                    subItem.style.filter = "";
                  }
                  layer.layerObject.refresh();
                };
                domConstruct.place(subItem, subContainer);
              }
            }
          });

          let backItem = domConstruct.toDom(`<div class="flex-item" id=${layer.id}_back></div>`);
          backItem.appendChild(domConstruct.toDom(`<img src="http://icons.iconarchive.com/icons/graphicloads/100-flat-2/256/arrow-back-icon.png" style="width:50%; height:50%" > `));
          backItem.onclick = () => {
            subContainer.style.display = 'none';
            if(this.currentNode == this.nodeSearch){this._showSearch();}
            else{this.currentNode.style.display = 'flex';}
          };
          domConstruct.place(backItem, subContainer);
        }

        item.onclick = () => {
          if(layer.layerObject.visible){
            layer.layerObject.setVisibility(false);
            dom.byId(layer.id).style.filter = "opacity(40%) grayscale(90%)";
          }
          else{
            layer.layerObject.setVisibility(true);
            dom.byId(layer.id).style.filter = "";
            if(layer.layerObject.layerInfos.length > 1){
              var elements = document.getElementsByClassName('flex-container');
              for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
              } 
              dom.byId("searchNodes").innerHTML = "";
              if(dom.byId(`${layer.id}_SubContainer`)){
                dom.byId(`${layer.id}_SubContainer`).style.display = "flex";
              }
            }
          }
        };

        if(!layer.layerObject.visible){
          dom.byId(layer.id).style.filter = "opacity(40%) grayscale(90%)";
        }
      }
    });

    this._showNaturaleza();
  },

  _searchLayer(){

    dom.byId("searchNodes").innerHTML = "";
    var elements = document.getElementsByClassName('flex-container');
    for(let i = 0; i < elements.length; i++){
      elements[i].style.display = 'none';
    }

    if(this.searchTextBox.value && this.searchTextBox.value != ""){

      let items = document.querySelectorAll(".flex-item > span");
      items.forEach((item) => {
        if(item.innerHTML.toLowerCase().includes(this.searchTextBox.value.toLowerCase())){
          let layerId = item.parentNode.id;
          let layer = this._infoCapasMapa.itemData.operationalLayers.find((layer) => layer.id == layerId);
          if(!layer)return;

          let divClone = item.parentNode.cloneNode(true);
          divClone.onclick = () => {
            if(layer.layerObject.visible){
              layer.layerObject.setVisibility(false);
              divClone.style.filter = "opacity(40%) grayscale(90%)";
              dom.byId(layer.id).style.filter = "opacity(40%) grayscale(90%)";
            }
            else{
              layer.layerObject.setVisibility(true);
              divClone.style.filter = "";
              dom.byId(layer.id).style.filter = "";
              if(layer.layerObject.layerInfos.length > 1){
                var elements = document.getElementsByClassName('flex-container');
                for(let i = 0; i < elements.length; i++){
                  elements[i].style.display = 'none';
                } 
                dom.byId("searchNodes").innerHTML = "";
                if(dom.byId(`${layer.id}_SubContainer`)){
                  dom.byId(`${layer.id}_SubContainer`).style.display = "flex";
                }
              }
            }      
          };
          dom.byId("searchNodes").appendChild(divClone);
          dom.byId("searchNodes").style.display = "flex";
        }
      });
    }
  },

  _findNode(layer){
    for(let i = 0; i < this.config.nodes.length; i++){
      let node = this.config.nodes[i];
      for(let j = 0; j < node.items.length; j++){
        let item = node.items[j];
        if(item.title.toLowerCase() == layer.toLowerCase()){
          let obj = {};
          obj.item = item;
          obj.name = node.name;
          return obj;
        }
      }
    }
  },

  _showNaturaleza(){
    var elements = document.getElementsByClassName('flex-container');
    for(let i = 0; i < elements.length; i++){
      elements[i].style.display = 'none';
    }
    this.nodeNaturaleza.style.display = "flex";
    this.nodeSearch.style.display = "none";
    dom.byId("searchNodes").innerHTML = "";
    this.currentNode = this.nodeNaturaleza;
  },
  _showCultura(){
    var elements = document.getElementsByClassName('flex-container');
    for(let i = 0; i < elements.length; i++){
      elements[i].style.display = 'none';
    }
    this.nodeCultura.style.display = "flex";
    this.nodeSearch.style.display = "none";
    dom.byId("searchNodes").innerHTML = "";
    this.currentNode = this.nodeCultura;
  },
  _showOcio(){
    var elements = document.getElementsByClassName('flex-container');
    for(let i = 0; i < elements.length; i++){
      elements[i].style.display = 'none';
    }
    this.nodeOcio.style.display = "flex";
    this.nodeSearch.style.display = "none";
    dom.byId("searchNodes").innerHTML = "";
    this.currentNode = this.nodeOcio;
  },
  _showOtros(){
    var elements = document.getElementsByClassName('flex-container');
    for(let i = 0; i < elements.length; i++){
      elements[i].style.display = 'none';
    }
    this.nodeOtros.style.display = "flex";
    this.nodeSearch.style.display = "none";
    dom.byId("searchNodes").innerHTML = "";
    this.currentNode = this.nodeOtros;
  },
  _showSearch(){
    this.nodeSearch.style.display = "block";
    this.currentNode = this.nodeSearch;
    this.searchTextBox.focus();
    this._searchLayer();
  },

  _obtenerCapasMapa() {
      // summary:
      //    obtain basemap layers and operational layers if the map is not webmap.
      var basemapLayers = [], operLayers = [];
      // emulate a webmapItemInfo.
      var retObj = {
        itemData: {
          baseMap: {
            baseMapLayers: []
          },
          operationalLayers: []
        }
      };
      array.forEach(this.map.graphicsLayerIds, function(layerId) {
        var layer = this.map.getLayer(layerId);
        if (layer.isOperationalLayer) {
          operLayers.push({
            layerObject: layer,
            title: layer.label || layer.title || layer.name || layer.id || " ",
            id: layer.id || " "
          });
        }
      }, this);
      array.forEach(this.map.layerIds, function(layerId) {
        var layer = this.map.getLayer(layerId);
        if (!layer._wmtsInfo) {
          operLayers.push({
            layerObject: layer,
            title: layer.arcgisProps.title || layer.label || layer.title || layer.name || layer.id || " ",
            id: layer.id || " "
          });
        } else {
          basemapLayers.push({
            layerObject: layer,
            id: layer.id || " "
          });
        }
      }, this);

      retObj.itemData.baseMap.baseMapLayers = basemapLayers;
      retObj.itemData.operationalLayers = operLayers;
      return retObj;
  },

});