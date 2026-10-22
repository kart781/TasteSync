/// <reference types="node" />
// Adds Firebase only when its config files are present, so the app still builds
// (and runs in Expo Go with dev sign-in) before a Firebase project exists.
import { existsSync } from "node:fs";
import type { ConfigContext, ExpoConfig } from "expo/config";

const androidFile = "./google-services.json";
const iosFile = "./GoogleService-Info.plist";

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (!existsSync(androidFile) || !existsSync(iosFile)) return base;
  return {
    ...base,
    android: { ...base.android, googleServicesFile: androidFile },
    ios: { ...base.ios, googleServicesFile: iosFile },
    plugins: [
      ...(base.plugins ?? []),
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      ["expo-build-properties", { ios: { useFrameworks: "dynamic" } }],
    ],
  };
};
