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
  Button,
  theme,
} from '@hackclub/design-system'
import EventCard from 'components/EventCard'
import { distance, trackClick } from 'utils'
import styled from 'styled-components'

const Base = Box.extend.attrs({ m: 0 })`
  width: 100vw;
`

const StyledLink = L.extend`
  color: ${props => props.theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const Link = props => <StyledLink {...props} onClick={trackClick(props)} />

const HideOnMobile = Box.extend`
  display: none;
  ${props => props.theme.mediaQueries.sm} {
    display: unset;
  }
`

const U = Text.withComponent('mark').extend`
  color: ${props => props.theme.colors.warning};
  background: transparent url(//hackclub.com/underline.svg) bottom left no-repeat;
  background-size: 100% ${props => props.theme.space[2]}px;
  padding-bottom: ${props => props.theme.space[1]}px;
`

export default class extends Component {
  constructor(props) {
    super(props)

    // This spagetti filters out events from before this school year
    let beginningOfSchoolYear
    const now = new Date()
    if (now.getMonth() < 7 /* august */) {
      beginningOfSchoolYear = new Date(now.getFullYear() - 1, 7)
    } else {
      beginningOfSchoolYear = new Date(now.getFullYear(), 7)
    }

    const events = props.data.allEventsJson.edges.map(({ node }) => node)
    const filteredEvents = events.filter(
      event => new Date(event.start) > beginningOfSchoolYear
    )

    this.state = {
      events: events,
      filteredEvents: filteredEvents,
      searchLat: null,
      searchLng: null,
      formattedAddress: undefined,
      showHistoricalEvents: false,
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
                sortByProximity: true,
                formattedAddress: formattedAddress,
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
        .then(res => res.data.results[0])
        .then(firstResult => {
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
      filteredEvents,
      formattedAddress,
      showHistoricalEvents,
      sortByProximity,
    } = this.state
    return (
      <Fragment>
        <Base>
          <a href="https://hackclub.com" target="_blank">
            <Image src="/flag.svg" width={128} ml={[3, 4, 5]} />
          </a>
          <Flex
            py={3}
            pr={[3, 4, 5]}
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            <L
              href="https://goo.gl/forms/ZdVkkunalNGW9nQ82"
              target="_blank"
              color="slate"
            >
              Add your event
            </L>
            <Text.span px={[2, 3]} />
            <L
              href="https://github.com/hackclub/hackathons"
              target="_blank"
              color="slate"
            >
              <HideOnMobile>Contribute on</HideOnMobile> GitHub
            </L>
          </Flex>
          <Container maxWidth={36} px={3} align="center">
            <Heading.h1 f={[5, null, 6]} mt={[4, 5]} mb={3}>
              Upcoming High School Hackathons in {new Date().getFullYear()}
            </Heading.h1>
            <Text mb={2} f={4} style={{ maxWidth: '800px' }} mx="auto">
              Find, register, and compete in {this.stats.total} free{' '}
              <U>student-led hackathons</U> across {this.stats.state} states +{' '}
              {this.stats.country} countries.
            </Text>
            <Text color="muted" mt={4} mb={3}>
              {showHistoricalEvents
                ? 'Showing all recorded events.'
                : 'Only showing events from the 2017 - 2018 school year.'}{' '}
              <Link
                href="#"
                analyticsEventName={`Toggle ${
                  showHistoricalEvents ? 'Off' : 'On'
                } Historical Events`}
                onClick={e => {
                  e.preventDefault()
                  this.setState({
                    showHistoricalEvents: !this.state.showHistoricalEvents,
                  })
                }}
              >
                Toggle?
              </Link>
            </Text>
            <Text mb={5}>
              <Link
                href="#"
                onClick={e => {
                  e.preventDefault()
                  if (sortByProximity) {
                    this.setState({ sortByProximity: false })
                  } else {
                    this.setCurrentLocation()
                  }
                }}
              >
              {sortByProximity
                ? `Sorting by proximity off events to ${formattedAddress}.`
                : 'Sorting by location.'}
              </Link>
            </Text>
          </Container>
          <Container px={3}>
            <Flex mx={[1, 2, -3]} wrap justify="center">
              {(this.state.showHistoricalEvents ? events : filteredEvents)
                .sort((a, b) => {
                  if (sortByProximity) {
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
                      sortByProximity
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
        <Container maxWidth={40} px={[2, 3]} py={5} align="center">
          <Text f={4} color="black">
            This directory is maintained by Hack Club, a non-profit network of{' '}
            <U>student-led coding clubs</U>.
          </Text>
          <Button href="//hackclub.com" target="_blank" mt={3}>
            Learn more »
          </Button>
        </Container>
      </Fragment>
    )
  }
}

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          id
          startHumanized: start(formatString: "MMMM D")
          endHumanized: end(formatString: "D")
          start
          end
          startYear: start(formatString: "YYYY")
          parsed_city
          parsed_state
          parsed_state_code
          parsed_country
          parsed_country_code
          name
          website
          latitude
          longitude
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
