import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { ThemeProvider } from '@hackclub/design-system'

import Header from '../components/Header'
import './index.css'

const TemplateWrapper = ({ children }) => (
  <ThemeProvider>
    <Helmet
      title={`${new Date().getFullYear()} High School Hackathon Calendar`}
      meta={[
        {
          name: 'description',
          content: 'Community contributed high school hackathon schedule',
        },
        { name: 'keywords', content: 'sample, something' },
      ]}
    />
    <Header />
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '0px 1.0875rem 1.45rem',
        paddingTop: 0,
      }}
    >
      {children()}
    </div>
  </ThemeProvider>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
