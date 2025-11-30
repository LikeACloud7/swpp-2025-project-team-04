const {
  withAndroidStyles,
  withDangerousMod,
  withPlugins,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withLaunchBackgroundDrawable = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/drawable',
      );
      if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
      }
      const launchBackgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splashscreen_logo" />
    </item>
</layer-list>`;
      fs.writeFileSync(
        path.join(resDir, 'launch_background.xml'),
        launchBackgroundXml,
      );
      return config;
    },
  ]);
};

const withWindowBackgroundStyle = (config) => {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;

    // 1. Update Theme.App.SplashScreen (Launch Theme)
    const splashTheme = styles.resources.style.find(
      (style) => style.$.name === 'Theme.App.SplashScreen',
    );
    if (splashTheme) {
      if (splashTheme.item) {
        splashTheme.item = splashTheme.item.filter(
          (item) => item.$.name !== 'android:windowBackground',
        );
      } else {
        splashTheme.item = [];
      }
      splashTheme.item.push({
        $: { name: 'android:windowBackground' },
        _: '@drawable/launch_background',
      });
    }

    // 2. Update AppTheme (Post-Splash Theme)
    // User requested to keep the Logo here to prevent ANY white/blank flash.
    // NOTE: This requires all app screens to have opaque backgrounds, otherwise the logo will show through.
    const appTheme = styles.resources.style.find(
      (style) => style.$.name === 'AppTheme',
    );
    if (appTheme) {
      if (appTheme.item) {
        appTheme.item = appTheme.item.filter(
          (item) => item.$.name !== 'android:windowBackground',
        );
      } else {
        appTheme.item = [];
      }
      // Use the Logo+Background drawable
      appTheme.item.push({
        $: { name: 'android:windowBackground' },
        _: '@drawable/launch_background',
      });
    }

    return config;
  });
};

const withAndroidSplash = (config) => {
  return withPlugins(config, [
    withLaunchBackgroundDrawable,
    withWindowBackgroundStyle,
  ]);
};

module.exports = withAndroidSplash;
