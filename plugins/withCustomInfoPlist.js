const { withInfoPlist } = require('@expo/config-plugins')

module.exports = function modifyInfoPlist(config) {
  return withInfoPlist (config, (config) => {
    config.modResults['UISupportedInterfaceOrientations~ipad'] = ['UIDeviceOrientationPortrait', 'UIInterfaceOrientationLandscapeRight'];
    config.modResults['requireFullScreen'] = true;
    return config
  });
};