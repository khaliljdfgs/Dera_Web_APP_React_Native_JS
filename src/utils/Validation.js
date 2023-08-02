export const REGULAR_EXPRESSION = {
  EMAIL: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  // TODO: Enable this regex after testing
  // PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  PASSWORD: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
  FULLNAME: /^[a-zA-Z\s-.]+$/,
  PHONE: /^03[0-9]{9}$/,
}

export const InputStringValidation = ({
  field,
  value,
  min = 3,
  max = 50,
  regExp = null,
  isRequired = true,
}) => {
  if (value === null || value === undefined || value === '') {
    return isRequired ? `${field} is required!` : null
  } else if (value.length < min) {
    return `${field} is too short!`
  } else if (regExp && !regExp.test(String(value).toLowerCase())) {
    return `${field} is not valid!`
  } else if (value.length > max) {
    return `${field} is too long!`
  } else {
    return null
  }
}

export const InputNumberValidation = ({
  field,
  value,
  min = 3,
  max = 50,
  isRequired = true
}) => {
  if (value === null || value === undefined || value === '') {
    return isRequired ? `${field} is required!` : null
  }

  const number = Number(value)
  if (isNaN(number)) {
    return `${field} is invalid!`
  }

  if (number < min) {
    return `${field} is too short!`
  } else if (number > max) {
    return `${field} is too long!`
  } else {
    return null
  }
}