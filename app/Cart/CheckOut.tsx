import { useAuth } from "@/context/AuthContext";
import { clearCart } from "@/store/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";
import ProgressBar from "react-native-progress/Bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import CityField from "../components/CityField";
import PhoneField from "../components/PhoneField";
import QuarterField from "../components/QuarterField";

const { width, height } = Dimensions.get("window");

interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  images: ProductImage[];
  sellerId: string;
}

interface ProductImage {
  public_id: string;
  url: string;
}

// Add these interfaces
interface OrderPaymentInfo {
  id?: string;
  status: string;
  mobileMoneyName?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
}

interface OrderSubmissionData {
  shippingInfo: ShippingInfo;
  orderItems: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  paymentMethod: string;
  paymentInfo: OrderPaymentInfo;
  itemPrice: number;
  tax: number;
  Uid: string | undefined;
  shippingCharges: number;
  totalAmount: number;
}
type PaymentStatus = "idle" | "pending" | "success" | "failed";

const CheckOut: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const { userProfile, getUserProfile } = useAuth();
  const [mobileMoneyName, setMobileMoneyName] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    city: "",
    postalCode: "",
    country: "Cameroon",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "Payment_On_Delivery" | "Mobile_Money"
  >("Payment_On_Delivery");
  const [mobileMoneyPaymentMethod, setMobileMoneyPaymentMethod] =
    useState<string>("MTN");
  const [review, setReview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citySelect, setCitySelect] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const MAX_POLLING_ATTEMPTS = 12;
  const [paymentState, setPaymentState] = useState<PaymentStatus>("idle");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [loading, setLoading] = useState(true);
  
  // Fetch user profile when the component is mounted
  // Initialize form with user data
   useEffect(() => {
     const loadProfile = async () => {
       try {
         await getUserProfile();
         setLoading(false);
       } catch (error) {
         console.error("Failed to load profile:", error);
         setLoading(false);
       }
     };
 
     loadProfile();
   }, []);
 
   // Update form when userProfile changes
   useEffect(() => {
     if (userProfile) {
       
       
     }
   }, [userProfile]);
  const prepareOrderData = (): OrderSubmissionData => {
    const itemPrice = cartItems.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );

    const tax = itemPrice * 0.05; // 5% tax example
    const Uid = userProfile?._id;
    const orderItems = cartItems.map((item: CartItem) => ({
      product: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images[0].url,
      sellerId: item.sellerId,
    }));

    const paymentInfo: OrderPaymentInfo = {
      status:
        paymentMethod === "Payment_On_Delivery" ? "pending" : "processing",
      ...(paymentMethod === "Mobile_Money" && {
        mobileMoneyName: `${userProfile?.name} `,
        mobileMoneyNumber,
        mobileMoneyProvider: mobileMoneyPaymentMethod,
      }),
    };

    return {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      Uid,
      shippingCharges: shippingFees,
      totalAmount: calculateTotalPrice(),
    };
  };
  const shippingFees = 0;

  const calculateTotalPrice = () => {
    const totalItemsPrice = cartItems.reduce(
      (total: number, item: { price: number; quantity: number }) =>
        total + item.price * item.quantity,
      0
    );
    return totalItemsPrice + shippingFees;
  };

  const submitOrder = async () => {
    try {
      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync("token");
      console.log("Token:", token);
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }
      const orderData = prepareOrderData();
      console.log("Order Data:", orderData);

      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/orders/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add your authentication headers here
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      // Clear cart and show success message
      dispatch(clearCart());
      Alert.alert("Success", "Your order has been placed successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSection = () => {
    // Go to the next section
    if (activeSection < 2) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePreviousSection = () => {
    // Go to the previous section
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleSubmit = () => {
    if (!paymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    submitOrder();
  };

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentState("pending");

      const paymentData = {
        payer: mobileMoneyNumber.replace("+", ""),
        amount: calculateTotalPrice(),
        externalId: `${userProfile?._id}`,
        description: `Payment for order ${shippingInfo.address}`,
      };

      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/payments/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      setReferenceId(data.referenceId || data.reference);
      startPaymentStatusPolling(data.referenceId || data.reference);
    } catch (error) {
      console.error("Payment Failed:", error);
      setPaymentState("failed");
      setIsProcessingPayment(false);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Payment failed"
      );
    }
  };
  const startPaymentStatusPolling = (paymentReference: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setPollingAttempts(0);

    const interval = setInterval(async () => {
      try {
        setPollingAttempts((prev) => prev + 1);

        const response = await fetch(
          `https://onemarketapi.xyz/api/v1/payments/status/${paymentReference}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch payment status");
        }

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("success");
          setIsProcessingPayment(false);
          await submitOrder();
        } else if (data.status === "PENDING") {
          setPaymentState("pending");
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);

          Alert.alert("Error", "Payment failed. Please try again.");
        } else if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);
          Alert.alert(
            "Timeout",
            "Payment status check timed out. Please verify your payment."
          );
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
        if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentState("failed");
          setIsProcessingPayment(false);
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "Failed to verify payment status"
          );
        }
      }
    }, 5000);

    setPollingInterval(interval);
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const url = "https://onemarketapi.xyz/api/twilio/send-sms";
  const userPhone = userProfile?.phone.includes("+") ? userProfile.phone : "";

  const sendSMS = async () => {
    try {
      const payload = {
        to: userPhone, //
        body: "Thank You For Your sucessfull Order The seller with contact you Soon",
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
  console.log(userPhone);
  return (
    <SafeAreaView>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 12, left: 15, top: 20 }}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView style={styles.container}>
        <ProgressBar
          progress={(activeSection + 1) / 3}
          width={null}
          height={8}
          borderRadius={5}
          color="green"
          style={styles.progressBar}
        />
        <TouchableWithoutFeedback onPress={() => setCitySelect(false)}>
          {/* Shipping Information Section */}
          <View style={styles.section}>
            {activeSection === 0 && (
              <>
                <Text style={styles.sectionTitle}>Shipping Information</Text>
                <View style={styles.formSection}>
                  {/* <TextInput
                    placeholder="Enter E-mail / Phone Number"
                    value={shippingInfo.address}
                    onChangeText={(text) =>
                      setShippingInfo({ ...shippingInfo, address: text })
                    }
                    style={styles.input}
                  /> */}
                  <PhoneField
                    label="Enter E-mail / Phone Number"
                    value={shippingInfo.address}
                    onChangeText={(text) =>
                      setShippingInfo({ ...shippingInfo, address: text })
                    }
                    placeholder="Enter Phone Number"
                    helperText="Please enter your Phone Number"
                    onClear={() =>
                      setShippingInfo({ ...shippingInfo, address: "" })
                    }
                    clearButtonVisible={!!shippingInfo.address}
                    
                    
                
                  />

                  <CityField
                    label="Enter city"
                    placeholder="Enter city(Yaounde, Douala)"
                    value={shippingInfo.city}
                    onChangeText={(text) =>
                      setShippingInfo({ ...shippingInfo, city: text })
                    }
                    onClear={() =>
                      setShippingInfo({ ...shippingInfo, city: "" })
                    }
                    clearButtonVisible={!!shippingInfo.city}
                    settoggleBranch={setCitySelect}
                  />

                  <QuarterField
                    placeholder="Quarter(Bastos, Etoug'Ebe)"
                    value={shippingInfo.postalCode}
                    onChangeText={(text) =>
                      setShippingInfo({ ...shippingInfo, postalCode: text })
                    }
                    onClear={() =>
                      setShippingInfo({ ...shippingInfo, postalCode: "" })
                    }
                    clearButtonVisible={!!shippingInfo.postalCode}
                    label="Enter Quarter"
                  />

                  <TextInput
                    placeholder="Enter country"
                    value={shippingInfo.country}
                    style={styles.input}
                  />
                  <Button
                    title="Next"
                    onPress={handleNextSection}
                    disabled={
                      !shippingInfo.address ||
                      !shippingInfo.city ||
                      !shippingInfo.postalCode ||
                      !shippingInfo.country
                    }
                  />
                </View>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
        {/* Payment Method Section */}
        <View style={styles.section}>
          {activeSection === 1 && (
            <>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.formSection}>
                <Text style={styles.paymentLabel}>Select Payment Method:</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioItem}>
                    <RadioButton
                      value="Payment_On_Delivery"
                      status={
                        paymentMethod === "Payment_On_Delivery"
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setPaymentMethod("Payment_On_Delivery")}
                    />
                    <Text>Payment on Delivery</Text>
                  </View>
                  {paymentMethod === "Payment_On_Delivery" && (
                    <View style={{ marginHorizontal: 15 }}>
                      <Text>Note:</Text>
                      <Text style={{ color: "green", maxWidth: "90%" }}>
                        Please note that All Payments should be done through the
                        Platform
                      </Text>
                    </View>
                  )}
                  <View style={styles.radioItem}>
                    <RadioButton
                      disabled={true}
                      value="Mobile_Money"
                      status={
                        paymentMethod === "Mobile_Money"
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setPaymentMethod("Mobile_Money")}
                    />
                    <Text>Mobile Money</Text>
                  </View>
                  {paymentMethod === "Mobile_Money" && (
                    <View style={styles.mobileMoneyContainer}>
                      <Text style={styles.providerTitle}>
                        Select Mobile Money Provider
                      </Text>
                      <View style={styles.providerButtonContainer}>
                        <TouchableOpacity
                          onPress={() => setMobileMoneyPaymentMethod("MTN")}
                          style={[
                            styles.providerButton,
                            {
                              backgroundColor:
                                mobileMoneyPaymentMethod === "MTN"
                                  ? "#4CAF50"
                                  : "#FFFFFF",
                              borderColor:
                                mobileMoneyPaymentMethod === "MTN"
                                  ? "#4CAF50"
                                  : "#E0E0E0",
                            },
                          ]}
                        >
                          <Image
                            source={require("@/assets/images/prodimg/mtn.png")}
                            style={styles.providerLogo}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setMobileMoneyPaymentMethod("orange")}
                          style={[
                            styles.providerButton,
                            {
                              backgroundColor:
                                mobileMoneyPaymentMethod === "orange"
                                  ? "#FF5722"
                                  : "#000000",
                              borderColor:
                                mobileMoneyPaymentMethod === "orange"
                                  ? "#FF5722"
                                  : "#000000",
                            },
                          ]}
                        >
                          <Image
                            source={require("@/assets/images/prodimg/orange.jpg")}
                            style={styles.providerLogo}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      {mobileMoneyPaymentMethod === "orange" && (
                        <PhoneField
                          label="Enter your Orange Number"
                          value={mobileMoneyNumber}
                          onChangeText={setMobileMoneyNumber}
                          placeholder="Enter your Orange Number"
                          helperText="Please enter your Orange Number"
                          onClear={() => setMobileMoneyNumber("")}
                          clearButtonVisible={!!mobileMoneyNumber}
                         
                          
                        />
                      )}
                      {mobileMoneyPaymentMethod === "MTN" && (
                        <PhoneField
                          label="Enter your MTN number"
                          value={mobileMoneyNumber}
                          onChangeText={setMobileMoneyNumber}
                          placeholder="Enter your MTN number"
                          helperText="Please enter your MTN number"
                          onClear={() => setMobileMoneyNumber("")}
                          clearButtonVisible={!!mobileMoneyNumber}
                         
                          
                        />
                      )}
                    </View>
                  )}
                </View>
                <Button
                  title="Next"
                  onPress={handleNextSection}
                  disabled={
                    paymentMethod === "Mobile_Money" &&
                    (!mobileMoneyNumber || mobileMoneyNumber.length < 12)
                  }
                />
                <Button title="Previous" onPress={handlePreviousSection} />
              </View>
            </>
          )}
        </View>

        {/* Review Order Section */}
        <View style={styles.section}>
          {activeSection === 2 && (
            <>
              <Text style={styles.sectionTitle}>Review Order</Text>
              <View style={styles.reviewContainer}>
                {/* Shipping Address */}
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewTitle}>Shipping Address:</Text>
                  <View>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>Email/Phone:</Text>
                      <Text style={styles.reviewDetail}>
                        {shippingInfo.address}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>City:</Text>
                      <Text style={styles.reviewDetail}>
                        {shippingInfo.city}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>Quarter:</Text>
                      <Text style={styles.reviewDetail}>
                        {shippingInfo.postalCode}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>Country:</Text>
                      <Text style={styles.reviewDetail}>
                        {shippingInfo.country}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Items in Cart */}
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewTitle}>Items in Cart:</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      height: 120, // Set a fixed height
                      overflow: "hidden", // Use hidden instead of scroll
                    }}
                  >
                    {cartItems.map((item: CartItem) => (
                      <View
                        key={item._id}
                        style={[
                          styles.cartItem,
                          {
                            marginRight: 10, // Add spacing between items
                            width: 100, // Set a fixed width for each item
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: item.images[0].url }}
                          style={{ height: 80, width: 80, alignSelf: "center" }}
                        />
                        <Text style={styles.cartItemText} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text>
                          XAF{item.price} x {item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Summary */}
                <View style={styles.reviewItem}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      maxWidth: "95%",
                    }}
                  >
                    <Text style={styles.reviewTitle}>Shipping Fees:</Text>
                    <Text style={styles.reviewDetail}>XAF{shippingFees}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      maxWidth: "95%",
                    }}
                  >
                    <Text style={styles.reviewTitle}>Total:</Text>
                    <Text style={styles.totalPrice}>
                      XAF{calculateTotalPrice()}
                    </Text>
                    {/* payment method */}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text style={[styles.reviewDetail, { fontWeight: "bold" }]}>
                      {paymentMethod}
                    </Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  {/* <PaymentButton
                    paymentMethod={paymentMethod}
                    onPayment={async () => {
                      if (paymentMethod === "Mobile_Money") {
                        await handlePayment();
                        return true;
                      } else {
                        handleSubmit();
                        return true;
                      }
                    }}
                    onDeliveryConfirmation={() => {
                      if (
                        !shippingInfo.address ||
                        !shippingInfo.city ||
                        !shippingInfo.postalCode ||
                        !shippingInfo.country ||
                        !mobileMoneyNumber
                      ) {
                        Alert.alert("Error", "Please complete all fields.");
                      }
                    }}
                  /> */}
                  <TouchableOpacity
                    onPress={async () => {
                      if (isSubmitting || isProcessingPayment) return;

                      if (paymentMethod === "Mobile_Money") {
                        await handlePayment();
                      } else if (paymentMethod === "Payment_On_Delivery") {
                        setIsSubmitting(true);
                        sendSMS();
                        handleSubmit();
                      }
                    }}
                    style={{
                      backgroundColor:
                        isSubmitting || isProcessingPayment ? "gray" : "green",
                      padding: 15,
                      borderRadius: 5,
                      flex: 1,
                      marginRight: 10,
                    }}
                    disabled={isSubmitting || isProcessingPayment}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      {isProcessingPayment
                        ? "Processing Payment..."
                        : isSubmitting
                        ? "Placing Order..."
                        : "Place Order"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePreviousSection}
                    style={{
                      backgroundColor: "#FF5722",
                      padding: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "white" }}>Previous</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mobileMoneyContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  providerButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 15,
  },
  providerButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  providerLogo: {
    width: 100,
    height: 50,
  },
  mobileMoneyDetailsContainer: {
    marginBottom: 15,
  },
  mobileMoneyInput: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  numberVerificationContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    marginLeft: 5,
  },
  verificationNote: {
    color: "#4CAF50",
    fontSize: 12,
    textAlign: "center",
  },
  container: {
    padding: 20,
    paddingTop: 40,
    height: height,
  },
  progressBar: {
    marginBottom: 20,
  },

  formSection: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    fontSize: width > 600 ? 16 : 14,
  },
  paymentLabel: {
    fontSize: width > 600 ? 18 : 16,
    marginBottom: 10,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: width > 600 ? 22 : 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  reviewContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  reviewDetail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 15,
  },
  cartItem: {
    width: "45%", // Slightly less than half to allow for some spacing
    marginBottom: 15,
    alignItems: "center",
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cartItemText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    textAlign: "center",
    maxWidth: 120,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusContainer: {
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
  },
  statusPending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
  },
  statusSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  statusFailed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
  },
  statusText: {
    color: "white",
    marginLeft: 10,
  },
});

export default CheckOut;
