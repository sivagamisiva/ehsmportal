/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/ehsm/ehsmportal/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
