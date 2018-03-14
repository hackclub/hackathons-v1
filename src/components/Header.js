import React from 'react'
import {
  Heading,
  Section,
  Box,
  Link,
  Flex,
  theme,
} from '@hackclub/design-system'

const Header = ({ children }) => (
  <Flex justify="space-between" flexDirection="row" bg="primary" py={4}>
    <Box>
      <Heading.h2>
        <Link
          href="/"
          style={{
            color: 'white',
            textDecoration: 'none',
          }}
        >
          High School Hackathons
        </Link>
      </Heading.h2>
    </Box>
    {children && (
      <Box flex="1" align="center">
        {children}
      </Box>
    )}
  </Flex>
)

export default Header
