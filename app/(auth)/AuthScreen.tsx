import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import custom components
import CustomButton from "../components/CustomButton";
import EmailField from "../components/EmailField";
import FullNameField from "../components/NameField";
import PasswordField from "../components/PasswordField";
import PhoneField from "../components/PhoneField";

// Import auth context
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import OTPField from "../components/OTPField";

const AuthScreen = () => {
  // Get mode from navigation params
  const { mode } = useLocalSearchParams<{ mode?: "signin" | "signup" }>();
  const [otp, setOtp] = useState("");
  const [currentOtp, setCurrentOtp] = useState("");
  const [error, setError] = useState("");
  const [storedOtp, setStoredOtp] = useState("666666");
  const [isFormValid, setIsFormValid] = useState(false);

  // Auth context
  const { signin, signUp } = useAuth();

  // Screen state - dynamically set based on navigation params
  const [isSignIn, setIsSignIn] = useState(mode !== "signup");
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [otpstate, setOtpState] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [validOtp, setValidOtp] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<any>("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Predefined business details
  const businessDetails = {
    city: "Yaounde",
    address: "Etug-ebe Juction",
    country: "Cameroon",
    answer: "yes",
    storeName: "My Business",
    businessAddress: "123 Business St",
    businessDescription: "A fantastic business",
    businessPhone: "1234567890",
    USSDCode: "*126*123*456*",
  };

  const generateRandomPhone = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const validateForm = () => {
    if (isSignIn) {
      const isValid = (email.trim() || phone.trim()) && password.trim();
      setIsFormValid(isValid);
    } else {
      const isValid = 
        name.trim() && 
        password.trim() && 
        (email.trim() || phone.trim());
      setIsFormValid(isValid);
    }
  };

  useEffect(() => {
    validateForm();
  }, [name, email, phone, password, isSignIn, isEmailMode]);

  const handleAuthentication = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      const otp = generateRandomPhone();
      setStoredOtp(otp.toString());
      
      if (isSignIn) {
        const loginId = isEmailMode ? email : phone;
        await signin(loginId, password);
      } else {
        const signUpEmail = isEmailMode
          ? email
          : `${generateRandomPhone()}@example.com`;
        const signUpPhone = isEmailMode ? generateRandomPhone() : phone;

        await signUp(
          name,
          signUpEmail,
          password,
          businessDetails.city,
          businessDetails.address,
          signUpPhone,
          businessDetails.answer,
          businessDetails.country,
          businessDetails.storeName,
          businessDetails.businessAddress,
          businessDetails.businessDescription,
          businessDetails.businessPhone,
          businessDetails.USSDCode,
          otp
        );

        setLoading(false);
        setIsSignIn(true);
        setOtpState(true);
        setCurrentOtp(otp.toString());
      }
    } catch (error) {
      setLoading(false);
      alert("Authentication failed");
    }
  };

  const handleCodeFilled = (code: string) => {
    if (code.length === 6) {
      console.log("OTP entered:", code, storedOtp);
      setValidOtp(true);
      if (otp === currentOtp) {
        console.log("Success");
      }
    }
  };

  const url = "https://onemarketapi.xyz/api/twilio/send-sms";

  const sendSMS = async () => {
    try {
      const payload = {
        to: phone,
        body: `Your OTP Code is ${storedOtp}`,
      };

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("SMS sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending SMS:", error);
      alert("Failed to send SMS. Please try again.");
    }
  };

  const resendOTP = () => {
    const newOTP = generateRandomPhone();
    setStoredOtp(newOTP.toString());
    setTimeLeft(60);
    sendSMS();
    Alert.alert("New OTP Sent", "Check your device for the new code");
  };

  const handleCodeChanged = (code: string) => {
    setOtp(code);
    if (error && code.length === 6) {
      setError("");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In");
  };

  const handleFacebookSignIn = () => {
    console.log("Facebook Sign-In");
  };

  const toggleEmailPhoneMode = () => {
    setIsEmailMode((prev) => !prev);
    isEmailMode ? setEmail("") : setPhone("");
  };

  const formattedPhone = phone?.replace(
    /^(\+237)(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "$1 $2 $3 $4 $5 $6"
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          keyboardDismissMode="on-drag"
          scrollEnabled={isScrollEnabled}
          onContentSizeChange={(contentWidth, contentHeight) => {
            setIsScrollEnabled(contentHeight > Dimensions.get("window").height);
          }}
        >
          <View style={styles.innerContainer}>
            <Image
              source={
                isSignIn
                  ? require("../../assets/images/gif/login.gif")
                  : require("../../assets/images/gif/Animregister.gif")
              }
              style={styles.image}
            />

            {isSignIn && otpstate ? (
              <>
                <OTPField
                  phoneNumber={formattedPhone}
                  onCodeFilled={(code) => {
                    if (code.length === 6) {
                      setCurrentOtp(code);
                    }
                    handleCodeFilled(code);
                  }}
                  onResendPress={() => console.log("Resend requested")}
                />
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  {isSignIn ? "Sign In" : "Sign Up"}
                </Text>
                
                {isEmailMode ? (
                  <EmailField
                    label={isSignIn ? "Email" : "Email Address"}
                    helperText={
                      isSignIn ? "Enter your email" : "Enter your email address"
                    }
                    placeholder="example@example.com"
                    clearButtonVisible={true}
                    onChangeText={setEmail}
                  />
                ) : (
                  <PhoneField
                    label={isSignIn ? "Phone" : "Phone Number"}
                    placeholder={
                      isSignIn ? "Enter your phone" : "Enter your phone number"
                    }
                    value={phone}
                    onChangeText={setPhone}
                  />
                )}
                
                {!isSignIn && (
                  <FullNameField
                    label="Full Name"
                    placeholder="Enter your full name"
                    onChangeText={setName}
                  />
                )}
                
                <PasswordField
                  label="Password"
                  placeholder={
                    isSignIn ? "Enter your password" : "Create a password"
                  }
                  onChangeText={setPassword}
                />
                
                <View style={styles.toggleInfoContainer}>
                  <Text>
                    {isSignIn
                      ? `Sign In with ${isEmailMode ? "Phone" : "Email"}`
                      : `Sign Up with ${isEmailMode ? "Phone" : "Email"}`}
                  </Text>
                </View>
                
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isEmailMode ? styles.activeToggle : styles.inactiveToggle,
                    ]}
                    onPress={toggleEmailPhoneMode}
                  >
                    <Text style={styles.toggleButtonText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !isEmailMode
                        ? styles.activeToggle
                        : styles.inactiveToggle,
                    ]}
                    onPress={toggleEmailPhoneMode}
                  >
                    <Text style={styles.toggleButtonText}>Phone</Text>
                  </TouchableOpacity>
                </View>
                
                <CustomButton 
                  theme="primary" 
                  onPress={handleAuthentication}
                  disabled={!isFormValid || loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? (
                      <View>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={{ color: "white" }}>
                          {isSignIn ? "Signing In..." : "Signing Up..."}
                        </Text>
                      </View>
                    ) : (
                      <>{isSignIn ? "Sign In" : "Sign Up"}</>
                    )}
                  </Text>
                </CustomButton>
              </>
            )}

            {validOtp && (
              <CustomButton 
                theme="primary" 
                onPress={handleAuthentication} 
                disabled={!isFormValid || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? (
                    <View>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={{ color: "white" }}>
                        Logging in, Please Wait!
                      </Text>
                    </View>
                  ) : (
                    <>{isSignIn ? "Sign In" : "Sign Up"}</>
                  )}
                </Text>
              </CustomButton>
            )}

            <View style={styles.row}>
              <Text>
                {isSignIn
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)}>
                <Text style={styles.link}>
                  {isSignIn ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separatorContainer}>
              <View style={styles.separator} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.separator} />
            </View>

            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                style={styles.iconButton}
              >
                <Image
                  source={{
                    uri: "https://img.icons8.com/?size=48&id=17949&format=png",
                  }}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFacebookSignIn}
                style={styles.iconButton}
              >
                <Image
                  source={{
                    uri: "https://img.icons8.com/?size=48&id=uLWV5A9vXIPu&format=png",
                  }}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: 8,
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: "#6b6b6b" }}>
                By {isSignIn ? "signing in" : "signing up"}, you agree to our
              </Text>
              <TouchableOpacity>
                <Text style={styles.link}>Terms and Conditions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  link: {
    color: "blue",
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d1d1",
  },
  orText: {
    paddingHorizontal: 8,
    fontSize: 18,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  toggleInfoContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d1d1d1",
  },
  activeToggle: {
    backgroundColor: "blue",
    borderRadius: 5,
  },
  inactiveToggle: {
    backgroundColor: "lightgray",
    borderRadius: 5,
  },
  toggleButtonText: {
    color: "white",
  },
});

export default AuthScreen;