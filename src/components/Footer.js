import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import {
  Container,
  Box,
  Link,
  Text,
  Flex,
  Heading,
} from '@hackclub/design-system'
import regions from 'regions'

const Wrapper = Box.extend`
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
Wrapper.defaultProps = {
  p: 4,
}

const RegionLink = Box.withComponent(Link).extend`
  border-radius: ${({ theme }) => theme.radius};
  border: 1px solid ${({ theme }) => theme.colors.slate};
`
RegionLink.defaultProps = {
  boxShadowSize: 'md',
  p: 3,
  m: 3,
  bg: 'white',
  color: 'slate',
}

export default () => (
  <StaticQuery
    query={graphql`
      query FooterQuery {
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
            }
          }
        }
      }
    `}
    render={data => {
      const edges = data.allEventsJson.edges
      const visibleRegions = regions.filter(
        region => edges.filter(e => region.filter(e.node)).length > 4
      )
      return (
        <Wrapper>
          <Container>
            <Heading.h2 align="center">Popular regions</Heading.h2>
            <Flex justify="center">
              {visibleRegions.map((region, index) => (
                <RegionLink href={region.path} key={index}>
                  {region.name}
                </RegionLink>
              ))}
            </Flex>
          </Container>
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
              </Link>
              .
            </Text>
          </Container>
        </Wrapper>
      )
    }}
  />
)
