import React, { Component, Fragment } from 'react'
import Tilt from 'components/Tilt'
import { Heading, Image, Text, Flex, theme } from '@hackclub/design-system'
import styled from 'styled-components'
import EventCard from 'components/EventCard'
import { humanizedDateRange } from '../utils'

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

const insetShadow = px => `
  inset 0 0 ${px}px ${px / 2}px rgba(0, 0, 0, 0.875),
  1px 0 1px rgba(0,0,0,0.15)
`

const GroupCardBase = styled(Flex.withComponent(Tilt)).attrs({
  flexDirection: 'column',
  align: 'center',
  w: 1,
  p: 3,
  pt: 5,
  m: [2, 3],
  color: 'white',
  boxShadowSize: 'md',
})`
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius};
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.375);
  background: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.375) 75%),
    url(${props => props.bg}) no-repeat;
  background-size: cover;
  overflow: hidden;
  ${props =>
    props.open &&
    'transform: scale(0.9) !important;'} transition: box-shadow 0.3s ease-in;
  box-shadow: ${props => (props.open ? insetShadow(10) : fauxCardShadow(10))};
  &:hover {
    box-shadow: ${props => (props.open ? insetShadow(13) : fauxCardShadow(13))};
  }
  &:focus {
    box-shadow: ${props => (props.open ? insetShadow(13) : fauxCardShadow(13))};
  }
`

const Base = styled(Flex)`
  opacity: 1 !important;
  padding: ${({ theme }) => theme.space[2]};
  text-decoration: none;
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
    const { events } = this.props
    const start = events.map(event => new Date(event.start)).sort()[0]
    const end = events.map(event => new Date(event.end))[events.length - 1]
    const { name, location, logo, banner } = this.props.group
    if (events.length === 0) {
      return null
    }
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
            <Flex justify="space-between" width={1}>
              <Text>{humanizedDateRange(start, end)}</Text>
              <Text
                itemProp="location"
                itemScope
                itemType="http://schema.org/Place"
              >
                <span itemProp="address">{location}</span>
              </Text>
            </Flex>
            {/* Include microdata that doesn't easily fit elsewhere */}
            {/*<div style={{ display: 'none' }}>
              <span itemProp="startDate" content={start.toString()}>
                {start.toString()}
              </span>
              <span itemProp="endDate" content={end.toString()}>
                {end.toString()}
              </span>
              </div>*/}
          </GroupCardBase>
        </Base>
        {events.map(event => (
          <EventCard
            {...event}
            key={event.id}
            invisible={!this.state.open}
            inGroup
          />
        ))}
      </Fragment>
    )
  }
}

export default GroupCard
