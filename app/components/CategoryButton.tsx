import React from "react";
import {
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const CONTAINER_PADDING = 2; // 2px padding on each side

interface Category {
  id: string;
  text: string;
  image: any; // Consider using ImageSourcePropType from react-native
  backgroundColor: string;
}

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  // Colors could be moved to a theme file
  const theme = {
    selectedBg: "#FFFFFF",
    unselectedText: "#FFFFFF",
    selectedText: "#A0A0A0",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: isSelected
            ? theme.selectedBg
            : category.backgroundColor,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.text,
            {
              color: isSelected ? theme.selectedText : theme.unselectedText,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {category.text}
        </Text>
        <RNImage
          source={category.image}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8, // Slightly smaller for a more refined look
    paddingVertical: 3,
    height: 50,
    width: 70, // Fixed width for consistency
    shadowColor: "#000", // Subtle shadow for depth
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2, // Android shadow
  },
  contentContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600", // Slightly less bold than 'bold'
    textAlign: "center",
    maxWidth: "100%",
  },
  icon: {
    width: 24, // Slightly smaller for better proportion
    height: 24,
    marginTop: 4,
    tintColor: "currentColor", // Optional: if you want icons to match text color
  },
});

export default CategoryButton;
