import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import PaymentComponent from "../components/PaymentComponent";
import PhoneField from "../components/PhoneField";

interface IImage {
  public_id: string;
  url: string;
}

interface Item {
  images: IImage[];
  name: string;
  price: number;
  product: string;
  quantity: number;
  sellerId: string;
  status: string;
  _id: string;
}

const MyProduct = ({
  onProductCountChange,
}: {
  onProductCountChange: (count: number) => void;
}) => {
  const [products, setProducts] = useState<Item[]>([]);
  const { userProfile } = useAuth();
  const [upgrade, setUpgrade] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("mtn");
  const [plan, setPlan] = useState<number>();
  const [boost, setBoost] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [boostedValue, setBoostValue] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(
    1000
  );
  const [momoPayNumber, setMomoPayNumber] = useState("");

  useEffect(() => {
    onProductCountChange(products.length);
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://onemarketapi.xyz/api/v1/product/get-all"
        );
        const data = await response.json();
        if (data.success) {
          const filteredProducts = data.products.filter(
            (product: Item) => product.sellerId === userProfile?._id
          );
          setProducts(filteredProducts);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [userProfile?._id]);

  const isPlanDisabled = (planNumber: number) => {
    return userProfile?.productPayments === planNumber;
  };

  // Helper function to split products into chunks of 2 for the grid
  const chunkArray = (array: Item[], chunkSize: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const productChunks = chunkArray(products, 2);

  return (
    <>
      {/* <TouchableOpacity
        onPress={() => router.push("/Merchant/CreateProduct")}
        style={{
          alignItems: "center",
          position: "absolute",
          top: "98%",
          right: 20,
          zIndex: 1,
          backgroundColor: "white",
          borderRadius: 50,
          padding: 10,
        }}
      >
        <Ionicons name="add-circle" size={50} color="black" />
      </TouchableOpacity> */}

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 10,
        }}
      >
        {boost && (
          <TouchableOpacity onPress={() => setBoost(false)}>
            <Ionicons name="arrow-back" color={"black"} size={24} />
          </TouchableOpacity>
        )}

        <Text style={{ color: "green", fontWeight: "bold" }}>
          {userProfile?.storeName}
        </Text>
        <Text>
          Plan:
          {userProfile?.productPayments === 1 && (
            <Text style={{ color: "green", fontWeight: "bold" }}> 10 </Text>
          )}
          {userProfile?.productPayments === 2 && (
            <Text style={{ color: "green", fontWeight: "bold" }}> 20 </Text>
          )}
          {userProfile?.productPayments === 3 && (
            <Text style={{ color: "green", fontWeight: "bold" }}> 49 </Text>
          )}
          {userProfile?.productPayments === 4 && (
            <Text style={{ color: "green", fontWeight: "bold" }}> 100 </Text>
          )}
        </Text>

        {/* <TouchableOpacity
          onPress={() => setUpgrade(!upgrade)}
          style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
        >
          <Text style={{ color: "skyblue", fontWeight: "bold" }}>Upgrade</Text>
          <Ionicons
            name={upgrade ? "chevron-down" : "chevron-forward"}
            size={15}
            color="black"
          />
        </TouchableOpacity> */}
      </View>

      {boost ? (
        <View style={{ alignItems: "center" }}>
          <Image
            source={{ uri: selectedItem?.images[0].url }}
            style={{ width: "100%", height: 400 }}
            resizeMode="contain"
          />

          <Text>{selectedItem?.name}</Text>
          <Text>XAF{selectedItem?.price}</Text>
          <View style={{ width: "100%", marginTop: 20 }}>
            <Ionicons name="information-circle-sharp" size={16} color="green" />
            <Text
              style={{ color: "green", fontWeight: "semibold", fontSize: 10 }}
            >
              Boost your product to the top of the list and frontpage
            </Text>
            <TextInput
              label="Amount"
              keyboardType="number-pad"
              value={boostedValue}
              maxLength={5}
              style={{
                backgroundColor: "rgba(135, 206, 235, 0.1)",
                marginBottom: 20,
              }}
              onChange={(event) => {
                const inputValue = event.nativeEvent.text;
                if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
                  setBoostValue(inputValue);
                }
              }}
            />

            <PhoneField
              label="Enter Momo Number"
              placeholder="Enter your phone number"
              value={momoPayNumber}
              onChangeText={(text) => setMomoPayNumber(text)}
              onClear={() => setMomoPayNumber("")}
              // Removed the style prop as PhoneField does not support it
              helperText="Please enter a valid Momo number"
              // Removed isInvalid as it is not a valid prop for PhoneField
              clearButtonVisible={true}
              // Removed isFocused as it is not a valid prop for PhoneField
            />
            <PaymentComponent
              mobileMoneyNumber={momoPayNumber}
              amount={parseFloat(boostedValue) || 0}
              userId={userProfile?._id || ""}
              orderDescription="Payment for groceries"
              onPaymentSuccess={async () => {
                console.log("Payment successful!");

                // Submit order or navigate to success screen
              }}
              onPaymentFailure={(error) => {
                Alert.alert("Payment Failed", "Please try again later.", [
                  { text: "OK" },
                ]);
              }}
              maxPollingAttempts={15} // Wait up to 75 seconds (15 * 5s)
              paymentMethod="mobile_money"
              disabled={momoPayNumber.length <= 12}
            />
          </View>
        </View>
      ) : (
        <ScrollView>
          {productChunks.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.itemContainer}
                  onPress={() => {
                    setBoost(!boost);
                    setSelectedItem(item);
                  }}
                >
                  <Image
                    source={{ uri: item.images[0].url }}
                    style={{ width: "100%", height: 100 }}
                    resizeMode="contain"
                  />
                  <Text>{item.name}</Text>
                  <Text>{item.price}</Text>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      left: 0,
                      backgroundColor: "rgba(135, 206, 235, 0.1)",
                      borderRadius: 5,
                      padding: 2,
                    }}
                    onPress={() => {
                      setBoost(!boost);
                      setSelectedItem(item);
                    }}
                  >
                    <Text
                      style={{
                        color: "skyblue",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Boost
                    </Text>
                    <Ionicons name="arrow-up" size={16} color="green" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              {row.length === 1 && <View style={styles.itemContainer} />}
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    alignItems: "center",
    width: Dimensions.get("window").width / 2 - 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default MyProduct;
