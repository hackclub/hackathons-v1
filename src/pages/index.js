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
import styled from 'styled-components'

const Base = Box.extend.attrs({ m: 0 })`
  width: 100vw;
`

const Link = L.extend`
  color: ${props => props.theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const HideOnMobile = styled.div`
  display: none;
  ${props => props.theme.mediaQueries[0]} {
    display: initial;
  }
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
      searchAddress: '',
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
      searchAddress,
      formattedAddress,
      showHistoricalEvents,
    } = this.state
    return (
      <Fragment>
        <Base>
          <Image src={flag} width="10em" ml="5em" />
          <HideOnMobile>
            <Link
              href="https://github.com/hackclub/hackathons"
              target="_blank"
              style={{ position: 'absolute', top: 0, right: 0, margin: '1em' }}
            >
              Contribute on GitHub
            </Link>
          </HideOnMobile>
          <Container maxWidth={theme.space[5]} align="center">
            <Heading.h1 mt={5} mb={4}>
              Upcoming High School Hackathons in {new Date().getFullYear()}
            </Heading.h1>
            <Text mb={4} fontSize={4} style={{ maxWidth: '800px' }} mx="auto">
              Find, register, and compete in {this.stats.total} free student-led
              hackathons across {this.stats.state} states and{' '}
              {this.stats.country} countries.{' '}
              <Link
                href="https://goo.gl/forms/ZdVkkunalNGW9nQ82"
                target="_blank"
              >
                Click here
              </Link>{' '}
              to add your event.
            </Text>
            <Text mb={5}>
              {showHistoricalEvents
                ? 'Currently showing all recorded events.'
                : 'Currently showing events from the 2017 - 2018 school year.'}{' '}
              <Link
                href="#"
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
            <Flex wrap justify="center">
              {(this.state.showHistoricalEvents ? events : filteredEvents)
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
          <Text fontSize={4} style={{ maxWidth: '800px' }} mx="auto">
            This directory is maintained by Hack Club, a non-profit network of
            student-led coding clubs.{' '}
            <Link href="//hackclub.com" target="_blank">
              Learn more.
            </Link>
          </Text>
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
