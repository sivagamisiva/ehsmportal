 
sap.ui.define([], function () {
    "use strict";
   
    // This object contains all the functions referenced in both Incident and Risk views
    return {
 
        /**
         * Formats the OData date timestamp (/Date(1755561600000)/) into a readable date string.
         * @param {string} sDate The date string from the OData service.
         * @returns {string} The formatted date string.
         */
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            // Extract the numeric timestamp and convert it to an integer
            // Example: /Date(1755561600000)/ -> 1755561600000
            var iTime = parseInt(sDate.replace("/Date(", "").replace(")/", ""), 10);
            var oDate = new Date(iTime);
           
            // Return the date in a localized, readable format (e.g., 12/15/2025)
            return oDate.toLocaleDateString();
        },
 
        // --- INCIDENT FORMATTERS ---
 
        /**
         * Maps the Incident Priority text ('High', 'Medium', 'Low') to the
         * sap.ui.core.ValueState for coloring the ObjectStatus control.
         * @param {string} sPriority The Incident Priority text.
         * @returns {string} The corresponding ValueState ('Error', 'Warning', 'Success').
         */
        priorityState: function (sPriority) {
            switch (sPriority) {
                case "High":
                    return "Error";    // Red for High
                case "Medium":
                    return "Warning";  // Yellow/Orange for Medium
                case "Low":
                    return "Success";  // Green for Low
                default:
                    return "None";
            }
        },
 
        /**
         * Maps the Incident Status text ('Open', 'In Progress', 'Closed') to the
         * sap.ui.core.ValueState for coloring the ObjectStatus control.
         * @param {string} sStatus The Incident Status text.
         * @returns {string} The corresponding ValueState ('Error', 'Warning', 'Success').
         */
        statusState: function (sStatus) {
            switch (sStatus) {
                case "Open":
                    return "Error";        // Red for unresolved/Open issues
                case "In Progress":
                    return "Warning";     // Yellow/Orange for ongoing work
                case "Closed":
                    return "Success";     // Green for completed issues
                default:
                    return "None";
            }
        },
       
        // --- RISK FORMATTERS ---
 
        /**
         * Maps Risk Severity text ('High', 'Medium', 'Low') to the
         * sap.ui.core.ValueState for coloring the ObjectStatus control.
         * @param {string} sSeverity The Risk Severity text.
         * @returns {string} The corresponding ValueState ('Error', 'Warning', 'Success').
         */
        severityState: function (sSeverity) {
            switch (sSeverity) {
                case "High":
                    return "Error";    // Red
                case "Medium":
                    return "Warning";   // Yellow/Orange
                case "Low":
                    return "Success";   // Green
                default:
                    return "None";
            }
        },
 
        /**
         * Maps Likelihood text ('Likely', 'Unlikely', 'Rare') to the
         * sap.ui.core.ValueState for coloring the ObjectStatus control.
         * @param {string} sLikelihood The Likelihood text.
         * @returns {string} The corresponding ValueState ('Error', 'Warning', 'Success').
         */
        likelihoodState: function (sLikelihood) {
            switch (sLikelihood) {
                case "Likely":
                    return "Error";       // Red
                case "Unlikely":
                    return "Warning";     // Yellow/Orange
                case "Rare":
                    return "Success";     // Green
                default:
                    return "None";
            }
        }
    };
});
 