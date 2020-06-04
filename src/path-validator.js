import path from 'path';

export const validatePath = (pathString) => {
  const { name, ext } = path.parse(pathString)

  return { isValid: name && ext, name, ext}
}