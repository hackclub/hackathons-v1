import React, { Component } from 'react'
import axios from 'axios'
import { graphql, StaticQuery } from 'gatsby'
import {
  Box,
  Container,
  Flex,
  Text,
  Image,
  Link as L,
  Heading,
} from '@hackclub/design-system'
import Footer from 'components/Footer'
import Layout from 'components/Layout'
import EventCard from 'components/EventCard'
import GroupCard from 'components/GroupCard'
import EmailListForm from 'components/EmailListForm'
import { distance, trackClick, timeSince } from 'utils'
import styled from 'styled-components'
import groupsData from '../../data/groups.json'

const PrimaryLink = styled(L)`
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`

const Link = props => <PrimaryLink {...props} onClick={trackClick(props)} />

const HideOnMobile = styled(Box)`
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: unset;
  }
`

const Switch = styled(Box)`
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

const SectionHeading = styled(Heading.h2).attrs({
  f: [4, 5],
  color: 'black',
  align: 'center',
  mt: [3, 4],
  p: 3,
})``

const Gradient = styled(Box)`
  background-image: linear-gradient(
    ${({ theme }) => theme.colors.white},
    ${({ theme }) => theme.colors.snow}
  );
`

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

class IndexPage extends Component {
  constructor(props) {
    super(props)

    this.events = props.data.allEventsJson.edges.map(({ node }) => ({
      ...node,
      type: 'event',
    }))
    this.groups = groupsData
    this.groups.forEach(node => {
      node.type = 'group'
    })
    this.emailStats = props.data.dataJson

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
      state: new Set(
        this.events
          .filter(event => event.parsed_country_code === 'US')
          .map(event => event.parsed_state)
      ).size,
      country: new Set(this.events.map(event => event.parsed_country)).size,
      lastUpdated: timeSince(
        Math.max(...this.events.map(e => Date.parse(e.updated_at))),
        false,
        new Date(),
        true
      ),
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
          <a
            href="https://hackclub.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/flag.svg"
              alt="Hack Club flag"
              width={128}
              ml={[3, 4, 5]}
            />
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
              A curated list of high school hackathons with {this.stats.total}{' '}
              events in {this.stats.state} states + {this.stats.country}{' '}
              countries.
            </Text>
            <Text mb={4} f={4} style={{ lineHeight: '1.25' }}>
              Maintained by the{' '}
              <Link href="https://hackclub.com">Hack Club</Link> staff. Last
              updated {this.stats.lastUpdated + '.'}{' '}
              {/* Not sure what's happening here, but some sort of odd space is visible before the period if I use the regular JSX templating. */}
            </Text>
          </Container>
          <EmailListForm stats={this.emailStats} location={formattedAddress} />
          {/* This is hidden until groups can be sorted by location
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
          */}
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
              {this.groups
                .concat(
                  filteredEvents['upcoming'].filter(
                    event => event.group_id === null
                  )
                )
                // add events to groups
                .map(card => {
                  if (card.type === 'group') {
                    card.events = filteredEvents.upcoming.filter(
                      e => Number(e.group_id) === Number(card.id)
                    )
                  }
                  return card
                })
                // remove groups that have no events
                .filter(card => card.type === 'event' || card.events.length > 0)
                // add start dates to groups
                .map(
                  card =>
                    card.type === 'group'
                      ? {
                          ...card,
                          start: card.events.map(e => e.start).sort()[0],
                        }
                      : card
                )
                // sort cards by start date
                .sort((a, b) => {
                  return new Date(a.start) - new Date(b.start) || a.id - b.id
                })
                .map(
                  card =>
                    card.type === 'group' ? (
                      <GroupCard
                        group={card}
                        events={card.events}
                        key={`group-${card.id}`}
                      />
                    ) : (
                      <EventCard {...card} key={`event-${card.id}`} />
                    )
                )}
              {/* this.groups.map(group => (
                <GroupCard
                  group={group}
                  events={filteredEvents['upcoming'].filter(
                    event => event.group_id == group.id
                  )}
                  key={group.id}
                />
              ))}
              {filteredEvents['upcoming']
                .filter(event => event.group_id === null)
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
                  )) */}
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
        <Footer />
      </Layout>
    )
  }
}

export default () => (
  <StaticQuery
    query={graphql`
      query PageQuery {
        allEventsJson {
          edges {
            node {
              id
              updated_at(formatString: "YYYY-MM-DD")
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
              group_id
            }
          }
        }
        dataJson {
          cities
          countries
        }
      }
    `}
    render={data => <IndexPage data={data} />}
  />
)
