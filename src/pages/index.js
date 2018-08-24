import React, { Component, Fragment } from 'react'
import Helmet from 'react-helmet'
import axios from 'axios'
import { graphql } from 'gatsby'
import {
  Box,
  Container,
  Flex,
  Text,
  Image,
  Link as L,
  Heading,
  cx,
} from '@hackclub/design-system'
import Layout from 'components/Layout'
import EventCard from 'components/EventCard'
import EmailListForm from 'components/EmailListForm'
import { distance, trackClick } from 'utils'

const PrimaryLink = L.extend`
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const Link = props => <PrimaryLink {...props} onClick={trackClick(props)} />

const HideOnMobile = Box.extend`
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: unset;
  }
`

const Switch = Box.extend`
  border-radius: 99999px;
  display: inline-flex;
  width: 40px;
  height: 24px;
  background-color: ${props =>
    props.checked ? props.theme.cx(props.color) : 'transparent'};
  box-shadow: inset 0 0 0 2px;
  transition-property: background-color;
  transition-duration: 0.25s;
  transition-timing-function: ease-out;
  user-select: none;
  &:after {
    content: ' ';
    width: 16px;
    height: 16px;
    margin: 4px;
    border-radius: 8px;
    background-color: ${props =>
      props.checked ? props.theme.colors.white : props.theme.cx(props.color)};
    transition-property: transform, color;
    transition-duration: 0.125s;
    transition-timing-function: ease-out;
    transform: ${props =>
      props.checked ? `translateX(16px)` : `translateX(0)`};
  }
`

const SectionHeading = Heading.h2.extend.attrs({
  f: [4, 5],
  color: 'black',
  align: 'center',
  mt: [3, 4],
  p: 3,
})``

const Gradient = Box.extend`
  background-image: linear-gradient(
    ${({ theme }) => theme.colors.white},
    ${({ theme }) => theme.colors.snow}
  );
`

const Footer = Box.withComponent('footer').extend`
  background-image: radial-gradient(
    ${({ theme }) => theme.colors.smoke} 1px,
    transparent 1px
  );
  background-size: ${({ theme }) => theme.space[3]}px
    ${({ theme }) => theme.space[3]}px;
  background-position: ${({ theme }) => theme.space[2]}px
    ${({ theme }) => theme.space[2]}px;
  z-index: -1;
`

// This spagetti filters out events from before this school year
let beginningOfSchoolYear
const now = new Date()
if (now.getMonth() < 7 /* august */) {
  beginningOfSchoolYear = new Date(now.getFullYear() - 1, 7)
} else {
  beginningOfSchoolYear = new Date(now.getFullYear(), 7)
}

const timeFilters = {
  upcoming: {
    name: 'in the future',
    function: event => new Date(event.start) >= new Date(Date.now() - 864e5),
  },
  past: {
    name: 'from the past',
    function: event => new Date(event.start) < new Date(Date.now() - 864e5),
  },
}

export default class extends Component {
  constructor(props) {
    super(props)

    this.events = props.data.allEventsJson.edges.map(({ node }) => node)

    const filteredEvents = {}
    Object.keys(timeFilters).forEach(key => {
      filteredEvents[key] = this.events.filter(timeFilters[key].function)
    })

    this.state = {
      filteredEvents,
      searchLat: null || props.searchLat,
      searchLng: null || props.searchLng,
      formattedAddress: undefined,
      sortByProximity: false,
    }

    this.stats = {
      total: this.events.length,
      state: new Set(this.events.map(event => event.parsed_state)).size,
      country: new Set(this.events.map(event => event.parsed_country)).size,
      lastUpdated: this.events.map(e => e.updated_at).sort((a, b) => (a < b) - (a > b))[0] // so this is totally insane, but basically takes the updated_at fields (formatted as YYYY-MM-DD, sorts by their string value, then takes the first sorted entry)
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
              const { results } = resp.data
              const newState = {
                searchLat: pos.coords.latitude,
                searchLng: pos.coords.longitude,
                sortByProximity: true,
              }
              if (results.length > 0) {
                // Attempt to narrow down user's location
                const formattedAddress = (
                  results.find(
                    result => result.types.indexOf('neighborhood') !== -1
                  ) || results[0]
                ).formatted_address
                newState.formattedAddress = formattedAddress
              }
              this.setState(newState)
            })
        },
        err => {
          alert(
            'We couldn’t get your current location. We can only sort by date'
          )
        }
      )
    } else {
      alert('We couldn’t get your current location. We can only sort by date')
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
    const { formattedAddress, filteredEvents, sortByProximity } = this.state
    return (
      <Layout>
        <Gradient pb={4}>
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
          <Container color="black" px={3} align="center">
            <Heading.h1
              f={[5, null, 6]}
              mt={4}
              mb={4}
              style={{ lineHeight: '1.125' }}
              maxWidth={38}
            >
              Upcoming High School Hackathons in {new Date().getFullYear()}
            </Heading.h1>
            <Text mb={3} f={4} style={{ lineHeight: '1.25' }}>
              A curated list of high school hackathons with
              {' '}{this.stats.total} events in {this.stats.state} states +
              {' '}{this.stats.country} countries.
            </Text>
            <Text mb={4} f={4} style={{ lineHeight: '1.25' }}>
              Maintained by the <Link href="https://hackclub.com">Hack Club</Link> staff. Last updated {this.stats.lastUpdated + '.'} {/* Not sure what's happening here, but some sort of odd space is visible before the period if I use the regular JSX templating. */}
            </Text>
          </Container>
          <EmailListForm location={formattedAddress} />
          <Flex f={1} align="center" justify="center" px={3} wrap>
            <Text color="slate" caps>
              The following are sorted by
            </Text>
            <Flex
              align="center"
              color="primary"
              ml={1}
              onClick={e => {
                if (sortByProximity) {
                  this.setState({ sortByProximity: false })
                } else {
                  this.setCurrentLocation()
                }
              }}
            >
              <Text.span caps bold={!sortByProximity}>
                Date
              </Text.span>
              <Switch
                color="primary"
                role="checkbox"
                checked={sortByProximity}
                mx={1}
              />
              <Text.span caps bold={sortByProximity}>
                Proximity
              </Text.span>
            </Flex>
          </Flex>
          <Text
            color="muted"
            align="center"
            f={1}
            children={
              sortByProximity && formattedAddress && ` to ${formattedAddress}`
            }
          />
        </Gradient>
        <Gradient>
          <SectionHeading>Upcoming Events</SectionHeading>
          <Container px={3} pb={4}>
            <Flex mx={[1, 2, -3]} wrap justify="center">
              {filteredEvents['upcoming']
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
                .map(event => (
                  <EventCard
                    {...event}
                    distanceTo={
                      sortByProximity
                        ? this.distanceTo(event.latitude, event.longitude).miles
                        : null
                    }
                    key={event.id}
                  />
                ))}
            </Flex>
          </Container>
        </Gradient>
        <Gradient>
          <SectionHeading>Past Events</SectionHeading>
          <Container px={3} pb={4}>
            <Flex mx={[1, 2, -3]} wrap justify="center">
              {filteredEvents['past']
                .sort((a, b) => {
                  if (sortByProximity) {
                    const distToA = this.distanceTo(a.latitude, a.longitude)
                      .miles
                    const distToB = this.distanceTo(b.latitude, b.longitude)
                      .miles
                    return distToA - distToB
                  } else {
                    return new Date(b.start) - new Date(a.start)
                  }
                })
                .map(event => (
                  <EventCard
                    {...event}
                    distanceTo={
                      sortByProximity
                        ? this.distanceTo(event.latitude, event.longitude).miles
                        : null
                    }
                    key={event.id}
                  />
                ))}
            </Flex>
          </Container>
        </Gradient>
        <Footer>
          <Container maxWidth={36} px={[2, 3]} py={5} align="center">
            <Text f={3} mb={4} color="slate">
              This directory is maintained by{' '}
              <Link href="//hackclub.com">Hack Club</Link>, a nonprofit network
              of student-led computer science clubs.
            </Text>
            <Text color="muted" f={3}>
              Want to run your own hackathon? Get the support of{' '}
              <Link href="https://mlh.io/event-membership" target="_blank">
                MLH
              </Link>.
            </Text>
          </Container>
        </Footer>
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          id
          updated_at(formatString: "YYYY-MM-DD")
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
          website: website_redirect
          latitude
          longitude
          banner
          logo
          mlh: mlh_associated
        }
      }
    }
  }
`
