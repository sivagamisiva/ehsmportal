sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, JSONModel, BusyIndicator) {
    "use strict";

    return Controller.extend("com.ehsm.ehsmportal.controller.Profile", {

        onInit: function () {
            // Get the Router for the current component
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // Attach the _onRouteMatched function to the 'Profile' route
            oRouter.getRoute("Profile").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // Get the global 'app' model to retrieve the logged-in user
            var oAppModel = this.getOwnerComponent().getModel("app");
            var sEmployeeId = oAppModel ? oAppModel.getProperty("/loggedInUser/EmployeeId") : null;

            if (sEmployeeId) {
                this.loadProfileData(sEmployeeId);
            } else {
                // If no user is logged in, navigate back to login
                MessageToast.show("Please log in first.");
                this.onNavBack();
            }
        },

        loadProfileData: function (sEmployeeId) {
            BusyIndicator.show(0);
            var that = this;
            var oModel = this.getOwnerComponent().getModel();

            var sPath = oModel.createKey("/ZEHSM_PROFILE_SGSet", {
                EmployeeId: sEmployeeId
            });

            oModel.read(sPath, {
                success: function (oData) {
                    BusyIndicator.hide();

                    if (oData) {
                        // Create a new JSON Model for the Profile View and set the data
                        var oProfileModel = new JSONModel(oData);
                        that.getView().setModel(oProfileModel, "profileModel");
                    } else {
                        MessageToast.show("No profile data found.");
                    }
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    MessageToast.show("Failed to load profile data.");
                    console.error("Profile Error:", oError);
                }
            });
        },

        onNavBack: function () {
            // Standard back navigation
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        }
    });
});