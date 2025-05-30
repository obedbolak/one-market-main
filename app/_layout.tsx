import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux"; // Import the Provider from react-redux
import store from "../store";



// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }



  return (
  <ProductProvider>
    
    <AuthProvider>
   <Provider store={store}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(admin)/Administrators"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="Jobs/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="Services/AllServices"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Services/[ViewServices]"
            options={{ headerTitle: "Services" }}
          />
          <Stack.Screen
            name="Categories/[categoryId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Seller/[sellerId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="LostItem/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="Cart/Cart" options={{ headerShown: false }} />
          <Stack.Screen name="Cart/CheckOut" options={{ headerShown: false }} />

          <Stack.Screen name="chat/[chat]" options={{ headerTitle: "Chat" }} />
          <Stack.Screen
            name="(auth)/AuthScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Merchant/BecomeSeller"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Merchant/ViewOrders"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Merchant/AccountSettings"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Merchant/MyProduct"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Merchant/CreateProduct"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LostItem/LostItem"
            options={{ headerShown: false }}
          />
          

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </Provider>
    </AuthProvider>  
        
    </ProductProvider>
   

  );
}
