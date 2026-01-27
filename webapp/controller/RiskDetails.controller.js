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

    return Controller.extend("com.ehsm.ehsmportal.controller.RiskDetails", {

        myFormatter: myFormatter,

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // Ensure the route name matches manifest.json: 'RiskDetails'
            oRouter.getRoute("RiskDetails").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oAppModel = this.getOwnerComponent().getModel("app");
            var sEmployeeId = oAppModel ? oAppModel.getProperty("/loggedInUser/EmployeeId") : null;

            if (sEmployeeId) {
                this.loadRiskData(sEmployeeId);
            } else {
                MessageToast.show("Please log in first.");
                this.onNavBack();
            }
        },

        loadRiskData: function (sEmployeeId) {
            BusyIndicator.show(0);
            var that = this;
            var oModel = this.getOwnerComponent().getModel();

            console.log("RiskDetails: loadRiskData called with EmployeeId:", sEmployeeId);

            // Pad EmployeeId to 8 digits if numeric
            var sVals = sEmployeeId;
            if (/^\d+$/.test(sEmployeeId) && sEmployeeId.length < 8) {
                sVals = ("00000000" + sEmployeeId).slice(-8);
            }
            console.log("RiskDetails: Using Padded EmployeeId for filter:", sVals);

            var aFilters = [new Filter("EmployeeId", FilterOperator.EQ, sVals)];

            oModel.read("/ZEHSM_RISK_SGSet", {
                filters: aFilters,
                success: function (oData) {
                    BusyIndicator.hide();
                    console.log("RiskDetails: OData Success. Response:", oData);

                    if (oData && oData.results) {
                        console.log("RiskDetails: Correct results found. Count:", oData.results.length);
                        MessageToast.show("Loaded " + oData.results.length + " risks successfully!");
                        // Bind the array of risks to the view
                        var oRiskModel = new JSONModel({ risks: oData.results });
                        that.getView().setModel(oRiskModel, "riskModel");
                    } else {
                        console.warn("RiskDetails: OData response missing 'results' array.");
                        that.getView().setModel(new JSONModel({ risks: [] }), "riskModel");
                        MessageToast.show("No risk assessments found.");
                    }
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    console.error("RiskDetails: OData Error:", oError);
                    MessageToast.show("Failed to load risk data.");
                    that.getView().setModel(new JSONModel({ risks: [] }), "riskModel");
                }
            });
        },

        // Function to handle the expand/collapse logic
        onRiskToggle: function (oEvent) {
            var oListItem = oEvent.getSource();
            // Get the VBox containing the details and the toggle icon
            var oDetailPanel = oListItem.getAggregation("content")[0].getItems()[1]; // VBox -> Panel (2nd item)
            var oToggleIcon = oListItem.getAggregation("content")[0].getItems()[0].getItems()[1].getItems()[2]; // VBox -> HBox (main) -> HBox (right) -> Icon (3rd item in right HBox)

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
                var oFilter1 = new Filter("RiskDescription", FilterOperator.Contains, sQuery);
                var oFilter2 = new Filter("RiskId", FilterOperator.Contains, sQuery);
                var oFilter3 = new Filter("RiskCategory", FilterOperator.Contains, sQuery);
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
            var oList = this.byId("riskList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters);
        },

        onNavBack: function () {
            // Navigate back to Dashboard
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        }
    });
});