import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { ThemeProvider } from '@hackclub/design-system'
import data from 'data.json'

const { description, url, img, title, name } = data

const meta = tags =>
  tags.map((props, index) =>
    React.createElement('meta', { ...props, key: index })
  )

const TemplateWrapper = ({ children }) => (
  <ThemeProvider>
    <Helmet>
      <title>
        List of High School Hackathons | Non-Profit Directory | Hack Club
      </title>
      {meta([
        { name: 'description', content: description },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:description', content: description },
        { name: 'twitter:domain', content: url },
        { name: 'twitter:image:src', content: img },
        { name: 'twitter:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: img },
        { property: 'og:image:height', content: 512 },
        { property: 'og:image:width', content: 512 },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:site_name', content: name },
        { property: 'og:title', content: title },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
      ])}
      <link rel="canonical" href="https://hackathons.hackclub.com" />
      <link rel="shortcut icon" href="favicon.ico" />
    </Helmet>
    {children()}
  </ThemeProvider>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
