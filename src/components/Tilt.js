import React, { Component } from 'react'
import VanillaTilt from 'vanilla-tilt'

class Tilt extends Component {
  componentDidMount() {
    VanillaTilt.init(this.rootNode, {
      max: 15,
      scale: 1.05,
      speed: 400,
      glare: true,
      'max-glare': 0.3,
      ...this.props.tiltOptions,
    })
  }

  render() {
    return (
      <div
        ref={node => (this.rootNode = node)}
        className="tilt-root"
        {...this.props}
      />
    )
  }
}

export default Tilt
