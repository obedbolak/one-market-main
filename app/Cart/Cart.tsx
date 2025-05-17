import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "../../store/cartSlice";

interface ProductImage {
  public_id: string;
  url: string;
}

interface Category {
  _id: string;
  category: string;
}

interface Product {
  quantity: number;
  id: string | string[];
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  sellerId: string;
}

const Cart: React.FC = () => {
  const { userProfile, getUserProfile } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  useEffect(() => {
    getUserProfile();
  }, []);

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return; // Prevent negative quantity
    dispatch(updateQuantity({ id: productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handlesignup = () => {
    router.push({
      pathname: "/(auth)/AuthScreen",
      params: { mode: "signup" },
    });
  };

  const handlesignin = () => {
    router.push({
      pathname: "/(auth)/AuthScreen",
      params: { mode: "signin" },
    });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <Image
        source={{ uri: item.images[0]?.url }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text numberOfLines={2}>{item.description}</Text>
        <View
          style={{
            flexDirection: "row",
            width: 190,
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 60,
          }}
        >
          <Text style={styles.productPrice}>XAF{item.price}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item._id, item.quantity - 1)}
              style={{
                backgroundColor: "skyblue",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 5,
              }}
            >
              <Text>{"-"}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={item.quantity.toString()}
              onChangeText={(text) =>
                handleQuantityChange(item._id, parseInt(text, 10))
              }
            />

            <TouchableOpacity
              onPress={() => handleQuantityChange(item._id, item.quantity + 1)}
              style={{
                backgroundColor: "skyblue",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 5,
              }}
            >
              <Text>{"+"}</Text>
            </TouchableOpacity>
          </View>
          <Ionicons
            name="trash"
            size={23}
            color={"orange"}
            onPress={() => handleRemove(item._id)}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Cart</Text>
        </View>

        {cartItems.length === 0 ? (
          <Text>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
          />
        )}
        {cartItems.length > 0 && (
          <>
            <Text style={styles.total}>
              Total: XAF
              {cartItems.reduce(
                (total: number, product: { price: number; quantity: number }) =>
                  total + product.price * product.quantity,
                0
              )}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              {!userProfile?._id  ? (
                <>
                  <TouchableOpacity
                    onPress={handleClearCart}
                    style={{
                      padding: 10,
                      backgroundColor: "skyblue",
                      width: 160,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Clear Cart
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={handlesignup}
                      style={{
                        backgroundColor: "skyblue",
                        padding: 12,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlesignin}
                      style={{
                        backgroundColor: "skyblue",
                        padding: 10,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => router.push("/Cart/CheckOut")}
                    style={{
                      padding: 10,
                      backgroundColor: "skyblue",
                      width: 160,
                      borderRadius: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Proceed to Checkout
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClearCart}
                    style={{
                      padding: 10,
                      backgroundColor: "skyblue",
                      width: 160,
                      borderRadius: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Clear Cart
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productPrice: {
    color: "#FF5722",
    fontSize: 16,
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingRight: 39,
  },
  quantityInput: {
    width: 40,
    height: 30,
    borderColor: "#ddd",
    borderWidth: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
});

export default Cart;
