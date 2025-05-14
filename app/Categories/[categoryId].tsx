import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Predefined categories
const allCategories = [
  {
    id: "66fb22654dd7e644d9ec42c5",
    text: "Clothing",
    image:
      "https://cdn.pixabay.com/photo/2017/08/05/12/19/dress-2583113_960_720.jpg",
  },
  {
    id: "66f7de6e83d51f5b9939e46c",
    text: "Electronics",
    image:
      "https://cdn.pixabay.com/photo/2019/12/27/01/49/samsung-4721550_960_720.jpg",
  },
  {
    id: "6757fe27329dd6de0d15bbd8",
    text: "Jewelery",
    image:
      "https://cdn.pixabay.com/photo/2016/02/02/15/54/jewellery-1175532_960_720.jpg",
  },
  {
    id: "66fb20da4dd7e644d9ec42c1",
    text: "Home",
    image:
      "https://www.pngitem.com/pimgs/m/61-612748_home-appliances-background-home-appliances-images-png-transparent.png",
  },
  {
    id: "66fb23fe4dd7e644d9ec42c9",
    text: "Sport",
    image:
      "https://www.pngitem.com/pimgs/m/20-202915_png-sport-transparent-png.png",
  },
  {
    id: "66fb26094dd7e644d9ec42d1",
    text: "Automobile",
    image:
      "https://www.pngitem.com/pimgs/m/280-2804288_autos-chevrolet-spark-ng-harga-mobil-merk-toyota.png",
  },
  {
    id: "66fb27ea4dd7e644d9ec42d9",
    text: "Arts & Crafts",
    image:
      "https://www.pngitem.com/pimgs/m/30-300954_monarch-paint-brush-rollers-and-other-accessories-paint.png",
  },
  {
    id: "66fb26e54dd7e644d9ec42d5",
    text: "Pet Supplies",
    image:
      "https://www.pngitem.com/pimgs/m/325-3259002_discount-pet-supplies-pets-supplies-hd-png-download.png",
  },
];

interface ProductImage {
  public_id: string;
  url: string;
}

interface category {
  _id: string;
  category: string;
}

interface Product {
  id: string | string[];
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: category;
}

const categoryId = () => {
  const { categoryId } = useLocalSearchParams();
  const category = allCategories.find((c) => c.text === categoryId);
  console.log(categoryId);
  const XAFconverter = 600;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (category) {
      fetch("https://onemarketapi.xyz/api/v1/product/get-all")
        .then((res) => res.json())
        .then((data) => {
          // Check if data contains the 'products' key and it's an array
          if (Array.isArray(data.products)) {
            const filteredProducts = data.products.filter(
              (product: Product) => {
                // Check if category exists before filtering
                if (product.category && product.category._id) {
                  return product.category._id === category.id;
                }
                return false; // If no category._id, exclude this product
              }
            );
            setProducts(filteredProducts);
          } else {
            console.error(
              "API response does not contain products as an array",
              data
            );
          }
        })
        .catch((err) => console.error("Failed to fetch products:", err));
    }
  }, [category]);

  const handlecatitem = (item: Product) => {
    router.push(`/Product/${item._id}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View
      style={{
        flex: 1,
        margin: 5,
        backgroundColor: "rgba(0,0,0, 0.05)",
        paddingLeft: 18,
        borderRadius: 10,
        paddingTop: 5,
      }}
    >
      <TouchableOpacity onPress={() => handlecatitem(item)}>
        <Image
          source={{ uri: item.images[0].url }}
          style={{ width: "90%", height: 150, borderRadius: 5 }}
        />
        <Text>{item.name}</Text>
        <Text style={{ fontWeight: "bold" }}>
          XAF {(item.price * XAFconverter).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          backgroundColor: "rgba(0,0,0, 0.05)",
          height: 100,
          padding: 10,
          marginBottom: 10,
          width: "94%",
          marginHorizontal: "auto",
          borderRadius: 5,
        }}
      >
        <Image
          source={{ uri: category?.image }}
          style={{ width: 40, height: 40, borderRadius: 10 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {category?.text}
        </Text>
      </View>
      <View>
        <View>
          {/* Filters to filter products */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Filters</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Sort By</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default categoryId;
