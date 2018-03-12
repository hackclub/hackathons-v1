import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Tilt from 'react-tilt'
import axios from 'axios'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Text,
  Image,
  Input,
  theme,
} from '@hackclub/design-system'

const Base = Box.extend.attrs({
  m: 0,
})`
  width: 100vw;
`

const Subtitle = Text.extend`
  color: ${props => props.theme.colors.gray[6]};
`

const EventCard = Card.withComponent(Flex).extend.attrs({
  m: 3,
  align: 'center',
  boxShadowSize: 'md',
  color: 'slate',
  bg: 'white',
})`
  overflow: hidden;
  flex-direction: column;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.32);
  transition: transform .075s ease-out;
`

const Logo = Image.extend`
  position: absolute;
  margin-top: 3px;
  border-radius: 5px;
`

const humanizeNumber = num => {
  if (num < 10) {
    return parseFloat(num.toFixed(1))
  } else {
    return Math.round(num)
  }
}

const EventListing = ({
  website,
  name,
  start,
  end,
  startHumanized,
  endHumanized,
  city,
  state,
  image = 'https://s3.amazonaws.com/assets.mlh.io/events/splashes/000/000/693/thumb/1311a958833a-Image.jpg?1500306839',
  logo = 'https://s3.amazonaws.com/assets.mlh.io/events/logos/000/000/715/thumb/bm_logo_mlh-01.png?1502205705',
  distanceTo,
  startYear,
}) => {
  return (
    <Tilt options={{ max: 10, perspective: 500 }}>
      <Link href={website} target="_blank">
        <EventCard>
          <Logo src={logo} style={{ transform: 'translateZ(50px)' }} />
          <Box style={{ maxHeight: `${theme.space[2]}em`, overflow: 'hidden' }}>
            <Image src={image} />
          </Box>
          <Box p={2}>
            <Heading.h4>{name}</Heading.h4>
            <Subtitle>
              {start === end
                ? startHumanized
                : `${startHumanized}—${endHumanized}`}
              {new Date().getFullYear() !== parseInt(startYear)
                ? `, ${startYear}`
                : null}
            </Subtitle>
            <Subtitle>
              {distanceTo
                ? `${humanizeNumber(distanceTo)} miles`
                : `${city}, ${state}`}
            </Subtitle>
          </Box>
        </EventCard>
      </Link>
    </Tilt>
  )
}

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
        <Flex wrap justify="center">
          {events
            .sort((a, b) => {
              if (formattedAddress) {
                return (
                  this.distanceTo(a.latitude, a.longitude).miles -
                  this.distanceTo(b.latitude, b.longitude).miles
                )
              } else {
                return new Date(a.start) - new Date(b.start)
              }
            })
            .map((event, index) => (
              <EventListing
                {...event}
                distanceTo={
                  formattedAddress &&
                  this.distanceTo(event.latitude, event.longitude).miles
                }
                key={index}
              />
            ))}
        </Flex>
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
