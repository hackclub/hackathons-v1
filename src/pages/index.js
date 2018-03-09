import React, { Fragment } from 'react'
import Link from 'gatsby-link'
import Helment from 'react-helmet'
import { Heading } from '@hackclub/design-system'

export default ({ data }) => (
  <Fragment>
    <Heading>Hello</Heading>
    <ul>
      {data.allEventsJson.edges.map(({ node }, index) => (
        <li key={index}>
          <strong>{node.name}</strong>{' '}
          <em>
            {node.start} – {node.end}
          </em>
        </li>
      ))}
    </ul>
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
        }
      }
    }
  }
`
