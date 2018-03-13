import React from 'react'
import { Card, Link, Section, Heading, Text } from '@hackclub/design-system'

const Banner = Section.withComponent(Card).extend.attrs({
  boxShadowSize: 'md',
  color: 'primary',
  mb: 3,
})``

export default () => (
  <Link href="/add">
    <Banner>
      <Heading>Want to feature your own event?</Heading>
      <Text>Add it here</Text>
    </Banner>
  </Link>
)
