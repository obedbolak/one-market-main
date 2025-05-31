import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function TabLayout() {
  // This is a workaround to show the settings tab on iOS.
  const { userProfile } = useAuth();
  // userProfile role is admin setShowSettingsTab to true
  const { t } = useLanguage();

  const [showSettingsTab, setShowSettingsTab] = useState(false); // Initialize with a default value
  const [showAdministratorsTab, setShowAdministratorsTab] = useState(false); // Initialize with a default value

  useEffect(() => {
    const isAdmin = userProfile?.role === "admin";
    setShowSettingsTab(isAdmin); // Update state based on userProfile
    const isAdministrator = userProfile?.role === "administrator";
    setShowAdministratorsTab(isAdministrator); // Update state based on userProfile
  }, [userProfile]);

  const commonTabOptions = {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarStyle: Platform.select({
      ios: {
        position: "absolute" as "absolute",
      },
      default: {},
    }),
  };

  return (
    <Tabs screenOptions={commonTabOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: t("catalog"),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chevron.left.forwardslash.chevron.right"
              color={color}
            />
          ),
          href: showSettingsTab ?  "/catalog":"/catalog", 
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
          href: showSettingsTab ? "/settings" : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("account"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t("admin"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
          href: showAdministratorsTab ? "/admin" : null,
        }}
      />
    </Tabs>
  );
}
