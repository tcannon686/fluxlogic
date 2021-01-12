/*
 * Utility functions
 */

/*
 * Prompts the user to save the given text as the given filename.
 */
export const download = (filename, text) => {
  var element = document.createElement('a')
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

/*
 * Prompts the user to upload a file. Returns a promise that resolves to the
 * text loaded from the file.
 */
export const upload = () => {
  return new Promise((resolve, reject) => {
    var element = document.createElement('input')
    element.setAttribute('type', 'file')

    element.style.display = 'none'
    document.body.appendChild(element)

    element.addEventListener(
      'change',
      function () {
        this.files[0].text()
          .then((data) => resolve(data))
          .catch((error) => reject(error))
      },
      false)

    element.click()

    document.body.removeChild(element)
  })
}
