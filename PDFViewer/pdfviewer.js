(function() {
    let _shadowRoot;
    let _date;
    let _id;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>
      <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
      </div>
        <script id="oView" name="oView" type="sapui5/xmlview">
            <mvc:View
                controllerName="myView.Template"
                xmlns:mvc="sap.ui.core.mvc"
                xmlns="sap.m"
                height="100%">
                        <ScrollContainer
                            height="100%"
                            width="100%"
                            horizontal="true"
                            vertical="true">
                            <PDFViewer id="pdf" source="{/Source}" title="{/Title}" height="{/Height}" loaded="onloaded" error="onerror" sourceValidationFailed="onsourceValidationFailed">
                                <layoutData>
                                    <FlexItemData growFactor="1" />
                                </layoutData>
                            </PDFViewer>
                        </ScrollContainer>
            </mvc:View>
        </script>        
    `;

    class PDFViewer extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.pdf_url = "";
            this._export_settings.title = "";
            this._export_settings.height = "";

            this.settings = {};
            this.settings.format = "";

            this.addEventListener("click", event => {
                console.log('click');
                this.dispatchEvent(new CustomEvent("onStart", {
                    detail: {
                        settings: this.settings
                    }
                }));
            });

            this._firstConnection = 0;
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            loadthis(this);
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
            console.log("_renderExportButton-components");
            console.log(components);
            console.log("end");
        }

        _firePropertiesChanged() {
            this.date = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        date: this.date
                    }
                }
            }));
        }

        // SETTINGS
        get PDFURL() {
            return this._export_settings.pdf_url;
        }
        set PDFURL(value) {
            this._export_settings.pdf_url = value;
        }

        get title() {
            return this._export_settings.title;
        }
        set title(value) {
            this._export_settings.title = value;
        }

        get height() {
            return this._export_settings.height;
        }
        set height(value) {
            this._export_settings.height = value;
        }

        get date() {
            return this._export_settings.date;
        }

        set date(value) {
            value = _date;
            this._export_settings.date = value;
        }

        static get observedAttributes() {
            return [
                "date"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-fd-djaja-sap-sac-pdfviewer", PDFViewer);

    // UTILS
    function loadthis(that) {
        var that_ = that;

      
        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);


        that_._renderExportButton();

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/ui/model/json/JSONModel",
                "sap/m/MessageToast",
                "sap/ui/core/library",
                "sap/ui/core/Core"
            ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core) {
                "use strict";

                return Controller.extend("myView.Template", {

                    onInit: function() {
                        if(that._firstConnection === 0) {
                            that._firstConnection = 1;
                            this._sValidPath = that._export_settings.pdf_url
                            console.log(this._sValidPath);

                            this._oModel = new JSONModel({
                                Source: this._sValidPath,
                                Title: that._export_settings.title,
                                Height: that._export_settings.height
                            });

                            this.getView().setModel(this._oModel);
                            sap.ui.getCore().setModel(this._oModel, "core");
                        } else {
                            var oModel = sap.ui.getCore().getModel("core");
                            oModel.setProperty("/Source", that._export_settings.pdf_url);
                        }
                    },

                    onloaded: function () {
                        console.log("onloaded");
                    },

                    onerror: function () {
                        console.log("onerror");
                    },

                    onsourceValidationFailed: function (oEvent) {
                        console.log("onsourceValidationFailed");
                        oEvent.preventDefault();
                    }
                });
            });

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView  = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });

            oView.placeAt(content);
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }  
})();