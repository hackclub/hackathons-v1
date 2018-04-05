import React from 'react'
import Tilt from 'react-tilt'
import {
  Box,
  Card,
  Link,
  Heading,
  Image,
  Text,
  Flex,
  theme,
} from '@hackclub/design-system'
import { trackClick } from 'utils'
import Overdrive from 'react-overdrive'
import styled from 'styled-components'

const humanizeDistance = num => {
  if (num <= 100) {
    return parseFloat(num.toFixed(1))
  } else {
    return Math.round(num)
  }
}

const LogoContainer = Box.extend`
  border-radius: ${props => props.theme.radius};
  height: ${props => props.theme.space[5]}px;
  position: relative;
`

const EventCard = Card.withComponent(Tilt).extend.attrs({
  options: {
    max: 15,
    scale: 1.05,
  },
  w: 1,
  p: 3,
  m: [1, 2],
  color: 'white',
  boxShadowSize: 'md',
})`
   display: flex;
   flex-direction: column;
   align-items: center;
   text-shadow: 0 1px 4px rgba(0, 0, 0, 0.32);
   background:
     linear-gradient(
       rgba(0, 0, 0, 0) 0%,
       rgba(0, 0, 0, 0.45) 75%
     ),
     url(${props => props.bg}) no-repeat,
     url("${props => props.svg}") no-repeat;
   background-size: cover;
`

const Base = styled(Overdrive)`
  padding: ${props => props.theme.space[2]};
  text-decoration: none;
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  ${props => props.theme.mediaQueries[1]} {
    width: 50%;
  }
  ${props => props.theme.mediaQueries[2]} {
    width: 33.33%;
  }
`

const pathToUrl = path => (path ? `https://api.hackclub.com${path}` : null)

export default ({
  id,
  website,
  name,
  start,
  end,
  startHumanized,
  endHumanized,
  parsed_city,
  parsed_state_code,
  parsed_country,
  parsed_country_code,
  banner,
  logo,
  distanceTo,
  startYear,
}) => {
  // if (!(logo)) debugger
  return (
    <Base
      id={id}
      duration={400}
      element="a"
      href={website}
      target="_blank"
      onClick={trackClick({
        href: website,
        analyticsEventName: 'Event Clicked',
        analyticsProperties: {
          eventUrl: website,
          eventName: name,
          eventId: id,
        },
      })}
      itemScope
      itemType="http://schema.org/Event"
    >
      <EventCard
        svg={((banner && banner.sizes) || {}).tracedSVG}
        bg={((banner && banner.sizes) || {}).src}
      >
        <LogoContainer>
          {logo && (
            <Image
              itemProp="image"
              src={logo.sizes.src}
              style={{ height: theme.space[5] }}
            />
          )}
          {logo && (
            <Image
              itemProp="image"
              src={logo.sizes.tracedSVG}
              style={{
                height: theme.space[5],
                zIndex: -1,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}
        </LogoContainer>
        <Heading.h3 regular my={2} style={{ flex: '1 0 auto' }} itemProp="name">
          {name}
        </Heading.h3>
        <Flex justify="space-between" w={1}>
          <Text>
            {start === end
              ? startHumanized
              : `${startHumanized}–${endHumanized}`}
            {new Date().getFullYear() !== parseInt(startYear)
              ? `, ${startYear}`
              : null}
          </Text>
          {distanceTo ? (
            <Text>{`${humanizeDistance(distanceTo)} miles`}</Text>
          ) : (
            <Text
              itemProp="location"
              itemScope
              itemType="http://schema.org/Place"
            >
              <span itemProp="address">
                {parsed_city},{' '}
                {parsed_country_code === 'US'
                  ? parsed_state_code
                  : parsed_country}
              </span>
            </Text>
          )}
        </Flex>

        {/* Include microdata that doesn't easily fit elsewhere */}
        <div style={{ display: 'none' }}>
          <span itemProp="url">{website}</span>
          <span itemProp="startDate" content={start}>
            {start}
          </span>
          <span itemProp="endDate" content={end}>
            {end}
          </span>
        </div>
      </EventCard>
    </Base>
  )
}
