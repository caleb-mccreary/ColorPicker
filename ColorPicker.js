/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import {useCallback, useMemo, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Slider from '@react-native-community/slider';

const PADDING = 20;
const SELECTOR_SIZE = 20;
const DEFAULT_COLORS = [
  {h: 0, s: 100, l: 50},
  {h: 39, s: 100, l: 50},
  {h: 60, s: 100, l: 50},
  {h: 120, s: 100, l: 25},
  {h: 240, s: 100, l: 50},
  {h: 275, s: 100, l: 25},
  {h: 300, s: 76, l: 72},
];

export default function ColorPicker() {
  const [dimensions, setDimensions] = useState({
    buttonDiameter: 0,
    pickerDiameter: 0,
  });
  const dimensionsRef = useRef(null);
  dimensionsRef.current = dimensions;

  const [brightness, setBrightness] = useState(83);
  const [selectedColor, setSelectedColor] = useState({h: 0, s: 0, l: brightness});

  const pan = React.useMemo(() => new Animated.ValueXY, []);
  const panResponder = React.useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: (event, gestureState) => {
        const pickerRadius = dimensionsRef.current.pickerDiameter / 2;
        pan.setOffset({
          x: event.nativeEvent.locationX - pickerRadius,
          y: event.nativeEvent.locationY - pickerRadius,
        });
        pan.setValue({
          x: 0,
          y: 0,
        });
        return true;
      },
      onPanResponderMove: (event, gestureState) => {
        return Animated.event(
          [
            null,
            { dx: pan.x, dy: pan.y },
          ],
          {
            useNativeDriver: false,
            listener: updateColor(event, gestureState),
          },
        )(event, gestureState)
      },
      onPanResponderRelease: (event, gestureState) => {
        pan.flattenOffset();
        pan.extractOffset();
      }
    }), []);

  const onLayout = (event) => {
    const {width, height, x, y} = event.nativeEvent.layout;
    const buttonDiameter = (width - PADDING / 2) / DEFAULT_COLORS.length;
    const pickerDiameter = width - PADDING * 4;
    setDimensions({buttonDiameter, pickerDiameter, width, height, x, y});
  };

  const hslToString = (h, s, l) => {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  const polarToHSL = (radius, theta) => {
    const h = theta;
    let s = radius;
    let v = 1;

    let l = (2 - s) * (v / 2);
    if (l === 1) {
      s = 0;
    } else if (l < 0.5) {
      s = (s * v) / (l * 2);
    } else {
      s = s * v / (2 - l * 2);
    }

    s *= 100;
    l *= 100;

    return {h, s, l};
  };

  const hslToCartesian = (h, s, l) => {
    h *= Math.PI / 180;
    s /= 100;
    l /= 100;

    const v = l + s * Math.min(l, 1 - l);
    if (v === 0) {
      s = 0;
    } else {
      s = 2 * (1 - l / v);
    }

    const pickerRadius = dimensionsRef.current.pickerDiameter / 2;
    const x = s * Math.cos(h) * pickerRadius;
    const y = s * Math.sin(h) * pickerRadius * (v < 0.5 ? 1 : -1);

    return { x, y };
  }

  const outOfBounds = (radius) => {
    return radius >= 1.0;
  };

  const cartesianToPolar = (x, y) => {
    const radius = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x) * -180 / Math.PI;

    return {radius, theta};
  }

  const updateColor = (event, gestureState) => {
    const x = 2 * event.nativeEvent.locationX / dimensionsRef.current.pickerDiameter - 1;
    const y = 2 * event.nativeEvent.locationY / dimensionsRef.current.pickerDiameter - 1;
    const {radius, theta} = cartesianToPolar(x, y);
    if (outOfBounds(radius)) {
      return;
    }
    const {h, s, l} = polarToHSL(radius, theta);
    setBrightness(l);
    setSelectedColor({h, s, l});
  };


  const onPressDefaultColor = (color) => {
    return () => {
      const {h, s, l} = color;
      setBrightness(l);
      setSelectedColor({h, s, l});
      const {x, y} = hslToCartesian(h, s, l);
      pan.setOffset({
        x: x,
        y: y,
      });
      pan.setValue({
        x: 0,
        y: 0,
      });
    }
  };

  const onSliderValueChange = ((value) => {
    setBrightness(value);
    setSelectedColor({h: selectedColor.h, s: selectedColor.s, l: value});
    const {x, y} = hslToCartesian(selectedColor.h, selectedColor.s, value);
    if (value <= 50) {
      return
    }
    pan.setOffset({
      x: x,
      y: y,
    });
    pan.setValue({
      x: 0,
      y: 0,
    });
  });

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={[styles.header, {color: hslToString(selectedColor.h, selectedColor.s, selectedColor.l)}]}>
          {'New Color'}
        </Text>
        <View onLayout={onLayout} style={styles.pickerContainer}>
          <Image
            source={require('./color_wheel.png')}
            style={{
              width: dimensionsRef.current.pickerDiameter,
              height: dimensionsRef.current.pickerDiameter,
            }}
            {...panResponder.panHandlers}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.selector, {
              backgroundColor: hslToString(selectedColor.h, selectedColor.s, selectedColor.l),
              transform: pan.getTranslateTransform(),
            }]}
          />
        </View>
        <Slider
          minimumTrackTintColor={hslToString(selectedColor.h, selectedColor.s, selectedColor.l)}
          minimumValue={0}
          maximumValue={100}
          onValueChange={onSliderValueChange}
          step={1}
          style={{
            alignSelf: 'center',
            marginTop: 40,
            width: dimensionsRef.current.pickerDiameter
          }}
          thumbTintColor={hslToString(selectedColor.h, selectedColor.s, selectedColor.l)}
          value={brightness}
        />
      </View>
      <View style={styles.defaultColorsContainer}>
        {DEFAULT_COLORS.map((color, index) =>
          <TouchableOpacity
            key={index}
            onPress={onPressDefaultColor(color)}
            style={{
              width: dimensionsRef.current.buttonDiameter,
              height: dimensionsRef.current.buttonDiameter,
              backgroundColor: hslToString(color.h, color.s, color.l),
              borderRadius: dimensionsRef.current.buttonDiameter / 2,
              marginRight: 10,
              marginTop: 10,
              elevation: hslToString(selectedColor.h, selectedColor.s, selectedColor.l) === hslToString(color.h, color.s, color.l) ? 5 : 0,
            }}
          />
        )}
      </View>
      <View style={[styles.footer, {backgroundColor: hslToString(selectedColor. h, selectedColor.s, selectedColor.l)}]} />
      <View style={[styles.banner, {backgroundColor: hslToString(selectedColor. h, selectedColor.s, selectedColor.l)}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 20,
    position: 'absolute',
    top: 0,
  },
  background: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: PADDING,
  },
  defaultColorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    marginVertical: 20,
    marginHorizontal: PADDING,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    marginTop: 20,
  },
  footer: {
    height: 1000,
    width: 1000,
    position: 'absolute',
    bottom: -825,
    left: -325,
    borderRadius: 500,
    zIndex: -1,
  },
  selector: {
    width: SELECTOR_SIZE,
    height: SELECTOR_SIZE,
    borderRadius: SELECTOR_SIZE / 2,
    borderColor: 'white',
    borderWidth: 3,
    elevation: 5,
    position: 'absolute',
  },
});