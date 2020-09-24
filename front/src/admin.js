import Toastify from 'toastify-js'

const loginUrl = `${backUrl}/auth/login`
const postUrl = `${backUrl}/sachet/massive`
let editor, csv

$(document).ready(() => {
  ClassicEditor
    .create(document.querySelector('#editor'))
    .then(theEditor => {
      editor = theEditor

      const buyUrl = 'https://www.gelplusfrance.com/product-page/sachet-personnalisable'

      const body = `<div>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le visuel 3D du sachet crée référence <b>{ID_SACHET}</b> : <a href="{SACHET_LINK}">{SACHET_LINK}</a>
        <br/>Pour commander, cliquer sur ce lien : <a href="${buyUrl}">${buyUrl}</a>
        </p>
        <p></p>
        <p>Bien Cordialement<br><a href="https://www.gelplusfrance.com/">https://www.gelplusfrance.com/</a></p>
        </div>`

      editor.data.set(body)
    })
    .catch(error => {
      console.error(error)
    })
})

$('#login-form').submit(function(e) {
  e.preventDefault()

  const $button = $(this).find('[type="submit"]')

  const oldContent = $button.html()
  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  $.ajax({
    url: loginUrl,
    type: 'POST',
    data: {
      username: $('#username').val(),
      password: $('#password').val(),
    },
    success: function(jwt) {
      Toastify({
        text: 'Bienvenu',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
      }).showToast()

      $button.html(oldContent)
      $button.prop('disabled', false)

      window.localStorage.setItem('session', jwt)

      $('#login-form').slideUp(function() {
        $('.csv-container').slideDown()
      })

    },
    error: function(error) {
      Toastify({
        text: error.statusText,
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
      }).showToast()

      console.error(error)
      $button.html(oldContent)
      $button.prop('disabled', false)
    },
  })

  return false
})

function loadFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result)
    }
    fr.onerror = (err) => {
      reject(err)
    }
    fr.readAsText(file)
  })
}


$(document).on('change', '#csv-file', (e) => {
  if (e.target.files && e.target.files.length) {
    // parameters[e.target.name] = e.target.files[0];
    $(e.target).next('label').html(e.target.files[0].name)

    loadFile(e.target.files[0]).then((fileString) => {
      const lines = fileString.split('\n').filter(line => line.length > 5)

      csv = lines.map(line => {
        const [firstField, firstRemaining] = line.split(/;(.+)/)
        const [secondField, thirdField] = firstRemaining.split(/;(.+)/)

        return [firstField, secondField, thirdField]
      })

      const html = csv.reduce((html, line, index) => {

        html += `<tr>
            <td>${index + 1}</td>
            <td>${line[0]}</td>
            <td>${line[1]}</td>
            <td><img src="${line[2]}" class="logo-image" /></td>
        </tr>`

        return html
      }, '')

      console.log(csv.length)

      $('#send-emails').prop('disabled', csv.length === 0)

      $('.csv-content').html(html)
    }).catch(error => {
      Toastify({
        text: 'Error on file',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
      }).showToast()

      $('#send-emails').prop('disabled', false)
    })
  }
})

$(document).on('click', '#send-emails', (e) => {
  e.preventDefault()

  if (!csv || !csv.length) return

  const $button = $(this)

  const oldContent = $button.html()
  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  $.ajax({
    url: postUrl,
    type: 'POST',
    headers: {
      "Authorization": `Bearer ${window.localStorage.getItem('session')}`
    },
    data: {
      content: editor.getData(),
      csv: csv,
    },
    success: function(response) {
      Toastify({
        text: 'Emails sent',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
      }).showToast()

      $button.html(oldContent)
      $button.prop('disabled', false)
    },
    error: function(error) {
      Toastify({
        text: error.statusText,
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
      }).showToast()

      console.error(error)
      $button.html(oldContent)
      $button.prop('disabled', false)
    },
  })

  return false
})
