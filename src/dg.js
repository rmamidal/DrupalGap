// Initialize the DrupalGap JSON object and run the bootstrap.
var dg = {}; var drupalgap = dg;

dg.activeTheme = null;
dg.regions = null; // Holds instances of regions.
dg.blocks = null; // Holds instances of blocks.
dg.spinner = 0; // Holds onto how many spinners have been thrown up.

// Configuration setting defaults.
dg.settings = {
  mode: 'web-app',
  front: null,
  blocks: {}
};

// Start.
dg.start = function() {
  if (dg.getMode() == 'phonegap') {
    document.addEventListener('deviceready', dg.deviceready, false);
  }
  else { dg.deviceready(); } // web-app
};

// Device ready.
dg.deviceready = function() {
  dg.bootstrap();
  if (!jDrupal.isReady()) {
    dg.alert('Set the sitePath in the settings.js file!');
    return;
  }
  //jDrupal.moduleInvokeAll('deviceready');
  jDrupal.connect().then(this.devicereadyGood, this.devicereadyBad);
};
dg.devicereadyGood = function(data) {
  // Pull out any important data from the Connect resource results.
  for (var d in data.drupalgap) {
    if (!data.drupalgap.hasOwnProperty(d)) { continue; }
    drupalgap[d] = data.drupalgap[d];
  }
  // Force a check on the router (which is already listening at this point), to
  // refresh the current page or navigate to the current path.
  dg.router.check(dg.router.getFragment());
};
dg.devicereadyBad = function() {
  var note = 'Failed connection to ' + jDrupal.sitePath();
  if (msg != '') { note += ' - ' + msg; }
  dg.alert(note, {
    title: 'Unable to Connect',
    alertCallback: function() { }
  });
};

// Bootstrap.
dg.bootstrap = function() {

  dg.router.config({
    //mode: 'history',
    //root: 'discasaurus.com'
  });

  // Build the routes.
  // @TODO turn route building into promises.
  // @TODO turn the outer portion of this procedure into a re-usable function
  // that can iterate over modules and call a specific function within that
  // module.
  var modules = jDrupal.modulesLoad();
  for (var module in modules) {
    if (!modules.hasOwnProperty(module) || !modules[module].routing) { continue; }
    var routes = modules[module].routing();
    if (!routes) { continue; }
    for (route in routes) {
      if (!routes.hasOwnProperty(route)) { continue; }
      var item = routes[route];
      dg.router.add(item);
    }
  }

  // Load the theme.
  dg.themeLoad().then(function() {

    //dg.blocksLoad().then(function(blocks) {

      var blocks = dg.blocksLoad();

      // Add a default route, and start listening.
      dg.router.add(function() { }).listen();

    //});



  });

};

dg.spinnerShow = function() {
  dg.spinner++;
  if (dg.spinner == 1) { document.getElementById('dgSpinner').style.display = 'block'; }
};
dg.spinnerHide = function() {
  dg.spinner--;
  if (!dg.spinner) { document.getElementById('dgSpinner').style.display = 'none'; }
};