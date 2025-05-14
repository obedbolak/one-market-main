import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
} from "react-native";

// Type for the banner item
interface BannerItem {
  _id: number | string;
  coverImageUri: string;
  cornerLabelText: string;
  cornerLabelColor: string;
}

// Sample banner data
const BannerData: BannerItem[] = [
  {
    _id: 1,
    coverImageUri:
      "https://e-e-1.myshopify.com/cdn/shop/files/banner-1.jpg?v=1613529175",
    cornerLabelColor: "#FFD300",
    cornerLabelText: "GOTY",
  },
  {
    _id: 2,
    coverImageUri:
      "https://e-e-1.myshopify.com/cdn/shop/files/banner-0014_0eb2ac16-1bfc-42b9-b768-5a719cc4764e_large.png?v=1613530586",
    cornerLabelColor: "#0080ff",
    cornerLabelText: "NEW",
  },
  {
    _id: 3,
    coverImageUri:
      "https://e-e-1.myshopify.com/cdn/shop/files/banner-0013_032da6a1-ed5b-446c-838b-a7cb52eb6606_large.png?v=1613530587",
    cornerLabelColor: "#2ECC40",
    cornerLabelText: "-75%",
  },
  {
    _id: 4,
    coverImageUri:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cornerLabelColor: "#2ECC40",
    cornerLabelText: "-20%",
  },
];

const BannerSection: React.FC = () => {
  const flatListRef = useRef<FlatList<BannerItem> | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Extend the BannerData with duplicate items at both ends for smooth looping
  const extendedBannerData = useMemo(
    () => [
      ...BannerData.slice(-1).map((item) => ({
        ...item,
        _id: `${item._id}-start`,
      })),
      ...BannerData.map((item) => ({
        ...item,
        _id: `${item._id}-main`,
      })),
      ...BannerData.slice(0, 1).map((item) => ({
        ...item,
        _id: `${item._id}-end`,
      })),
    ],
    []
  );

  useEffect(() => {
    // Auto-scroll the banner every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % extendedBannerData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [extendedBannerData]);

  useEffect(() => {
    if (activeIndex === 0) {
      // Jump to the real first item when it reaches the first extended banner
      flatListRef.current?.scrollToIndex({
        index: BannerData.length,
        animated: false,
      });
      setActiveIndex(BannerData.length);
    } else if (activeIndex === extendedBannerData.length - 1) {
      // Jump to the real last item when it reaches the last extended banner
      flatListRef.current?.scrollToIndex({
        index: 1,
        animated: false,
      });
      setActiveIndex(1);
    }
  }, [activeIndex, extendedBannerData.length]);

  // Render each banner with its discount label
  const renderItem = ({ item }: ListRenderItemInfo<BannerItem>) => (
    <View style={styles.bannerContainer}>
      <Image source={{ uri: item.coverImageUri }} style={styles.bannerImage} />
      <View
        style={[styles.cornerLabel, { backgroundColor: item.cornerLabelColor }]}
      >
        <Text style={styles.cornerLabelText}>{item.cornerLabelText}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={extendedBannerData}
      renderItem={renderItem}
      keyExtractor={(item) => item._id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      onScrollToIndexFailed={() => {}}
    />
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    height: 150, // Fixed height of 150px
    width: 600,
    // Fixed width for the banners
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bannerImage: {
    width: "100%", // Ensure the image fills the container width
    height: "100%",
    resizeMode: "cover",
  },
  cornerLabel: {
    position: "absolute",
    top: "80%",
    left: "60%",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  cornerLabelText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});

export default BannerSection;
