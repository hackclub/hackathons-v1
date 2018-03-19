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

const Logo = Image.extend`
  border-radius: ${props => props.theme.radius};
  height: ${props => props.theme.space[5]}px;
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
    url(${props => props.background}) no-repeat;
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
}) => (
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
  >
    <EventCard background={pathToUrl((banner || {}).file_path)}>
      <Logo src={pathToUrl((logo || {}).file_path)} />
      <Heading.h3 regular my={2} style={{ flex: '1 0 auto' }}>
        {name}
      </Heading.h3>
      <Flex justify="space-between" w={1}>
        <Text>
          {start === end ? startHumanized : `${startHumanized}–${endHumanized}`}
          {new Date().getFullYear() !== parseInt(startYear)
            ? `, ${startYear}`
            : null}
        </Text>
        <Text>
          {distanceTo
            ? `${humanizeDistance(distanceTo)} miles`
            : `${parsed_city}, ${
                parsed_country_code === 'US'
                  ? parsed_state_code
                  : parsed_country
              }`}
        </Text>
      </Flex>
    </EventCard>
  </Base>
)
