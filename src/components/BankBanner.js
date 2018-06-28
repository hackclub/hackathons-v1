import React from 'react'
import { Container, Text, Link as A } from '@hackclub/design-system'

const Base = Container.extend.attrs({
  my: 4,
  p: 3,
  f: [2, 3],
  color: 'white',
})`
  border-radius: ${({ theme }) => theme.radius};
  background-image: radial-gradient(circle, #333, #333 1px, #111 1px, #111);
  background-size: 1rem 1rem;
`

const Link = A.extend`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: underline;
`

const BankBanner = () => (
  <Base>
    <Text>
      💰 Store your event’s money with{' '}
      <Link href="https://hackclub.com/bank">Hack Club Bank</Link>
    </Text>
  </Base>
)

export default BankBanner
