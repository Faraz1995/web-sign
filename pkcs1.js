const crypto = window.crypto || window.msCrypto // for IE 11 compatibility
const subtle = crypto.subtle

let signature
let keyPair


function getMessageEncoding() {
  const messageBox = document.querySelector('#rsassa-pkcs1-message')
  let message = messageBox.value
  let enc = new TextEncoder()
  return enc.encode(message)
}

async function generatePublicKey() {
  console.log('generate public key called')

  const publicKey = keyPair.publicKey
  const publicKeyArrayBuffer = await subtle.exportKey('spki', publicKey)
  const publicKeyPem = arrayBufferToPem(publicKeyArrayBuffer, 'PUBLIC KEY')
  const public = document.querySelector('.public-key-text p')
  public.textContent = publicKeyPem
  return publicKeyPem
}

function arrayBufferToPem(arrayBuffer, label) {
  const base64 = arrayBufferToBase64(arrayBuffer)
  return (
    `-----BEGIN ${label}-----\n` + chunkString(base64, 64) + `\n-----END ${label}-----\n`
  )
}

function chunkString(str, length) {
  return str.match(new RegExp(`.{1,${length}}`, 'g')).join('\n')
}

function arrayBufferToBase64(arrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

async function getKey() {
  return subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      // Consider using a 4096-bit key for systems that require long-term security
      modulusLength: 1024,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    false,
    ['sign', 'verify'] // can be any combination of "encrypt" and "decrypt"
  )
}

async function signMessage() {
  console.log('signed called')
  keyPair = await getKey()
  const privateKey = keyPair.privateKey

  const signatureValue = document.querySelector('.rsassa-pkcs1 .signature-value')
  signatureValue.classList.remove('valid', 'invalid')

  let encoded = getMessageEncoding()
  signature = await window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, encoded)

  signatureValue.classList.add('fade-in')
  signatureValue.addEventListener('animationend', () => {
    signatureValue.classList.remove('fade-in')
  })
  let buffer = new Uint8Array(signature)
  signatureValue.textContent = `${buffer}...[${signature.byteLength} bytes total]`
}

async function verifyMessage() {
  console.log('verify called')

  const publicKey = keyPair.publicKey
  console.log(publicKey)
  const signatureValue = document.querySelector('.rsassa-pkcs1 .signature-value')
  signatureValue.classList.remove('valid', 'invalid')
  let encoded = getMessageEncoding()
  let result = await window.crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signature,
    encoded
  )

  signatureValue.classList.add(result ? 'valid' : 'invalid')
}

const verifyButton = document.querySelector('.rsassa-pkcs1 .verify-button')
verifyButton.addEventListener('click', () => {
  verifyMessage()
})

const signButton = document.querySelector('.rsassa-pkcs1 .sign-button')
signButton.addEventListener('click', () => {
  signMessage()
})

const publicKeyBtn = document.querySelector('.public-btn')
publicKeyBtn.addEventListener('click', () => {
  generatePublicKey()
})
