import CryptoJS from 'crypto-js'

const secretKey = 'cogito-ergosum'

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, secretKey).toString()
}

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey)


  return bytes.toString(CryptoJS.enc.Utf8)
}

export const saveToken = (token: string) => {
  // const encrypted = encrypt(token)

  localStorage.setItem('auth_token', token)
}

export const getToken = (): string | null => {
  const encrypted = localStorage.getItem('auth_token')


  // return encrypted ? decrypt(encrypted) : null
  return encrypted
}

export const clearToken = () => {
  localStorage.removeItem('auth_token')
}
