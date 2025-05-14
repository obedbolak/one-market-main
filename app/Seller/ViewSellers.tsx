import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ViewSellers = () => {
  const [sellersf, setSellersf] = useState([]);
  const [loading, setLoading] = useState(true);

  interface Seller {
    id: string;
    name: string;
    businessName: string;
    address: string;
    description: string;
    email: string;
    phoneNumber: string;
    profileImageUrl: string;
    createdAt: any; // Could be a Firebase timestamp or Date, handle appropriately
  }

  const handleSellerPush = (item: Seller) => {
    router.push(`/Seller/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sellersf}
        keyExtractor={(item: Seller) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => handleSellerPush(item)}
            style={styles.itemContainer}
          >
            <View>
              {item.profileImageUrl ? (
                <Image
                  source={{ uri: item.profileImageUrl }}
                  style={styles.image}
                />
              ) : (
                <Image
                  source={require("../../assets/images/prodimg/user.png")}
                  style={styles.image}
                />
              )}

              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  itemContainer: {
    flex: 1 / 3,
    padding: 8,
  },
  image: {
    width: "90%",
    height: 100,
    borderRadius: 50,
  },
  itemText: {
    textAlign: "center",
    marginTop: 8,
  },
});

export default ViewSellers;
