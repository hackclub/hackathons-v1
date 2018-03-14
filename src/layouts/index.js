import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { ThemeProvider } from '@hackclub/design-system'

import Header from 'components/Header'

const TemplateWrapper = ({ children }) => (
  <ThemeProvider>
    <Helmet
      title={`${new Date().getFullYear()} High School Hackathon Calendar // Worldwide`}
      meta={[
        {
          name: 'description',
          content: 'Community contributed high school hackathon schedule',
        },
      ]}
    />
    {children()}
  </ThemeProvider>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
