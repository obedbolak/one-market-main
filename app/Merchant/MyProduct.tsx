import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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

interface MyProductProps {
  onProductCountChange: (count: number) => void;
}

const MyProduct: React.FC<MyProductProps> = ({ onProductCountChange }) => {
  const { userProfile } = useAuth();
  const { products, loading, error, refreshData } = useProduct();
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [upgrade, setUpgrade] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("mtn");
  const [plan, setPlan] = useState<number>();
  const [boost, setBoost] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [boostedValue, setBoostValue] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [momoPayNumber, setMomoPayNumber] = useState<string>("");

  useEffect(() => {
    onProductCountChange(products.length);
  }, [products, onProductCountChange]);

  useEffect(() => {
    if (products.length > 0 && userProfile?._id) {
      // Cast or map products to Item type if possible
      const filtered = (products as unknown as Item[]).filter(
        (product) => product.sellerId === userProfile._id
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [products, userProfile?._id]);


  //create a delete product function

  const deleteProduct = async (productId: string) => {
  try {
    // Replace with your actual API endpoint
    const response = await axios.delete(
      `https://onemarketapi.xyz/api/v1/product/${productId}`
    );

    if (response.status === 200) {
      Alert.alert("Success", "Product deleted successfully.");
      refreshData();
    } else {
      Alert.alert("Error", "Failed to delete product.");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    Alert.alert("Error", "An error occurred while deleting the product.");
  }
};
  
  const isPlanDisabled = (planNumber: number): boolean => {
    return userProfile?.productPayments === planNumber;
  };

  const chunkArray = (array: Item[], chunkSize: number): Item[][] => {
    const result: Item[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const productChunks = chunkArray(filteredProducts, 2);

  return (
    <>
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
              onChangeText={(text: string) => {
                if (text === "" || /^\d*\.?\d*$/.test(text)) {
                  setBoostValue(text);
                }
              }}
            />

            <PhoneField
              label="Enter Momo Number"
              placeholder="Enter your phone number"
              value={momoPayNumber}
              onChangeText={(text: string) => setMomoPayNumber(text)}
              onClear={() => setMomoPayNumber("")}
              helperText="Please enter a valid Momo number"
              clearButtonVisible={true}
            />
            <PaymentComponent
              mobileMoneyNumber={momoPayNumber}
              amount={parseFloat(boostedValue) || 0}
              userId={userProfile?._id || ""}
              orderDescription="Payment for groceries"
              onPaymentSuccess={async () => {
                console.log("Payment successful!");
              }}
              onPaymentFailure={(error: any) => {
                Alert.alert("Payment Failed", "Please try again later.", [
                  { text: "OK" },
                ]);
              }}
              maxPollingAttempts={15}
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
                <View key={item._id} style={{ flex: 1 }}>
                <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 0,
                  backgroundColor: "rgba(135, 206, 235, 0.1)",
                  borderRadius: 5,
                  padding: 2,
                  zIndex: 1,
                }}
                onPress={() => {
                  deleteProduct(item._id);

              }}
              >
                <Ionicons
                  name="trash"
                  size={24}
                  color="red"
                  style={{ marginBottom: 10 }}
                />
              </TouchableOpacity>
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => {
                    setBoost(!boost);
                    setSelectedItem(item);
                  }}
                >
               
                  <Image
                    source={{ uri: item.images[0]?.url }}
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
                </View>
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