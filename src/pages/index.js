import React, { Component, Fragment } from 'react'
import Helmet from 'react-helmet'
import axios from 'axios'
import {
  Box,
  Container,
  Flex,
  Text,
  Image,
  Link as L,
  Heading,
  Section,
  theme,
} from '@hackclub/design-system'
import EventCard from 'components/EventCard'
import flag from 'static/flag.svg'
import { distance } from 'utils'

const Base = Box.extend.attrs({ m: 0 })`
  width: 100vw;
`

const Link = L.extend`
  color: ${props => props.theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

export default class extends Component {
  constructor(props) {
    super(props)

    // This spagetti filters out events from before this school year
    let beginningOfSchoolYear
    const now = new Date()
    if (now.getMonth() < 7 /* august */) {
      beginningOfSchoolYear = new Date(now.getYear() - 1, 7)
    } else {
      beginningOfSchoolYear = new Date(now.getYear(), 7)
    }

    const events = props.data.allEventsJson.edges
      .map(({ node }) => node)
      .filter(event => new Date(event.start) > beginningOfSchoolYear)

    this.state = {
      events: events,
      searchLat: null,
      searchLng: null,
      searchAddress: '',
      formattedAddress: undefined,
      hidePastEvents: false,
      sortByProximity: false,
    }

    this.stats = {
      total: events.length,
      state: new Set(events.map(event => event.parsed_state)).size,
      country: new Set(events.map(event => event.parsed_country)).size,
    }
  }

  distanceTo(eventLat, eventLng) {
    const { searchLat, searchLng } = this.state
    if (!searchLat || !searchLng) {
      return undefined
    }
    return distance(eventLat, eventLng, searchLat, searchLng)
  }

  setCurrentLocation(cb) {
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
                sortByProximity: true,
              })
            })
        },
        err => {
          alert('We couldn’t get your current location.')
        }
      )
    } else {
      alert('We couldn’t get your current location.')
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
    const {
      events,
      searchAddress,
      formattedAddress,
      hidePastEvents,
    } = this.state
    return (
      <Fragment>
        <Base>
          <Image src={flag} width="10em" ml="5em" />
          <Container maxWidth={theme.space[5]} align="center">
            <Heading.h1 my={5}>
              Upcoming High School Hackathons in {new Date().getFullYear()}
            </Heading.h1>
            <Text mb={5} fontSize={4} style={{ maxWidth: '800px' }} mx="auto">
              Find, register, and compete in {this.stats.total} free student-led
              hackathons across {this.stats.state} states and{' '}
              {this.stats.country} countries.{' '}
              <Link href="https://goo.gl/forms/ZdVkkunalNGW9nQ82">
                Click here
              </Link>{' '}
              to add your event.
            </Text>
            <Flex wrap justify="center">
              {events
                .sort((a, b) => {
                  if (formattedAddress) {
                    const distToA = this.distanceTo(a.latitude, a.longitude)
                      .miles
                    const distToB = this.distanceTo(b.latitude, b.longitude)
                      .miles
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
            <Link />
          </Container>
        </Base>
        <Section mt={3} color="black">
          <Heading.h4>
            Hack Club.{' '}
            <Link color="primary" href="//hackclub.com">
              Learn More
            </Link>
          </Heading.h4>
        </Section>
      </Fragment>
    )
  }
}

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          startHumanized: start(formatString: "MMMM Do")
          endHumanized: end(formatString: "Do")
          start
          end
          startYear: start(formatString: "YYYY")
          city: parsed_city
          state: parsed_state_code
          parsed_state
          parsed_country
          name
          website
          latitude
          longitude
          parsed_state_code
          parsed_country_code
          banner {
            file_path
          }
          logo {
            file_path
          }
        }
      }
    }
  }
`
