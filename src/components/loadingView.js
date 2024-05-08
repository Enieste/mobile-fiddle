import {ActivityIndicator, Text, View} from "react-native";
import React from "react";

const styles = {
    activityIndicatorContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255, .5)',
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }
};
const LoadingView = ({text = 'Loading...'}) => {
    return <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size={100} color='#4C92C1' />
        <Text>{text}</Text>
    </View>;
};

export default LoadingView;