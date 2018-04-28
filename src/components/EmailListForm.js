import React from 'react'
import {
  Label,
  Input,
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
  success: 'Check Your Email ✈️',
  submitting: 'Submitting...',
}

const Submit = ({ status, onSubmit }) => (
  <Button.input
    value={content[status] || 'Add My Email'}
    bg={bg[status] || 'primary'}
    onSubmit={onSubmit}
    type="submit"
    disabled={status === 'submitting'}
  />
)

const EmailHeading = Heading.h4.extend.attrs({ color: 'black' })`
font-style: italic;
max-width: 400px;
margin-left: auto;
margin-right: auto;
margin-bottom: 16px;
`

export const Error = Text.extend.attrs({
  className: 'error',
  color: 'error',
  f: 1,
  ml: 1,
  my: 0,
})`
  font-weight: normal;
  text-transform: lowercase;
  &:before { content: '— '; }
`

const Field = ({ type, name, placeholder, error, label, ...props }) => (
  <Label className={type} id={name} mb={2}>
    <Input name={name} type={type} placeholder={placeholder} {...props} />
    <Flex align="center" mb={2} wrap>
      {error && <Error children={error} />}
      {label}
    </Flex>
  </Label>
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
    <EmailHeading>
      Want to hear when events are added in your area? Enter your email +
      location.
    </EmailHeading>
    <Flex justify="center">
      <Field
        name="email"
        label=""
        type="email"
        value={values.email || ''}
        error={touched.email && errors.email}
        placeholder="you@email.com"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
      <span style={{ width: '10px' }} /> {/* spacer */}
      <Field
        name="location"
        label=""
        value={values.location || ''}
        error={touched.location && errors.location}
        placeholder="Chicago, IL"
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
      />
    </Flex>
    <Heading.h4 color="muted" mt={2} mb={3} f={2}>
      <em>(we’ll never spam you & you can always unsubscribe)</em>
    </Heading.h4>
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
    try {
      analytics.identify({ email: data.email })
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
  <Box align="center" mx="auto" mb={4}>
    <FormikForm location={props.location} />
  </Box>
)
