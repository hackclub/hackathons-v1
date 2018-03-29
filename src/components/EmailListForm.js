import React from 'react'
import { Field, Box, Button, Text, Flex } from '@hackclub/design-system'
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
    <Text>Be notified when an event is running in your area</Text>
    <Text><em>(We'll never spam you)</em></Text>
    <Flex nowrap justify="center">
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
  handleSubmit: (
    values,
    { setSubmitting, setErrors, setValues, setStatus }
  ) => {
    setStatus('submitting')
    const data = {
      'entry.1968413973': values.email,
      'entry.1170418241': values.location
    }
    axios({
      method: 'get',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSccVRnydeDLLSWslbR6tsLHWOg6zUw9XakHkoi3mFsNy0EazA/formResponse',
      data: data,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      }
    }).then(_resp => {
        setSubmitting(false)
        setStatus('success')
        setValues({ email: '' })
      })
      .catch(err => {
        setSubmitting(false)
        setStatus('error')
        setErrors(err)
      })
  },
  validationSchema: yup.object().shape({
    email: yup.string().email('Invalid email').required(),
    location: yup.string().required()
  }),
})(InnerForm)

export default props => (
  <Box {...props}>
    <FormikForm location={props.location}/>
  </Box>
)
