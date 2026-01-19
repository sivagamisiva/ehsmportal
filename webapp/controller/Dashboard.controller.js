sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
 
    return Controller.extend("com.ehsm.ehsmportal.controller.Dashboard", {
 
        // *** NEW FUNCTIONS FOR PROFILE, INCIDENT, AND RISK ***
        onViewProfilePress: function () {
            // Assumes a route named "Profile" exists in your manifest.json
            this.getOwnerComponent().getRouter().navTo("Profile");
        },
 
        onIncidentTilePress: function () {
            // Assumes a route named "IncidentDetails" exists in your manifest.json
            this.getOwnerComponent().getRouter().navTo("IncidentDetails");
        },
 
        onRiskTilePress: function () {
            // Assumes a route named "RiskDetails" exists in your manifest.json
            this.getOwnerComponent().getRouter().navTo("RiskDetails");
        },
        // *** END NEW FUNCTIONS ***
 
        onLogout: function () {
            this.getOwnerComponent().getModel("app").setProperty("/loggedInUser", null);
            MessageToast.show("Logged out successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }
    });
});