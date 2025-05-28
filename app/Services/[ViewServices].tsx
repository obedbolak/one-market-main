import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CityField from "../components/CityField";
import DateTimeField from "../components/DateTimePicker";
import IdField from "../components/IdField";
import PhoneField from "../components/PhoneField";
import SeatSelector from "../components/SeatSelector";

interface IImage {
  public_id: string;
  url: string;
  _id: string;
}

interface FormData {
  branch: string;
  destination: string;
  selectedCity: string;
  selectedSeats: string[]; // Seats represented as strings, e.g., ['A1', 'B2']
  totalSeats: number;
  selectedMonth: string;
  selectedDay: number | null;
  selectedTime: string;
  fullName: string;
  email: string;
  phone: string;
  idType: "NID" | "Passport" | "Driver's License"; // Match enum
  idNumber: string;
  paymentMethod: "Momo" | "Credit Card" | "Pay on Delivery"; // Match enum
  momoNumber: string;
  totalPrice: number;
  specialRequests: string;
  name: string;
  selectedDocument?: string;
}

type InputChangeHandler = (
  field: keyof FormData,
  value: string | number | number[] | string[]
) => void;

interface Service {
  _id: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: IImage[];
  status: "active" | "inactive";
  createdAt: string;
  __v: number;
}

type PaymentMethod = "Momo" | "Credit Card" | "Pay on Delivery";
type IdType = "NID" | "Passport" | "Driver's License";

const ViewServices = () => {
  const { id, category } = useLocalSearchParams<{
    id: string;
    category: string;
  }>();
  const { services } = useProduct(); // <-- Use services from context

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [toggleBranch, settoggleBranch] = useState(false);
  const [toggleDestination, settoggleDstination] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [branch, setBranch] = useState("");
  const [destination, setDestination] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<String>("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [bookingNow, setBookingNow] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  const initialFormData: FormData = {
    name: "",
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "Momo",
    specialRequests: "",
    idType: "NID",
    idNumber: "",
    branch: "",
    destination: "",
    selectedSeats: [],
    selectedMonth: "",
    selectedDay: null,
    selectedTime: "",
    selectedCity: "",
    selectedDocument: "",
    totalSeats: 0,
    momoNumber: "",
    totalPrice: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const tabOrder = ["details", "trip", "payment", "extras"];

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const toggleSummaryModal = () => {
    if (showSummaryModal) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSummaryModal(false));
    } else {
      setShowSummaryModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    toggleSummaryModal();
    if (
      branch ||
      destination ||
      selectedCity ||
      formData.selectedSeats.length > 0
    ) {
      if (!showSummaryModal) {
        setShowSummaryModal(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (showSummaryModal) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowSummaryModal(false));
      }
    }
  }, [branch, destination, selectedCity, formData.selectedSeats]);

  const API_URL = "https://onemarketapi.xyz/api/v1/bus/bookings";

  const handleBooking = async () => {
    // Destructure values for easier checks
    const {
      branch,
      destination,
      selectedCity,
      selectedSeats,
      totalSeats,
      selectedMonth,
      selectedDay,
      selectedTime,
      fullName,
      email,
      phone,
      idType,
      idNumber,
      paymentMethod,
      momoNumber,
      totalPrice,
      specialRequests,
    } = formData;

    // Basic validation
    // if (
    //   !branch ||
    //   !destination ||
    //   !selectedCity ||
    //   !selectedSeats.length ||
    //   !selectedMonth ||
    //   !selectedDay ||
    //   !selectedTime ||
    //   !fullName ||
    //   !email ||
    //   !phone ||
    //   !idType ||
    //   !idNumber ||
    //   !paymentMethod ||
    //   totalSeats < 1
    // ) {
    //   Alert.alert("Error", "Please fill in all required fields.");
    //   return;
    // }

    if (paymentMethod === "Momo" && !momoNumber) {
      Alert.alert(
        "Error",
        "Please provide a Momo number for mobile money payment."
      );
      return;
    }

    const bookingPayload = {
      branch,
      destination,
      selectedCity,
      selectedSeats,
      totalSeats,
      selectedMonth,
      selectedDay,
      selectedTime,
      fullName,
      email,
      phone,
      idType,
      idNumber,
      paymentMethod,
      momoNumber: paymentMethod === "Momo" ? momoNumber : "", // Optional based on method
      totalPrice,
      specialRequests,
    };

    try {
      const response = await axios.post(
        "https://onemarketapi.xyz/api/v1/bus/",
        bookingPayload
      );
      console.log("Booking successful:", response.data);

      Alert.alert("Success", "Your booking has been submitted successfully.");

      // Reset form (optional)
      setFormData({
        branch: "",
        destination: "",
        selectedCity: "",
        selectedSeats: [],
        totalSeats: 0,
        selectedMonth: "",
        selectedDay: null,
        selectedTime: "",
        fullName: "",
        email: "",
        phone: "",
        idType: "NID",
        idNumber: "",
        paymentMethod: "Momo",
        momoNumber: "",
        totalPrice: 0,
        specialRequests: "",
        name: "",
      });
    } catch (error: any) {
      console.error("Booking failed:", error?.response?.data || error);
      Alert.alert(
        "Booking Error",
        error?.response?.data?.message || "Something went wrong."
      );
    }
  };

  const isFormDataValid = () => {
    const {
      name,
      email,
      phone,
      paymentMethod,
      idType,
      idNumber,
      branch,
      destination,
      selectedSeats,
      selectedMonth,
      selectedDay,
      selectedTime,
    } = formData;

    return (
      name &&
      email &&
      phone &&
      paymentMethod &&
      idType &&
      idNumber &&
      branch &&
      destination &&
      selectedSeats.length > 0 &&
      selectedMonth &&
      selectedDay &&
      selectedTime
    );
  };

  const handleSelectPayment = (paymentMethod: PaymentMethod) => {
    setSelectedPayment(paymentMethod);
  };

  const handleSelectDocument = (document: string) => {
    setSelectedDocument(document);
  };

  const increaseSeats = () => {
    setSeats(seats + 1);
  };

  useEffect(() => {
    if (id && services.length > 0) {
      const filteredService = services.find((service) => service._id === id);
      setService(filteredService || null);
      setLoading(false);
    }
  }, [id, category, services]);

  

  const handleInputChange: InputChangeHandler = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const renderPaymentSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Booking Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Name:</Text>
        <Text style={styles.summaryValue}>{formData.name}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Email:</Text>
        <Text style={styles.summaryValue}>{formData.email}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Phone:</Text>
        <Text style={styles.summaryValue}>{formData.phone}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>ID Type:</Text>
        <Text style={styles.summaryValue}>
          {formData.idType || "Not provided"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>ID Number:</Text>
        <Text style={styles.summaryValue}>
          {formData.idNumber || "Not provided"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Branch:</Text>
        <Text style={styles.summaryValue}>
          {formData.branch || "Not selected"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Destination:</Text>
        <Text style={styles.summaryValue}>
          {formData.destination || "Not selected"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Travel Date:</Text>
        <Text style={styles.summaryValue}>
          {formData.selectedDay && formData.selectedMonth
            ? `${formData.selectedDay} ${formData.selectedMonth}`
            : "Not selected"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Travel Time:</Text>
        <Text style={styles.summaryValue}>
          {formData.selectedTime || "Not selected"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Selected Seats:</Text>
        <Text style={styles.summaryValue}>
          {formData.selectedSeats.length > 0
            ? formData.selectedSeats.join(", ")
            : "No seats selected"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Price:</Text>
        <Text style={styles.summaryValue}>
          {formData.selectedSeats.length > 0
            ? `XAf${4500 * formData.selectedSeats.length}`
            : "$0"}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Payment Method:</Text>
        <Text style={styles.summaryValue}>
          {formData.paymentMethod || "Not selected"}
        </Text>
      </View>

      {formData.specialRequests && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Special Requests:</Text>
          <Text style={styles.summaryValue}>{formData.specialRequests}</Text>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
            <PhoneField
              label="Contact/Home Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              toggleBranch={toggleBranch}
              placeholder="Enter your phone number"
              helperText="Valid number where we can reach you at"
              clearButtonVisible={true}
              onClear={() => handleInputChange("phone", "")}
            />
            <IdField
              label="Identification Document"
              selectedIdType={formData.idType}
              onIdTypeChange={(type) => handleInputChange("idType", type)}
              idNumber={formData.idNumber}
              onIdNumberChange={(number) =>
                handleInputChange("idNumber", number)
              }
              placeholder="Enter your document number"
              helperText="Please provide a valid government-issued ID"
              required
            />
          </View>
        );
      case "trip":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Trip Summary</Text>
            <View style={styles.infoRow}>
              <CityField
                label="Select Branch"
                value={formData.branch}
                onChangeText={(text) => handleInputChange("branch", text)}
                toggleBranch={toggleBranch}
                settoggleBranch={settoggleBranch}
                placeholder="select branch"
              />
            </View>
            <View style={styles.infoRow}>
              <CityField
                label="Select Destination"
                value={formData.destination}
                onChangeText={(text) => handleInputChange("destination", text)}
                toggleBranch={toggleDestination}
                settoggleBranch={settoggleDstination}
                placeholder="select destination"
              />
            </View>
            <DateTimeField
              label="Delivery Date & Time"
              value={deliveryDate}
              onChange={(date) => {
                setDeliveryDate(date);
                const day = date.getDate();
                const month = date.toLocaleString("default", { month: "long" });
                const time = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                handleInputChange("selectedDay", day);
                handleInputChange("selectedMonth", month);
                handleInputChange("selectedTime", time);
              }}
              mode="datetime"
              placeholder="Select delivery date and time"
              helperText="We deliver between 9am and 9pm"
              minimumDate={new Date()}
            />
            <View style={styles.infoRow}>
              <SeatSelector
                onSeatsSelected={(selectedSeats) => {
                  handleInputChange("selectedSeats", selectedSeats);
                }}
                initialSelected={formData.selectedSeats}
                rows={10}
                seatsPerRow={4}
              />
            </View>
          </View>
        );
      case "payment":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formData.paymentMethod === "Momo" &&
                  styles.paymentOptionSelected,
              ]}
              onPress={() => {
                handleInputChange("paymentMethod", "mobile_money");
                setSelectedPayment("Momo");
              }}
            >
              <Text>Mobile Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formData.paymentMethod === "Credit Card" &&
                  styles.paymentOptionSelected,
              ]}
              onPress={() => {
                handleInputChange("paymentMethod", "credit_card");
                setSelectedPayment("Credit Card");
              }}
            >
              <Text>Credit Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formData.paymentMethod === "Pay on Delivery" &&
                  styles.paymentOptionSelected,
              ]}
              onPress={() => {
                handleInputChange("paymentMethod", "on_delivery");
                setSelectedPayment("Pay on Delivery");
              }}
            >
              <Text>Pay on Delivery</Text>
            </TouchableOpacity>
            {selectedPayment === "Momo" && (
              <PhoneField
                label="Enter Momo Number"
                value={formData.momoNumber}
                onChangeText={(text) => handleInputChange("momoNumber", text)}
                placeholder="Enter your momo number"
                helperText="it should be 9 digits, must be Orange or MTN"
                clearButtonVisible={true}
                onClear={() => handleInputChange("momoNumber", "")}
              />
            )}
            {renderPaymentSummary()}
          </View>
        );
      case "extras":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Any special requirements?"
              multiline
              value={formData.specialRequests}
              onChangeText={(text) =>
                handleInputChange("specialRequests", text)
              }
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Service not found</Text>
      </View>
    );
  }

  return (
    <>
      {bookingNow ? (
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            {tabOrder.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.title}>Booking Details</Text>
            <Text style={styles.description}>
              Please fill in the required details to proceed with your booking.
            </Text>

            {renderTabContent()}
          </ScrollView>

          <View style={styles.navigationContainer}>
            {activeTab !== "details" && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handlePrevious}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.navigationButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {activeTab === "extras" ? (
              <TouchableOpacity
                onPress={handleBooking}
                style={[
                  styles.confirmButton,
                  !isFormDataValid() && { backgroundColor: "#ccc" },
                ]}
                disabled={!isFormDataValid()}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handleNext}
              >
                <Text style={styles.navigationButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {service && service.images[selectedImageIndex] && (
              <Image
                source={{ uri: service.images[selectedImageIndex].url }}
                style={styles.mainImage}
              />
            )}
            <ScrollView horizontal contentContainerStyle={styles.imageList}>
              {service?.images.map((image, index) => (
                <TouchableOpacity
                  key={image._id}
                  style={[
                    styles.thumbnailContainer,
                    selectedImageIndex === index
                      ? styles.selectedThumbnail
                      : null,
                  ]}
                  onPress={() => handleImageSelect(index)}
                >
                  <Image source={{ uri: image.url }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.content}>
              <View
                style={{
                  flexDirection: "row",
                  maxWidth: "95%",
                  alignContent: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.title}>{service?.name}</Text>
                <Text style={[styles.description, { color: "orange" }]}>
                  {service?.location}
                </Text>
              </View>

              <Text style={styles.description}>{service?.description}</Text>

              <View style={{ flexDirection: "row", width: "80%" }}>
                <Ionicons name="location" size={24} color="orange" />
                <Text
                  style={[styles.description, { fontSize: 16, color: "green" }]}
                >
                  {service?.contactInfo}
                </Text>
              </View>

              {service?.email?.includes("@") ? (
                <View style={{ flexDirection: "row", width: "80%", gap: 4 }}>
                  <Ionicons name="mail" size={24} color="orange" />
                  <Text style={[styles.description, {}]}>Email:</Text>
                  <Text style={[styles.description, { fontWeight: "600" }]}>
                    {service?.email}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", width: "80%", gap: 4 }}>
                  <Ionicons name="call" size={20} color="orange" />
                  <Text style={[styles.description, {}]}>Phone:</Text>
                  <Text style={[styles.description, { fontWeight: "600" }]}>
                    {service?.email || "678695867"}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              opacity: fadeAnim,
            }}
          >
            {category === "Health" && (
              <>
                <Text style={styles.title}>24/7 Help.</Text>
                <TouchableOpacity
                  onPress={() => {}}
                  style={{
                    backgroundColor: "#007AFF",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>
                    Chat with Us
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {category === "Transportation" && (
              <>
                <Text style={styles.title}>Planning To travel</Text>
                <TouchableOpacity
                  onPress={() => {
                    setBookingNow(true);
                  }}
                  style={{
                    backgroundColor: "#007AFF",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>
                    Book a Ticket Now
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {category === "Real Estate" && (
              <>
                <Text style={styles.description}>
                  For more information, please contact us.
                </Text>
                <TouchableOpacity
                  onPress={() => {}}
                  style={{
                    backgroundColor: "#007AFF",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>
                    View Properties
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    color: "#64748b",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#1e293b",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  tabContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1e293b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  paymentOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#e0f2fe",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    marginBottom: 100,
  },
  mainImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    marginBottom: 16,
  },
  imageList: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  thumbnailContainer: {
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    padding: 2,
  },
  selectedThumbnail: {
    borderColor: "#007AFF",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#212529",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: "600",
    color: "#495057",
  },
  summaryValue: {
    color: "#212529",
    flexShrink: 1,
    textAlign: "right",
    maxWidth: "60%",
  },
});

export default ViewServices;
