import React from 'react'
import Helmet from 'react-helmet'
import {
  Box,
  Card,
  Flex,
  Heading,
  Link,
  Text,
  theme,
} from '@hackclub/design-system'

const Base = Box.extend`
  width: 100vw;
  margin: 0;
  background-color: ${props => props.theme.colors.red[5]};
  background-image: linear-gradient(
    -16deg,
    ${props => props.theme.colors.orange[4]} 0%,
    ${props => props.theme.colors.red[5]} 50%,
    ${props => props.theme.colors.primary} 100%
  );
`

const Subtitle = Text.extend`
  color: ${props => props.theme.colors.gray[6]};
`

const EventCard = Card.extend.attrs({
  p: 2,
  m: 2,
  align: 'center',
  boxShadowSize: 'md',
  color: 'slate',
  bg: 'white',
})`
  min-width: ${props => props.theme.space[3]}em;
  min-height: ${props => props.theme.space[1]}em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.32);
  transition: transform .075s ease-out;
  &:hover {
    transform: scale(1.1);
  }
`

const EventListing = ({ website, name, start, end, key }) => {
  return (
    <Link key={key} href={website} target="_blank">
      <EventCard>
        <Heading.h3>{name}</Heading.h3>
        <Subtitle>
          {start}
          {start.indexOf(end) === -1 ? `—${end}` : null}
        </Subtitle>
      </EventCard>
    </Link>
  )
}

export default ({ data }) => (
  <Base>
    <Flex wrap justify="center">
      {data.allEventsJson.edges.map(({ node }, index) => (
        <EventListing {...node} key={index} />
      ))}
    </Flex>
  </Base>
)

export const pageQuery = graphql`
  query PageQuery {
    allEventsJson {
      edges {
        node {
          start(formatString: "MMMM DD")
          end(formatString: "DD")
          name
          website
        }
      }
    }
  }
`
