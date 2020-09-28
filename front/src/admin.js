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
        <p>Nous vous présentons un concept innovant :  un sachet mono dose de gel hydroalcoolique personnalisable à l’identité visuelle de votre établissement. Il s’agit d’un véritable support de communication / marketing, et d’un objet répondant aux besoins de la crise sanitaire, un acte de bienveillance pour la santé de vos clients, de vos partenaires puisque 80% des maladies infectieuses se transmettent par les mains.</p>
        <p>La fabrication de Gel + France est 100% Française, l’emballage est recyclable, le gel est actif sur les virus, bactéries et une partie des bénéfices de chaque sachet vendu est reversée aux hôpitaux de France afin de soutenir les soignants. Le sachet est entièrement personnalisable.</p>
        <p>Pour illustrer le concept, nous sommes heureux de vous présenter un exemple d’échantillon de sachet mono dose de gel hydroalcoolique personnalisé à votre identité visuelle * :</p>
        <p>{SACHET_IMAGE}</p>
        <p>Pour visualiser le sachet en 3D, cliquez sur le lien crée ref <b>{ID_SACHET}</b> : <br/>{SACHET_LINK}
        <br/>Dans l’attente de vous lire ou de vous entendre, nous vous prions d’agréer, l’expression de nos respectueuses salutations.
        </p>
        <p></p>
        <p>L’équipe Gel + France<br><a href="https://www.gelplusfrance.com/">https://www.gelplusfrance.com/</a><br/>SA JPS – Gelplusfrance<br/>71, Rue Réaumur 75002 Paris<br/>Tél. 01.42.78.65.89</p>
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

let fileName;

$(document).on('change', '#csv-file', (e) => {
  if (e.target.files && e.target.files.length) {
    // parameters[e.target.name] = e.target.files[0];

    fileName = e.target.files[0].name
    $(e.target).next('label').html(fileName)


    loadFile(e.target.files[0]).then((fileString) => {
      const lines = fileString.split('\n').filter(line => line.length > 5)

      csv = lines.map(line => {
        const [firstField, firstRemaining] = line.split(/;(.+)/)
        const [secondField, thirdField] = firstRemaining.split(/;(.+)/)

        return [firstField, secondField, thirdField]
      })

      const html = csv.reduce((html, line, index) => {

        html += `<tr>
            <td><div class="form-group form-check"><input type="checkbox" class="form-check-input check-row" data-index="${index}" checked></div></td>
            <td>${index + 1}</td>
            <td>${line[0]}</td>
            <td>${line[1]}</td>
            <td><img src="${line[2]}" class="logo-image"/></td>
        </tr>`

        return html
      }, '')

      $('#send-emails').prop('disabled', csv.length === 0)
      $('#download-rows').prop('disabled', csv.length === 0)

      $('.csv-content').html(html)
    }).catch(error => {
      Toastify({
        text: 'Error on file',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
      }).showToast()

      $('#send-emails').prop('disabled', false)
      $('#download-rows').prop('disabled', false)
    })
  }
})

document.getElementById('download-rows').addEventListener('click', function() {
  const selectedRows = $('.check-row').toArray()
    .filter((element) => $(element).prop('checked'))
    .map((element) => parseInt($(element).data('index')))

  const csvFiltered = csv.filter((e, i) => selectedRows.includes(i))
  const csvContent = csvFiltered.map(row => row.join(';')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  this.href = URL.createObjectURL(blob)
  this.download = fileName ? fileName : 'output.csv'
}, false)

$(document).on('click', '#send-emails', (e) => {
  e.preventDefault()

  const selectedRows = $('.check-row').toArray()
    .filter((element) => $(element).prop('checked'))
    .map((element) => parseInt($(element).data('index')))

  const csvFiltered = csv.filter((e, i) => selectedRows.includes(i))

  if (!csvFiltered || !csvFiltered.length) return

  const $button = $(this)

  const oldContent = $button.html()
  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  $.ajax({
    url: postUrl,
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
    },
    data: {
      content: editor.getData(),
      csv: csvFiltered,
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

$(document).on('change', '.check-all', function(event) {
  const $checkbox = $(event.target)
  const checked = $checkbox.prop('checked')

  $('.check-row').prop('checked', checked)

  $('.check-row').toArray().filter(function(element) {
    return $(element).prop('checked')
  }).map(function(element) {
    return parseInt($(element).data('index'))
  })
})


