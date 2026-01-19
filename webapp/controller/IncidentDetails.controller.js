sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "com/ehsm/ehsmportal/model/formatter"
], function (Controller, MessageToast, JSONModel, BusyIndicator, myFormatter) {
    "use strict";
 
    return Controller.extend("com.ehsm.ehsmportal.controller.IncidentDetails", {
 
        myFormatter: myFormatter,
 
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("IncidentDetails").attachPatternMatched(this._onRouteMatched, this);
        },
 
        _onRouteMatched: function () {
            var oAppModel = this.getOwnerComponent().getModel("app");
            var sEmployeeId = oAppModel ? oAppModel.getProperty("/loggedInUser/EmployeeId") : null;
           
            if (sEmployeeId) {
                this.loadIncidentData(sEmployeeId);
            } else {
                MessageToast.show("Please log in first.");
                this.onNavBack();
            }
        },
 
        loadIncidentData: function (sEmployeeId) {
            BusyIndicator.show(0);
            var that = this;
           
            var sUrl = "/sap/opu/odata/SAP/ZEHSP_508_OD_SRV/ZEHSM_INCIDENT_SGSet?$filter=EmployeeId eq '" + sEmployeeId + "'&$format=json";
 
            $.ajax({
                url: sUrl,
                method: "GET",
                async: true,
                xhrFields: {
                    withCredentials: true
                },
                success: function (oData) {
                    BusyIndicator.hide();
                    if (oData.d && oData.d.results) {
                        // Initialize a local model with the incident data
                        var oIncidentModel = new JSONModel({ incidents: oData.d.results });
                        that.getView().setModel(oIncidentModel, "incidentModel");
                    } else {
                        that.getView().setModel(new JSONModel({ incidents: [] }), "incidentModel");
                        MessageToast.show("No incidents found.");
                    }
                },
                error: function (xhr, status, error) {
                    BusyIndicator.hide();
                    MessageToast.show("Failed to load incident data.");
                    console.error("Incident AJAX Error:", xhr.responseText || error);
                    that.getView().setModel(new JSONModel({ incidents: [] }), "incidentModel");
                }
            });
        },
 
        // New function to handle the expand/collapse logic
        onIncidentToggle: function (oEvent) {
            var oListItem = oEvent.getSource();
            // Get the VBox containing the details and the toggle icon
            var oDetailPanel = oListItem.getAggregation("content")[0].getItems()[1]; // VBox -> Panel (2nd item)
            var oToggleIcon = oListItem.getAggregation("content")[0].getItems()[0].getItems()[1].getItems()[1]; // VBox -> HBox -> HBox -> Icon (2nd item)
           
            var bIsVisible = oDetailPanel.getVisible();
 
            // Toggle Visibility
            oDetailPanel.setVisible(!bIsVisible);
           
            // Toggle Icon (slim-arrow-down or slim-arrow-up)
            if (bIsVisible) {
                oToggleIcon.setSrc("sap-icon://slim-arrow-down");
            } else {
                oToggleIcon.setSrc("sap-icon://slim-arrow-up");
            }
        },
       
        onSearch: function (oEvent) {
            // Add search and filter logic here
        },
 
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        }
    });
});