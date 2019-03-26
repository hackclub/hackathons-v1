import React from 'react'
import {
  Field,
  Container,
  Box,
  Button,
  Text,
  Heading,
} from '@hackclub/design-system'
import styled from 'styled-components'
import { withFormik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'

const bg = {
  error: 'error',
  success: 'success',
  submitting: 'gray.4',
}

const content = {
  error: 'Something went wrong',
  success: 'Check your email! 📬',
  submitting: 'Submitting…',
}

const Base = styled(Container).attrs({
  maxWidth: 48,
  bg: 'blue.0',
  color: 'black',
  mx: 'auto',
  p: 3,
})`
  border-radius: ${({ theme }) => theme.radius};
  input[type='email'],
  input[type='text'] {
    background: ${({ theme }) => theme.colors.blue[1]};
    border: 0;
    &::placeholder {
      color: ${({ theme }) => theme.colors.muted};
    }
  }
`

const Form = styled.form`
  display: grid;
  grid-gap: ${({ theme }) => theme.space[3]}px;
  align-items: flex-end;
  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr 1fr auto;
  }
  label {
    margin-bottom: 0;
  }
  label div {
    color: ${({ theme }) => theme.colors.slate};
    font-size: ${({ theme }) => theme.fontSizes[1]}px;
  }
`

const Submit = ({ status, onSubmit }) => (
  <Button.input
    value={content[status] || 'Add My Email'}
    bg={bg[status] || 'primary'}
    onSubmit={onSubmit}
    type="submit"
    disabled={status === 'submitting'}
  />
)

export const Error = styled(Text).attrs({
  className: 'error',
  color: 'error',
  f: 1,
  ml: 1,
  my: 0,
})`
  font-weight: normal;
  text-transform: lowercase;
  &:before {
    content: '— ';
  }
`

const InnerForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  status,
}) => (
  <Base>
    <Heading.h2 f={3} color="black" mt={1} mb={1}>
      Want to hear when events are added in your area?
    </Heading.h2>
    <Text f={2} color="muted" mb={2}>
      Join thousands of subscribers from {values.stats.cities} cities +{' '}
      {values.stats.countries} countries.
    </Text>
    <Form onSubmit={handleSubmit}>
      <Field
        name="email"
        label="Email"
        type="email"
        value={values.email || ''}
        error={touched.email && errors.email}
        placeholder="you@email.com"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
      <Field
        name="location"
        label="Location"
        type="text"
        value={values.location || ''}
        error={touched.location && errors.location}
        placeholder="Chicago, IL"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
      <Submit status={status} onSubmit={handleSubmit} />
    </Form>
  </Base>
)

const FormikForm = withFormik({
  enableReinitialize: true,
  handleSubmit: (
    values,
    { setSubmitting, setErrors, setValues, setStatus, resetForm }
  ) => {
    setStatus('submitting')
    const data = {
      email: values.email,
      location: values.location,
      timestamp: new Date(),
    }
    try {
      window.analytics.identify({ email: data.email })
      window.analytics.track('Submitted Email', {
        email: data.email,
        location: data.location,
      })
    } catch (err) {
      console.error(err)
    }
    axios
      .post('https://api.hackclub.com/v1/event_email_subscribers', data)
      .then(_resp => {
        resetForm()
        setStatus('success')
      })
      .catch(err => {
        setSubmitting(false)
        setStatus('error')
        setErrors(err)
      })
  },
  validationSchema: yup.object().shape({
    email: yup
      .string()
      .email('Invalid email')
      .required(),
    location: yup.string().required(),
  }),
})(InnerForm)

export default props => (
  <Box align="center" mx="auto" mb={4} px={3}>
    <FormikForm stats={props.stats} location={props.location} />
  </Box>
)
