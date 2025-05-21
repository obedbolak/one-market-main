import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/context/ProductContext";
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

interface MyProductProps {
  onProductCountChange: (count: number) => void;
}

const MyProduct: React.FC<MyProductProps> = ({ onProductCountChange }) => {
  const { userProfile } = useAuth();
  const { products, loading, error, refreshData, deleteProduct } = useProduct();
  const [filteredProducts, setFilteredProducts] = useState<Item[]>([]);
  const [upgrade, setUpgrade] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("mtn");
  const [plan, setPlan] = useState<number>();
  const [boost, setBoost] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [boostedValue, setBoostValue] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [momoPayNumber, setMomoPayNumber] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

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
  const handleDelete = async (product_id: string) => {
    try {
      setFilteredProducts((prev) => prev.filter((item) => item._id !== product_id));

      setIsDeleting(true);
      await deleteProduct(product_id);
      // Product deleted successfully
    } catch (error) {
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
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
  <View 
    key={`row-${rowIndex}`} 
    style={{ 
      flexDirection: 'row', 
      gap: 16, 
      marginBottom: 16 
    }}
  >
    {row.map((item) => (
      <View 
        key={item._id} 
        style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Delete Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 8,
           left: 0,
            zIndex: 10,
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: 9999,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash" size={16} color="#dc2626" />
        </TouchableOpacity>

        {/* Product Image */}
        <View style={{ marginBottom: 12 }}>
          <Image
            source={{ uri: item.images[0]?.url }}
            style={{
              width: '100%',
              height: 120,
              borderRadius: 8,
              backgroundColor: '#f3f4f6',
            }}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View style={{ gap: 4 }}>
          <Text 
            style={{ 
              fontSize: 14, 
              fontWeight: '500',
              color: '#111827'
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text 
            style={{ 
              fontSize: 16, 
              fontWeight: '600',
              color: '#111827'
            }}
          >
            ${item.price.toFixed(2)}
          </Text>
        </View>

        {/* Boost Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
          onPress={() => {
            setBoost(!boost);
            setSelectedItem(item);
          }}
        >
          <Ionicons name="arrow-up" size={14} color="#3b82f6" />
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#3b82f6' }}>
            Boost
          </Text>
        </TouchableOpacity>
      </View>
    ))}
    
    {/* Empty card to fill row if needed */}
    {row.length === 1 && (
      <View style={{ flex: 1 }} />
    )}
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