sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";
 
    return Controller.extend("com.ehsm.ehsmportal.controller.Login", { // Updated controller path for consistency
 
        onLogin: function () {
            var sEmpid = this.byId("empId").getValue().trim();
            var sPassword = this.byId("password").getValue();

            if (!sEmpid || !sPassword) {
                MessageToast.show("Please enter both EMPID and Password");
                return;
            }

            sap.ui.core.BusyIndicator.show(0);
            var that = this;
            var oModel = this.getOwnerComponent().getModel(); // Use default OData model

            // Construct the path for the Entity Read (Composite Key)
            var sPath = oModel.createKey("/ZEHSM_LOGIN_SGSet", {
                EmployeeId: sEmpid,
                Password: sPassword
            });

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    if (oData && oData.Status && oData.Status.toUpperCase() === "SUCCESS") {
                        // Store user globally
                        var oAppModel = that.getOwnerComponent().getModel("app");
                        if (!oAppModel) {
                            oAppModel = new JSONModel({
                                loggedInUser: {
                                    EmployeeId: oData.EmployeeId,
                                    Ename: oData.Ename || "User",
                                    Status: oData.Status
                                }
                            });
                            that.getOwnerComponent().setModel(oAppModel, "app");
                        } else {
                            oAppModel.setProperty("/loggedInUser", {
                                EmployeeId: oData.EmployeeId,
                                Ename: oData.Ename || "User",
                                Status: oData.Status
                            });
                        }

                        MessageToast.show("Login successful! Welcome " + sEmpid);
                        sap.ui.core.UIComponent.getRouterFor(that).navTo("Dashboard");

                    } else {
                        MessageToast.show("Invalid EMPID or Password");
                    }
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    var bFound = false;
                     try {
                        var oResponse = JSON.parse(oError.responseText);
                         if (oResponse.error && oResponse.error.code) {
                             // Handle specific backend errors if needed
                         }
                    } catch (e) {
                        // ignore
                    }

                    if (oError.statusCode === 404) {
                         MessageToast.show("User not found");
                    } else {
                        MessageToast.show("Login failed. Check credentials.");
                    }
                    console.error("Login Error:", oError);
                }
            });
        }
    });
});