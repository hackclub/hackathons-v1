import React from 'react'
import { Field, Box } from '@hackclub/design-system'
import { withFormik } from 'formik'
import yup from 'yup'
import axios from 'axios'

const InnerForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
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
  </form>
)

const FormikForm = withFormik({
  handleSubmit: (values, { setSubmitting, setErrors, setValues }) => {
    axios
      .post('http://example.com', values)
      .then(_resp => {
        setSubmitting(false)
        setValues({ email: '' })
      })
      .catch(err => {
        setSubmitting(false)
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
