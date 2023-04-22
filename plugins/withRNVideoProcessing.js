const { withSettingsGradle, withMainApplication, withAppBuildGradle, withProjectBuildGradle } = require('expo/config-plugins')

const applyMainApplication = (mainApplication) => {
  const packageImport = `import com.shahenlibrary.RNVideoProcessingPackage;\n`
  const addPackage = `packages.add(new RNVideoProcessingPackage());`

  // Make sure the project does not have the settings already
  if (!mainApplication.includes(packageImport)) {
    mainApplication = mainApplication.replace(
      /package com.fiddlequest.teacher_app;/,
      `package com.fiddlequest.teacher_app;\n${packageImport}`
    )
  }

  if (!mainApplication.includes(addPackage)) {
    mainApplication = mainApplication.replace(
      /return packages;/,
      `
    ${addPackage}
    return packages;
    `
    )
  }

  return mainApplication
}

const applySettings = (gradleSettings) => {
  const appliedSettings = `include ':react-native-video-processing'
  project(':react-native-video-processing').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video-processing/android')`

  // Make sure the project does not have the settings already
  if (!gradleSettings.includes(`include ':react-native-video-processing'`)) {
    return gradleSettings + appliedSettings
  }

  return gradleSettings;
}

const applyBuild = (appBuildGradle) => {
  const implementation = `implementation project(':react-native-video-processing')`;

  // Make sure the project does not have the dependency already
  if (!appBuildGradle.includes(implementation)) {
    return appBuildGradle.replace(
      /dependencies {/,
      `dependencies {
    ${implementation}`
    )
  }

  return appBuildGradle;
}

const applyProjectBuild = (projectBuildGradle) => {
  // to fix Could not find com.yqritc:android-scalablevideoview
  console.log(projectBuildGradle)
  const videoRep = `jcenter() {
            content {
                includeModule("com.yqritc", "android-scalablevideoview")
            }
        }\n`

  if (!projectBuildGradle.includes(videoRep)) {
    return projectBuildGradle.replaceAll(
      /repositories {/g,
      `repositories {
    ${videoRep}`
    )
  }

  return projectBuildGradle;
}

const withAndroidLinking = (expoConfig) => {
  expoConfig = withMainApplication(expoConfig, (config) => {
    config.modResults.contents = applyMainApplication(config.modResults.contents)
    return config
  });
  expoConfig = withSettingsGradle(expoConfig, (config) => {
    config.modResults.contents = applySettings(config.modResults.contents)
    return config
  });

  expoConfig = withAppBuildGradle(expoConfig, (config) => {
    config.modResults.contents = applyBuild(config.modResults.contents)
    return config
  })

  expoConfig = withProjectBuildGradle(expoConfig, (config) => {
    config.modResults.contents = applyProjectBuild(config.modResults.contents)
    return config
  })

  return expoConfig;
}

module.exports = withAndroidLinking;