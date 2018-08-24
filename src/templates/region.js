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
} from '@hackclub/design-system'
import Layout from 'components/Layout'
import EventCard from 'components/EventCard'
import EmailListForm from 'components/EmailListForm'
import { distance, trackClick } from 'utils'

const Base = Box.extend.attrs({ m: 0 })`
  width: 100vw;
`

const StyledLink = L.extend`
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const Link = props => <StyledLink {...props} onClick={trackClick(props)} />

const HideOnMobile = Box.extend`
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: unset;
  }
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
  'school year': {
    name: 'from the 2017 - 2018 school year',
    function: event => new Date(event.start) > beginningOfSchoolYear,
  },
  future: {
    name: 'in the future',
    function: event => new Date(event.start) >= new Date(Date.now() - 864e5),
  },
  'all time': {
    name: 'from all time',
    function: event => true,
  },
}

export default class extends Component {
  constructor(props) {
    super(props)

    this.events = props.pageContext.events.map(({ node }) => node)
    this.region = props.pageContext.region

    const filteredEvents = {}
    Object.keys(timeFilters).forEach(key => {
      filteredEvents[key] = this.events.filter(timeFilters[key].function)
    })

    this.state = {
      filteredEvents,
      searchLat: null || props.searchLat,
      searchLng: null || props.searchLng,
      formattedAddress:
        this.region.address === undefined
          ? this.region.name
          : this.region.address,
      timeFilter: 'all time',
      sortByProximity: false,
    }

    this.stats = {
      total: this.events.length,
      state: new Set(this.events.map(event => event.parsed_state)).size,
      country: new Set(this.events.map(event => event.parsed_country)).size,
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
    const {
      formattedAddress,
      timeFilter,
      filteredEvents,
      sortByProximity,
    } = this.state
    const description = `Find, register, and compete in high school hackathons near ${
      this.region.name
    }... Currently showing events from the 2017 - 2018 school year. This directory is maintained by Hack Club, a nonprofit network of student-led coding clubs.`
    return (
      <Layout>
        <Helmet>
          <title>{this.region.name} - List of High School Hackathons</title>
          <meta name="description" content={description} />
          <meta name="twitter:description" content={description} />
          <meta property="og:description" content={description} />
        </Helmet>
        <Base>
          <a
            href="https://hackclub.com"
            target="_blank"
            rel="noopener noreferrer"
          >
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
              rel="noopener noreferrer"
              color="slate"
            >
              Add your event
            </L>
            <Text.span px={[2, 3]} />
            <L
              href="https://github.com/hackclub/hackathons"
              target="_blank"
              rel="noopener noreferrer"
              color="slate"
            >
              <HideOnMobile>Contribute on</HideOnMobile> GitHub
            </L>
          </Flex>
          <Container maxWidth={36} px={3} align="center">
            <Heading.h1 f={[5, null, 6]} mt={[4, 5]} mb={3}>
              {this.region ? null : 'Upcoming '}
              High School Hackathons in
              {(
                <Fragment>
                  <br />
                  {this.region.name}
                </Fragment>
              ) || new Date().getFullYear()}
            </Heading.h1>
            <Text f={4} style={{ maxWidth: '800px' }} mx="auto">
              Find, register, and compete in {this.stats.total} student-led
              hackathons around {this.region.name}.
            </Text>
            <Text f={3} my={3}>
              <Link href="/" noNewTab>
                See events everywhere
              </Link>
            </Text>
            <EmailListForm location={formattedAddress} />
            <Text color="muted" mt={4} mb={3}>
              Showing events{' '}
              <Link
                href="#"
                onClick={e => {
                  e.preventDefault()
                  const fKeys = Object.keys(timeFilters)
                  const index = (fKeys.indexOf(timeFilter) + 1) % fKeys.length
                  this.setState({
                    timeFilter: fKeys[index],
                  })
                }}
              >
                {timeFilters[timeFilter].name}
              </Link>
              .
            </Text>
            <Text color="muted" mt={3} mb={4}>
              Sorting by{' '}
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
                {sortByProximity ? `proximity` : 'date'}
              </Link>
              {sortByProximity && formattedAddress && ` to ${formattedAddress}`}
              .
            </Text>
          </Container>
          <Container px={3}>
            <Flex mx={[1, 2, -3]} wrap justify="center">
              {filteredEvents[timeFilter]
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
          </Container>
        </Base>
        <Container maxWidth={40} px={[2, 3]} py={5} align="center">
          <Text f={3} my={4} color="black">
            This directory is maintained by{' '}
            <Link href="//hackclub.com">Hack Club</Link>, a nonprofit network of
            student-led coding clubs.
          </Text>
          <Text f={3} color="black">
            Want to run your own hackathon? Do it with the support of{' '}
            <Link href="https://mlh.io/event-membership" target="_blank">
              MLH
            </Link>
            .
          </Text>
        </Container>
      </Layout>
    )
  }
}
