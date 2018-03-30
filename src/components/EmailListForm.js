import React from 'react'
import {
  Field,
  Box,
  Button,
  Text,
  Flex,
  Heading,
} from '@hackclub/design-system'
import { withFormik } from 'formik'
import yup from 'yup'
import axios from 'axios'

const bg = {
  error: 'error',
  success: 'success',
  submitting: 'gray.4',
}

const content = {
  error: 'Something went wrong',
  success: 'Submitted',
  submitting: 'Submitting...',
}

const Submit = ({ status, onSubmit }) => (
  <Button.input
    value={content[status] || 'Submit'}
    bg={bg[status] || 'primary'}
    onSubmit={onSubmit}
    type="submit"
    disabled={status === 'submitting'}
  />
)

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
  <form onSubmit={handleSubmit}>
    <Heading.h4>
      Want to hear about future events in your area? Enter your email +
      location.
    </Heading.h4>
    <Heading.h4 color="slate" my={3}>
      <em>(We’ll never spam you)</em>
    </Heading.h4>
    <Flex justify="center">
      <Field
        name="email"
        label=""
        type="email"
        value={values.email || ''}
        error={touched.email && errors.email}
        placeholder="your@email.com"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
      <Field
        name="location"
        label=""
        value={values.location || ''}
        error={touched.location && errors.location}
        placeholder="city, region, country"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
    </Flex>
    <Submit status={status} onSubmit={handleSubmit} />
  </form>
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
    axios
      .get('https://hooks.zapier.com/hooks/catch/507705/k0zdat/', {
        params: data,
      })
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
  <Box align="center" mx="auto" my={4} {...props}>
    <FormikForm location={props.location} />
  </Box>
)
