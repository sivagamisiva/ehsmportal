sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "com/ehsm/ehsmportal/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, JSONModel, BusyIndicator, myFormatter, Filter, FilterOperator) {
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
            var oModel = this.getOwnerComponent().getModel();

            console.log("IncidentDetails: loadIncidentData called with EmployeeId:", sEmployeeId);

            // Pad EmployeeId to 8 digits if numeric (SAP standard PERNR)
            var sVals = sEmployeeId;
            if (/^\d+$/.test(sEmployeeId) && sEmployeeId.length < 8) {
                sVals = ("00000000" + sEmployeeId).slice(-8);
            }
            console.log("IncidentDetails: Using Padded EmployeeId for filter:", sVals);

            var aFilters = [new Filter("EmployeeId", FilterOperator.EQ, sVals)];

            oModel.read("/ZEHSM_INCIDENT_SGSet", {
                filters: aFilters,
                success: function (oData) {
                    BusyIndicator.hide();
                    console.log("IncidentDetails: OData Success. Response:", oData);

                    if (oData && oData.results) {
                        console.log("IncidentDetails: Correct results found. Count:", oData.results.length);
                        MessageToast.show("Loaded " + oData.results.length + " incidents successfully!");
                        var oIncidentModel = new JSONModel({ incidents: oData.results });
                        that.getView().setModel(oIncidentModel, "incidentModel");
                    } else {
                        console.warn("IncidentDetails: OData response missing 'results' array.");
                        that.getView().setModel(new JSONModel({ incidents: [] }), "incidentModel");
                        MessageToast.show("No incidents found.");
                    }
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    console.error("IncidentDetails: OData Error:", oError);
                    MessageToast.show("Failed to load incident data.");
                    console.error("Incident Error:", oError);
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
            // Get the search query
            var sQuery = oEvent.getParameter("query");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                var oFilter1 = new Filter("IncidentDescription", FilterOperator.Contains, sQuery);
                var oFilter2 = new Filter("IncidentId", FilterOperator.Contains, sQuery);
                var oFilter3 = new Filter("IncidentCategory", FilterOperator.Contains, sQuery);
                var oFilter4 = new Filter("Plant", FilterOperator.Contains, sQuery);
                var oFilter5 = new Filter("CreatedBy", FilterOperator.Contains, sQuery);

                // Combine filters with OR logic
                var oAllFilter = new Filter({
                    filters: [oFilter1, oFilter2, oFilter3, oFilter4, oFilter5],
                    and: false
                });
                aFilters.push(oAllFilter);
            }

            // Get the list binding and apply the filter
            var oList = this.byId("incidentList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters);
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        }
    });
});