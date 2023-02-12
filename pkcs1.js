// (() => {

//   /*
//   Store the calculated signature here, so we can verify it later.
//   */
//   let signature;

//   function getMessageEncoding() {
//     const messageBox = document.querySelector("#rsassa-pkcs1-message");
//     let message = messageBox.value;
//     let enc = new TextEncoder();
//     return enc.encode(message);
//   }


//   async function signMessage(privateKey) {
//     const signatureValue = document.querySelector(".rsassa-pkcs1 .signature-value");
//     signatureValue.classList.remove("valid", "invalid");

//     let encoded = getMessageEncoding();
//     signature = await window.crypto.subtle.sign(
//       "RSASSA-PKCS1-v1_5",
//       privateKey,
//       encoded
//     );

//     signatureValue.classList.add('fade-in');
//     signatureValue.addEventListener('animationend', () => {
//       signatureValue.classList.remove('fade-in');
//     });
//     let buffer = new Uint8Array(signature);
//     signatureValue.textContent = `${buffer}...[${signature.byteLength} bytes total]`;
//   }


//   async function verifyMessage(publicKey,key) {
//     // console.log('public keyyyyyyy',publicKey,publicKey.algorithm.publicExponent.buffer.toString('base64'));
//     // const signatureValue = document.querySelector(".rsassa-pkcs1 .signature-value");
//     // signatureValue.classList.remove("valid", "invalid");
// const exp = await exportCryptoKey(key)
// console.log('exp************',exp);
// const exportedAsString = ab2str(exp);
//   const exportedAsBase64 = window.btoa(exportedAsString);
//   console.log(exportedAsString);
//   console.log(exportedAsBase64);
//     let encoded = getMessageEncoding();
//     let result = await window.crypto.subtle.verify(
//       "RSASSA-PKCS1-v1_5",
//       publicKey,
//       signature,
//       encoded
//     );

//     signatureValue.classList.add(result ? "valid" : "invalid");
//   }

//   async function exportCryptoKey(key) {
//     const exported = await window.crypto.subtle.exportKey(
//       "raw",
//       key
//     );
//     const exportedKeyBuffer = new Uint8Array(exported);
//     return exportedKeyBuffer
//   }

//   window.crypto.subtle.generateKey(
//     {
//       name: "AES-GCM",
//       length: 256,
//     },
//     true,
//     ["encrypt", "decrypt"]
//   ).then((keyPair) => {
//     const signButton = document.querySelector(".rsassa-pkcs1 .sign-button");
//     signButton.addEventListener("click", () => {
//       signMessage(keyPair.privateKey);
//     });

//     const verifyButton = document.querySelector(".rsassa-pkcs1 .verify-button");
//     verifyButton.addEventListener("click", () => {
//       verifyMessage(keyPair.publicKey,keyPair);
//     });
//   });

// })();

// function ab2str(buf) {
//   return String.fromCharCode.apply(null, new Uint8Array(buf));
// }


const crypto = window.crypto || window.msCrypto; // for IE 11 compatibility
const subtle = crypto.subtle;

async function generatePublicKey() {
  const keyPair = await subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      // Consider using a 4096-bit key for systems that require long-term security
      modulusLength: 1024,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]// can be any combination of "encrypt" and "decrypt"
  );

  const publicKey = keyPair.publicKey;
  const publicKeyArrayBuffer = await subtle.exportKey("spki", publicKey);
  const publicKeyPem = arrayBufferToPem(publicKeyArrayBuffer, "PUBLIC KEY");

  console.log(publicKeyPem);
  return publicKeyPem;
}

function arrayBufferToPem(arrayBuffer, label) {
  const base64 = arrayBufferToBase64(arrayBuffer);
  return `-----BEGIN ${label}-----\n` +
    chunkString(base64, 64) +
    `\n-----END ${label}-----\n`;
}

function chunkString(str, length) {
  return str.match(new RegExp(`.{1,${length}}`, "g")).join("\n");
}

function arrayBufferToBase64(arrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

generatePublicKey().then(res=>console.log(res))