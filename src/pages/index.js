import React, { Fragment } from 'react'
import Helment from 'react-helmet'
import { Card, Flex, Heading, Link, theme } from '@hackclub/design-system'

const EventCard = Card.extend.attrs({
  p: 1,
  m: 2,
  align: 'center',
  boxShadowSize: 'sm',
})`
  color: black;
  min-width: ${props => props.theme.space[3]}em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.32);
  transition: transform .125s ease-in;
  &:hover {
    transform: scale(1.03125);
  }
`

export default ({ data }) => (
  <Fragment>
    <Flex wrap justify="center">
      {data.allEventsJson.edges.map(({ node }, index) => (
        <Link key={index} href={node.website} target="_blank">
          <EventCard>
            <strong>{node.name}</strong>
            <br />
            <em>
              {node.start} – {node.end}
            </em>
          </EventCard>
        </Link>
      ))}
    </Flex>
  </Fragment>
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
