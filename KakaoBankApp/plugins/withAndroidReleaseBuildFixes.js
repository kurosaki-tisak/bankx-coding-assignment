const {
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

/**
 * Release CI often fails on lintVitalAnalyzeRelease while analyzing
 * generated ReactNativeApplicationEntryPoint.java (Lint OOM / internal bug).
 *
 * - Raise Gradle heap/metaspace so Lint can finish
 * - Disable aborting release builds on Lint (checkReleaseBuilds false)
 */
function setGradleProperty(properties, key, value) {
  const existing = properties.find(
    (item) => item.type === 'property' && item.key === key,
  );
  if (existing) {
    existing.value = value;
    return;
  }
  properties.push({ type: 'property', key, value });
}

function withAndroidReleaseBuildFixes(config) {
  config = withGradleProperties(config, (config) => {
    setGradleProperty(
      config.modResults,
      'org.gradle.jvmargs',
      '-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8',
    );
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    const contents = config.modResults.contents;
    if (contents.includes('checkReleaseBuilds false')) {
      return config;
    }

    // Insert lint block inside the first android { ... } in app/build.gradle
    config.modResults.contents = contents.replace(
      /android\s*\{/,
      `android {
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
`,
    );
    return config;
  });

  return config;
}

module.exports = withAndroidReleaseBuildFixes;
