import React, { Component, Fragment } from 'react'
import Tilt from 'react-tilt'
import { Box, Heading, Image, Text, Flex, theme } from '@hackclub/design-system'
import styled from 'styled-components'
import EventCard from 'components/EventCard'

const fauxCardShadow = px => `
    1px 0 1px rgba(0,0,0,0.15),
    ${px}px 0 0 -5px #eee,
    ${px}px 0 1px -4px rgba(0,0,0,0.15),
    ${px * 2}px 0 0 -10px #eee,
    ${px * 2}px 0 1px -9px rgba(0,0,0,0.15),
    -1px 0 1px rgba(0,0,0,0.15),
    -${px}px 0 0 -5px #eee,
    -${px}px 0 1px -4px rgba(0,0,0,0.15),
    -${px * 2}px 0 0 -10px #eee,
    -${px * 2}px 0 1px -9px rgba(0,0,0,0.15)
`

const GroupCardBase = styled(Flex.withComponent(Tilt)).attrs({
  options: {
    max: 15,
    scale: 1.05,
  },
  flexDirection: 'column',
  align: 'center',
  w: 1,
  p: 3,
  pt: 5,
  m: [2, 3],
  color: 'white',
  boxShadowSize: 'md',
})`
  border-radius: ${({ theme }) => theme.radius};
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.375);
  background: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.375) 75%),
    url(${props => props.bg}) no-repeat;
  background-size: cover;
  overflow: hidden;
  ${props =>
    props.open &&
    'transform: scale(0.95) !important;'} transition: box-shadow 0.3s ease-in, transform 0.6s ease-in;
  box-shadow: ${props => fauxCardShadow(props.open ? 0 : 10)};
  &:hover {
    box-shadow: ${props => fauxCardShadow(props.open ? 0 : 12)};
  }
`

const Base = styled(Box)`
  opacity: 1 !important;
  padding: ${({ theme }) => theme.space[2]};
  text-decoration: none;
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  max-width: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.mediaQueries[1]} {
    width: 50%;
  }
  ${({ theme }) => theme.mediaQueries[2]} {
    width: 33.33%;
  }
`

class GroupCard extends Component {
  state = { open: false }

  toggle() {
    this.setState({ open: !this.state.open })
  }
  toggle = this.toggle.bind(this)

  render() {
    const {
      name,
      location,
      logo,
      banner,
      events,
      start,
      end,
    } = this.props.group
    return (
      <Fragment>
        <Base onClick={this.toggle}>
          <GroupCardBase bg={banner} open={this.state.open}>
            {logo && (
              <Image
                itemProp="image"
                src={logo}
                alt={`${name} logo`}
                mx="auto"
                style={{
                  height: theme.space[5] + 'px',
                  width: 'auto',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  borderRadius: theme.radius,
                }}
              />
            )}
            <Heading.h3
              regular
              align="center"
              my={2}
              style={{ flex: '1 0 auto' }}
              itemProp="name"
            >
              {name}
            </Heading.h3>
            <Flex justify="space-between" w={1}>
              <Text>{start}</Text>
              <Text
                itemProp="location"
                itemScope
                itemType="http://schema.org/Place"
              >
                <span itemProp="address">{location}</span>
              </Text>
            </Flex>
            {/* Include microdata that doesn't easily fit elsewhere */}
            <div style={{ display: 'none' }}>
              <span itemProp="startDate" content={start}>
                {start}
              </span>
              <span itemProp="endDate" content={end}>
                {end}
              </span>
            </div>
          </GroupCardBase>
        </Base>
        {this.state.open &&
          events.map(event => <EventCard {...event} key={event.id} />)}
      </Fragment>
    )
  }
}

export default GroupCard
