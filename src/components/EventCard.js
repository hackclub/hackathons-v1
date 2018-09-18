import React from 'react'
import Tilt from 'react-tilt'
import { Box, Heading, Image, Text, Flex, theme } from '@hackclub/design-system'
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

const formatAddress = (city, stateCode, country, countryCode) => {
  const firstHalf = city
  const secondHalf = countryCode === 'US' ? stateCode : country

  const final = `${firstHalf}, ${secondHalf}`

  // Handle case where an event's location is outside the US and is so long that
  // it overflows the card when rendering. If the total length of the location
  // is over 16 characters and outside the US, then just show the country name.
  if (final.length > 16 && countryCode !== 'US') {
    return country
  } else {
    return final
  }
}

const LogoContainer = styled(Box)`
  height: ${({ theme }) => theme.space[5]}px;
  position: relative;
`

const EventCard = styled(Flex.withComponent(Tilt)).attrs({
  options: {
    max: 15,
    scale: 1.05,
  },
  flexDirection: 'column',
  align: 'center',
  w: 1,
  p: 3,
  m: [1, 2],
  color: 'white',
  boxShadowSize: 'md',
})`
  border-radius: ${({ theme }) => theme.radius};
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.375);
  background: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.375) 75%),
    url(${props => props.bg}) no-repeat;
  background-size: cover;
  overflow: hidden;
`

const MLHLogo = styled(Image).attrs({
  p: 2,
  bg: 'white',
  w: '6em',
})`
  border-top-right-radius: ${({ theme }) => theme.radius};
  border-bottom-right-radius: ${({ theme }) => theme.radius};
`

const AssociatedSeal = styled(Box).attrs({
  w: 1,
  ml: -theme.space[4],
  mt: -theme.space[3] + 5,
  mb: 1,
  children: props => (
    <>
      {props.mlhAssociated && (
        <MLHLogo src="/mlh-logo-grayscale.svg" alt="MLH logo" />
      )}
    </>
  ),
})``

const Base = styled(Overdrive)`
  opacity: 1 !important;
  padding: ${({ theme }) => theme.space[2]};
  text-decoration: none;
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  ${({ theme }) => theme.mediaQueries[1]} {
    width: 50%;
  }
  ${({ theme }) => theme.mediaQueries[2]} {
    width: 33.33%;
  }
`

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
  mlh,
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
    itemScope
    itemType="http://schema.org/Event"
  >
    <EventCard bg={banner}>
      <AssociatedSeal mlhAssociated={mlh} />
      <LogoContainer>
        {logo && (
          <Image
            itemProp="image"
            src={logo}
            alt={`${name} logo`}
            style={{ height: theme.space[5], borderRadius: theme.radius }}
          />
        )}
      </LogoContainer>
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
        <Text>
          {start === end ? startHumanized : `${startHumanized}–${endHumanized}`}
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
              {formatAddress(
                parsed_city,
                parsed_state_code,
                parsed_country,
                parsed_country_code
              )}
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
