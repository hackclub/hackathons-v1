import React from 'react'
import { Link, theme } from '@hackclub/design-system'

const Header = () => (
  <div
    style={{
      background: theme.colors.primary,
    }}
  >
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '1.45rem 1.0875rem',
      }}
    >
      <h1 style={{ margin: 0 }}>
        <Link
          href="/"
          style={{
            color: 'white',
            textDecoration: 'none',
          }}
        >
          Hack Club
        </Link>
      </h1>
    </div>
  </div>
)

export default Header
