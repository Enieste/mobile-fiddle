const { withProjectBuildGradle  } = require('@expo/config-plugins');

module.exports = function modifyBuildGradle(config) {
  return withProjectBuildGradle (config, (config) => {
    const buildGradleContent = config.modResults.contents;

    const modifiedContent = buildGradleContent.replace(
      /allprojects\s*{\s*repositories\s*{\s*/g,
      `allprojects {
        repositories {
          maven {
            url "$rootDir/../node_modules/@firfi/expo-camera/android/maven"
          }
          `
    );
    // Update the contents of build.gradle with the modified content
    config.modResults.contents = modifiedContent;
    return config;
  });
};