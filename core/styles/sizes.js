import { Dimensions } from "react-native";

const getWidth = () => {
  return Dimensions.get("window").width;
};

const getHeight = () => {
  return Dimensions.get("window").height;
};

export const deviceWidth = getWidth();
export const deviceHeight = getHeight();
export const guidelineBaseWidth = 414;
export const guidelineBaseHeight = 736;

export const scale = size => (deviceWidth / guidelineBaseWidth) * size;
export const verticalScale = size =>
  (deviceHeight / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;
export const vertModerateScale = (size, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;
