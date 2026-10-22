/// <reference types="node" />
// Adds Firebase only when its config file is present, so the app still builds
// (and runs in Expo Go with dev sign-in) before a Firebase project exists.
// iOS-only launch: the Android file is optional until Android starts (PRD v4).
import { existsSync } from "node:fs";
import type { ConfigContext, ExpoConfig } from "expo/config";

const androidFile = "./google-services.json";
const iosFile = "./GoogleService-Info.plist";

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (!existsSync(iosFile)) return base;
  return {
    ...base,
    ios: { ...base.ios, googleServicesFile: iosFile },
    ...(existsSync(androidFile) && { android: { ...base.android, googleServicesFile: androidFile } }),
    plugins: [
      ...(base.plugins ?? []),
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      ["expo-build-properties", { ios: { useFrameworks: "dynamic" } }],
    ],
  };
};
