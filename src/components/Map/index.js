import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Places from '../Places';
import {API_ENDPOINT, API_KEY} from '../../../contants';

class Map extends Component {
  state = {
    region: {
      latitude: 40.2216569,
      longitude: 28.9622494,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0411,
    },
    places: [],
    fetching: false,
  };

  async componentDidMount() {
    try {
      const {
        coords: {latitude, longitude},
      } = await this.getCurrentPosition();
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        region: {
          ...this.state.region,
          latitude,
          longitude,
        },
        fetching: true,
      });

      const {
        data: {results},
      } = await axios.get(
        `${API_ENDPOINT}/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=restaurant&key=${API_KEY}`,
      );

      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        places: results,
        fetching: false,
      });
    } catch (e) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        fetching: false,
      });
      // eslint-disable-next-line no-alert
      alert('Konum alınamadı');
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        () => reject(),
        {
          timeout: 5000,
          maximumAge: 1000,
          enableHighAccuracy: false,
        },
      );
    });
  }

  render() {
    return (
      <>
        <View style={styles.container}>
          <MapView
            style={styles.map}
            region={this.state.region}
            showsUserLocation={true}
            ref={ref => (this.map = ref)}>
            {this.state.places.map(place => {
              const {
                geometry: {
                  location: {lat, lng},
                },
              } = place;

              return (
                <Marker
                  key={place.id}
                  title={place.name}
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                />
              );
            })}
          </MapView>
          <View style={styles.placesContainer}>
            {this.state.fetching ? (
              <Text stye={styles.loading}>Loading nearby places...</Text>
            ) : (
              <Places map={this.map} places={this.state.places} />
            )}
          </View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
  },
  placesContainer: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    fontSize: 13,
    color: '#333',
  },
});

export default Map;
