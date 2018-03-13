import React, { Component } from 'react'
import Helmet from 'react-helmet'
import axios from 'axios'
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  Input,
  theme,
} from '@hackclub/design-system'
import EventCard from '../components/EventCard'

const Base = Box.extend.attrs({ m: 0 })`
  width: 100vw;
`

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      events: props.data.allEventsJson.edges.map(({ node }) => node),
      searchLat: null,
      searchLng: null,
      searchAddress: '',
      formattedAddress: undefined,
    }
  }

  distanceTo(eventLat, eventLng) {
    // https://www.geodatasource.com/developers/javascript
    const { searchLat, searchLng } = this.state
    if (!searchLat || !searchLng) {
      return NaN
    }
    const radEventLat = Math.PI * eventLat / 180
    const radSearchLat = Math.PI * searchLat / 180
    const theta = eventLng - searchLng
    const radtheta = Math.PI * theta / 180
    let dist =
      Math.sin(radEventLat) * Math.sin(radSearchLat) +
      Math.cos(radEventLat) * Math.cos(radSearchLat) * Math.cos(radtheta)
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    return {
      miles: dist,
      kilometers: dist * 1.609344,
    }
  }

  setCurrentLocation() {
    const geo = window.navigator.geolocation
    if (geo) {
      geo.getCurrentPosition(
        pos => {
          axios
            .get(
              `https://maps.google.com/maps/api/geocode/json?latlng=${
                pos.coords.latitude
              },${pos.coords.longitude}`
            )
            .then(resp => {
              const formattedAddress =
                resp.data.results[0] && resp.data.results[0].formatted_address
              this.setState({
                searchLat: pos.coords.latitude,
                searchLng: pos.coords.longitude,
                formattedAddress: formattedAddress,
                searchAddress: formattedAddress,
              })
            })
        },
        err => {
          alert(
            'We couldn’t get your current location. Search by address instead.'
          )
        }
      )
    } else {
      alert('We couldn’t get your current location. Search by address instead.')
    }
  }

  searchLocation() {
    const { searchAddress } = this.state
    if (searchAddress === '') {
      this.setState({
        searchLat: undefined,
        searchLng: undefined,
        formattedAddress: undefined,
      })
    } else {
      axios
        .get(
          `https://maps.google.com/maps/api/geocode/json?address=${encodeURI(
            searchAddress
          )}`
        )
        .then(resp => {
          const firstResult = resp.data.results[0]
          if (firstResult) {
            this.setState({
              searchLat: firstResult.geometry.location.lat,
              searchLng: firstResult.geometry.location.lng,
              formattedAddress: firstResult.formatted_address,
            })
          }
        })
    }
  }

  render() {
    const { events, searchAddress, formattedAddress } = this.state
    return (
      <Base>
        <Flex justify="flex-end">
          <Box w={0.5}>
            <Text>
              Here are {events.length} events, sorted{' '}
              {formattedAddress ? `near ${formattedAddress}` : 'date'}
            </Text>
          </Box>
          <Box w={0.5}>
            <Input
              placeholder="Where are you?"
              value={searchAddress}
              onKeyDown={event => {
                if (event.keyCode === 13 /* enter */) {
                  event.preventDefault()
                  this.searchLocation()
                }
              }}
              onChange={event => {
                const val = event.target.value
                setTimeout(() => {
                  if (val === this.state.searchAddress) {
                    this.searchLocation()
                  }
                }, 1250)
                this.setState({ searchAddress: val })
              }}
            />
            <Button
              inverted
              onClick={() => {
                this.setCurrentLocation()
              }}
            >
              Use my current location
            </Button>
          </Box>
        </Flex>
        <Container maxWidth={theme.space[5]}>
          <Flex wrap justify="center">
            {events
              .sort((a, b) => {
                if (formattedAddress) {
                  const distToA = this.distanceTo(a.latitude, a.longitude).miles
                  const distToB = this.distanceTo(b.latitude, b.longitude).miles
                  return distToA - distToB
                } else {
                  return new Date(a.start) - new Date(b.start)
                }
              })
              .map((event, index) => (
                <EventCard
                  {...event}
                  distanceTo={
                    formattedAddress
                      ? this.distanceTo(event.latitude, event.longitude).miles
                      : null
                  }
                  key={index}
                />
              ))}
          </Flex>
        </Container>
      </Base>
    )
  }
}

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          startHumanized: start(formatString: "MMMM DD")
          endHumanized: end(formatString: "DD")
          start
          end
          startYear: start(formatString: "YYYY")
          city: parsed_city
          state: parsed_state_code
          name
          website
          latitude
          longitude
        }
      }
    }
  }
`
