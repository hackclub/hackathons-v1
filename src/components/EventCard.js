import React from 'react'
import Tilt from 'components/Tilt'
import { Box, Heading, Image, Text, Flex, theme } from '@hackclub/design-system'
import { trackClick, humanizedDateRange } from 'utils'
import styled from 'styled-components'
import GatsbyImage from 'gatsby-image'

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

  const final = [firstHalf, secondHalf].filter(e => e).join(', ') // Handle case where city or country is null

  // Handle case where an event's location is outside the US and is so long that
  // it overflows the card when rendering. If the total length of the location
  // is over 16 characters and outside the US, then just show the country name.
  if (countryCode !== 'US' && final.length > 16) {
    return country
  } else {
    return final
  }
}

const NameHeading = props => {
  const Tag = props.children.length < 20 ? Heading.h3 : Heading.h4
  return (
    <Tag
      regular
      align="center"
      my={2}
      style={{ flex: '1 0 auto', zIndex: 1 }}
      {...props}
    />
  )
}

const LogoContainer = styled(Box)`
  height: ${({ theme }) => theme.space[5]}px;
  width: ${({ theme }) => theme.space[5]}px;
  position: relative;
`

const EventCard = styled(Flex.withComponent(Tilt)).attrs({
  flexDirection: 'column',
  align: 'center',
  w: 1,
  p: 3,
  m: [2, 3],
  color: 'white',
})`
  border-radius: ${({ theme }) => theme.radius};
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.375);
  box-shadow: 0px 0 2px 1px rgba(0, 0, 0, 0.125);
  overflow: hidden;
  position: relative;
`

const MLHLogo = styled(Image).attrs({
  p: 2,
  bg: 'white',
  w: '6em',
})`
  border-top-right-radius: ${({ theme }) => theme.radius};
  border-bottom-right-radius: ${({ theme }) => theme.radius};
  z-index: 2;
`

const MLHSeal = styled(Box).attrs({
  w: 1,
  ml: -theme.space[4],
  mt: -theme.space[3] + 5,
  mb: 1,
  children: props => <MLHLogo src="/mlh-logo-grayscale.svg" alt="MLH logo" />,
})`
  z-index: 2;
`

const EventImageContainer = styled(Box).attrs({
  mt: -3,
  mb: -3
})`
  position: absolute;
  width: 100%;
  height: 100%;
`

const LazyImage = ({ src, alt }) => {
  return (
    <GatsbyImage
      fixed={{
        width: '100%',
        height: '100%',
        src: src,
        srcSet: src,
      }}
      alt={alt}
    />
  )
}

const Base = styled.a`
  opacity: 1 !important;
  text-decoration: none;
  display: ${({ invisible }) => (invisible ? 'none' : 'flex')};
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

export default ({
  id,
  website,
  name,
  start,
  end,
  parsed_city,
  parsed_state_code,
  parsed_country,
  parsed_country_code,
  banner,
  logo,
  distanceTo,
  startYear,
  mlh,
  invisible,
  inGroup
}) => (
  <Base
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
    invisible={invisible}
  >
    <EventCard>
      <EventImageContainer style={{ zIndex: 1, }}>
        <Image
          src='bg-filter.png'
          style={{
            height: '100%',
            width: '100%'
          }}
        />
      </EventImageContainer>
      <EventImageContainer>
        <LazyImage
          src={banner}
          alt={`${name} background`}
        />
      </EventImageContainer>
      <MLHSeal style={{ visibility: mlh ? 'visible' : 'hidden' }} />
      <LogoContainer>
        {logo && (
          <LazyImage
            itemProp="image"
            src={logo}
            alt={`${name} logo`}
            imgStyle={{
              height: 'auto',
              width: 'auto',
              maxHeight: '100%',
              maxWidth: '100%',
              borderRadius: theme.radius,
              objectFit: 'contain',
            }}
          />
        )}
      </LogoContainer>
      <NameHeading itemProp="name">
        {inGroup ? name.replace('LHD ', '') : name}
      </NameHeading>
      <Flex justify="space-between" w={1} style={{ zIndex: 1 }}>
        <Text>{humanizedDateRange(start, end)}</Text>
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
