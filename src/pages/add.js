import React, { Component } from 'react'
import {
  Container,
  Box,
  Button,
  Link,
  Text,
  Field,
  Flex,
  Input,
  Heading,
} from '@hackclub/design-system'
import { withFormik } from 'formik'
import yup from 'yup'

const fieldNames = {
  name: 'entry.299763282',
  start: 'entry.1711452770',
  end: 'entry.1436854072',
  website: 'entry.1450108480',
  address: 'entry.582486715',
}

const SubmitButton = ({ status, isSubmitting }) => (
  <Button.input
    type="submit"
    value={status === 'success' ? 'Submitted!' : 'Submit'}
    bg={status === 'success' ? 'success' : 'primary'}
    disabled={isSubmitting}
  />
)

const InnerForm = ({
  handleChange,
  handleBlur,
  handleSubmit,
  values,
  errors,
  touched,
  status,
  isSubmitting,
}) => (
  <Container maxWidth={32} my={3}>
    <Heading>Hackathon Listing Application</Heading>
    <Text my={3}>
      Please fill out this form to apply for a listing. After submitting, we’ll
      get back to you with any further questions we may have. If your event
      meets our criteria we’ll aim to have it listed within 3 days.
    </Text>
    <form onSubmit={handleSubmit}>
      <Field
        label="Hackathon Name"
        name="name"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        error={touched.name && errors.name}
      />
      <Field
        placeholder="mm / dd / yyyy"
        label="Start date"
        name="start"
        type="date"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.start}
        error={touched.start && errors.start}
      />
      <Field
        placeholder="mm / dd / yyyy"
        label="End date"
        name="end"
        type="date"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.end}
        error={touched.end && errors.end}
      />
      <Field
        placeholder="https://"
        label="Event website"
        name="website"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.website}
        error={touched.website && errors.website}
      />
      <Field
        label="Event location"
        name="address"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.address}
        error={touched.address && errors.address}
      />
      <Flex justify="space-around">
        <Box>
          <Link href="/">
            <Button inverted>Back</Button>
          </Link>
        </Box>
        <Box>
          <SubmitButton status={status} isSubmitting={isSubmitting} />
        </Box>
      </Flex>
    </form>
  </Container>
)

export default withFormik({
  mapPropsToValues: props => ({
    name: '',
    start: '',
    end: '',
    website: '',
    address: '',
  }),
  validationSchema: yup.object().shape({
    name: yup.string().required(),
    start: yup.date().required('A starting day is required'),
    end: yup.date().required('An ending day is required'),
    website: yup
      .string()
      .url()
      .required(),
    address: yup.string().required(),
  }),
  handleSubmit: (values, { props, setSubmitting, setStatus, resetForm }) => {
    const data = {}
    Object.keys(values).forEach(k => {
      if (fieldNames[k]) {
        data[fieldNames[k]] = values[k]
      }
    })
    data.timeStamp = new Date()
    try {
      // Using xhr instead of Axios to get past CORs issues with Zapier
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://hooks.zapier.com/hooks/catch/507705/k144q7/')
      xhr.send(JSON.stringify(data))
      resetForm()
      setStatus('success')
    } catch (e) {
      console.error(e)
      setSubmitting(false)
    }
  },
})(InnerForm)
