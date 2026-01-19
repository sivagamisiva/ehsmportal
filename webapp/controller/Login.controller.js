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
 
            // *** MODIFICATION START ***
            // Updated OData URL, Entity Set, and Key Properties
            var sUrl = "/sap/opu/odata/sap/ZEHSP_508_OD_SRV/ZEHSM_LOGIN_SGSet(EmployeeId='" + sEmpid + "',Password='" + sPassword + "')?$format=json";
            // *** MODIFICATION END ***
 
            $.ajax({
                url: sUrl,
                method: "GET",
                async: true,
                xhrFields: {
                    withCredentials: true   // This sends SAP session cookie → no CSRF needed for GET
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
 
                    var oUser = oData.d;
 
                    if (oUser && oUser.Status && oUser.Status.toUpperCase() === "SUCCESS") {
                        // Store user globally
                        var oAppModel = that.getOwnerComponent().getModel("app");
                        if (!oAppModel) {
                            oAppModel = new JSONModel({
                                loggedInUser: {
                                    // *** MODIFICATION START ***
                                    EmployeeId: oUser.EmployeeId, // Using EmployeeId from the response
                                    // *** MODIFICATION END ***
                                    Ename: oUser.Ename || "User",
                                    Status: oUser.Status
                                }
                            });
                            that.getOwnerComponent().setModel(oAppModel, "app");
                        } else {
                            oAppModel.setProperty("/loggedInUser", oUser);
                        }
 
                        MessageToast.show("Login successful! Welcome " + sEmpid);
                        sap.ui.core.UIComponent.getRouterFor(that).navTo("Dashboard");
 
                    } else {
                        MessageToast.show("Invalid EMPID or Password");
                    }
                },
                error: function (xhr, status, error) {
                    sap.ui.core.BusyIndicator.hide();
 
                    if (xhr.status === 404) {
                        MessageToast.show("User not found");
                    } else if (xhr.status === 403) {
                        MessageToast.show("Access denied. Check SAP login session.");
                    } else {
                        MessageToast.show("Login failed. Check credentials.");
                    }
                    console.error("Login AJAX Error:", xhr.responseText || error);
                }
            });
        }
    });
});