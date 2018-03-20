const { createElement: h } = require('react')

const width = 512
const widthIcon = 0.75 * width
const padding = 0.125 * width

module.exports = props =>
  h(
    'div',
    {
      style: {
        boxSizing: 'border-box',
        margin: 0,
        padding,
        width,
        height: width,
        backgroundImage:
          'linear-gradient(-33deg, rgb(235, 151, 99) 0%, rgb(228, 45, 66) 50%, rgb(206, 41, 60) 100%)',
        backgroundBlendMode: 'overlay',
      },
    },
    h('img', {
      src: 'https://icon.now.sh/local_activity/ffffff',
      style: { width: widthIcon },
    })
  )
