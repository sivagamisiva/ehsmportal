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

            var aFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];

            oModel.read("/ZEHSM_RISK_SGSet", {
                filters: aFilters,
                success: function (oData) {
                    BusyIndicator.hide();
                    if (oData && oData.results) {
                        // Bind the array of risks to the view
                        var oRiskModel = new JSONModel({ risks: oData.results });
                        that.getView().setModel(oRiskModel, "riskModel");
                    } else {
                        that.getView().setModel(new JSONModel({ risks: [] }), "riskModel");
                        MessageToast.show("No risk assessments found.");
                    }
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    MessageToast.show("Failed to load risk data.");
                    console.error("Risk Error:", oError);
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
            // Add search and filter logic here
        },

        onNavBack: function () {
            // Navigate back to Dashboard
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        }
    });
});