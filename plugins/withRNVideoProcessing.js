// import { ConfigPlugin, withMainApplication } from 'expo/config-plugins';
const { ConfigPlugin, withMainApplication } = require('expo/config-plugins')

console.log("TESTET1231231231DSSYEQWEQWE");

const applyPackageAndroid = (mainApplication: string) => {
  console.log("TESTETDSSYEQWEQWE");
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

const withAndroidLinking: typeof ConfigPlugin = (expoConfig) => {
  expoConfig = withMainApplication(expoConfig, (config) => {
    config.modResults.contents = applyPackageAndroid(config.modResults.contents)
    return config
  })

  return expoConfig
}

export default withAndroidLinking;