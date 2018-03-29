import React from 'react'
import { Field, Box, Button } from '@hackclub/design-system'
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
    <Field
      name="email"
      type="email"
      label="Be notified when an event is running in your area"
      value={values.email || ''}
      error={touched.email && errors.email}
      placeholder="your@email.com"
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={isSubmitting}
    />
    <Submit status={status} onSubmit={handleSubmit} />
  </form>
)

const FormikForm = withFormik({
  handleSubmit: (
    values,
    { setSubmitting, setErrors, setValues, setStatus }
  ) => {
    setStatus('submitting')
    axios
      .post('http://example.com', values)
      .then(_resp => {
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
    email: yup.string().email('Invalid email'),
  }),
})(InnerForm)

export default props => (
  <Box {...props}>
    <FormikForm />
  </Box>
)
