const { withInfoPlist } = require('@expo/config-plugins')

module.exports = config =>
  withInfoPlist(config, config => {
    // Only enable portrait orientation in iPad
    config.modResults['UISupportedInterfaceOrientations~ipad'] = ['UIInterfaceOrientationPortrait']

    return config
  });