import Toastify from 'toastify-js'

const loginUrl = `${backUrl}/auth/login`
const postUrl = `${backUrl}/sachet/massive`
const getAllSachetsUrl = `${backUrl}/sachet`
let editor, csv

$(document).ready(() => {
  ClassicEditor
    .create(document.querySelector('#editor'))
    .then(theEditor => {
      editor = theEditor

      const buyUrl = 'https://www.gelplusfrance.com/product-page/sachet-personnalisable'

      const body = `<div>
        <table cellspacing="0" cellpadding="0" style="    border-collapse: collapse;">
          <tbody>
              <tr>
              <td>{SACHET_IMAGE}</td>
              <td>        
                <p>Bonjour,</p>
                <p>Nous vous présentons un concept innovant : <b>un sachet mono dose de gel hydroalcoolique personnalisable à l’identité visuelle de votre établissement.</b></p>
                <p>Il s’agit d’un véritable support de communication / marketing, et d’un objet répondant aux besoins de la crise sanitaire, un acte de bienveillance pour la santé de vos clients, de vos partenaires puisque 80% des maladies infectieuses se transmettent par les mains.</p>
            </td>
            </tr>
            <tr><td colspan="2">
                <p>La fabrication de Gel + France est 100% Française, l’emballage est recyclable, le gel est actif sur les virus, bactéries et une partie des bénéfices de chaque sachet vendu est reversée aux hôpitaux de France afin de soutenir les soignants. Le sachet est entièrement personnalisable.</p>
                <p>Pour illustrer le concept, <b>vous pouvez visualiser le sachet en 3D</b> :</p>
                <p>Cliquez sur le lien crée ref <b>{ID_SACHET}</b> : <br> {SACHET_LINK}
                <p>N’hésitez pas à nous faire une demande d’échantillon personnalisé gratuit!</p>
                <br/>
                Dans l’attente de vous lire ou de vous entendre, nous vous prions d’agréer, l’expression de nos respectueuses salutations.
                </p>
                <p></p>
                <p>L’équipe Gel + France<br><a href="https://www.gelplusfrance.com/">https://www.gelplusfrance.com/</a><br/>SA JPS – Gelplusfrance<br/>71, Rue Réaumur 75002 Paris<br/>Tél. 01.42.78.65.89</p>
        </td></tr>
        </tbody>
        </table>
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

document.getElementById('download-all').addEventListener('click', function() {
// function(e) {
//   e.preventDefault()

  const $button = $(this)

  const oldContent = $button.html()
  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  $.ajax({
    url: getAllSachetsUrl,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
    },
    success: (sachets) => {
      $button.html(oldContent)
      $button.prop('disabled', false)

      const csvContent = sachets.map(sachet => Object.values(sachet).map(v => `"${v}"`).join(';')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

      console.log(blob)

      var link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'sachets.csv'
      link.click()
    },
    error: (error) => {
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
}, false)

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

let fileName

$(document).on('change', '#csv-file', (e) => {
  if (e.target.files && e.target.files.length) {
    // parameters[e.target.name] = e.target.files[0];

    fileName = e.target.files[0].name
    $(e.target).next('label').html(fileName)


    loadFile(e.target.files[0]).then((fileString) => {
      // const lines = fileString.split('\n').filter(line => line.length > 5)
      //
      // csv = lines.map(line => {
      //   const [firstField, firstRemaining] = line.split(/;(.+)/)
      //   const [secondField, thirdField] = firstRemaining.split(/;(.+)/)
      //
      //   return [firstField, secondField, thirdField]
      // })

      fileString = fileString.replace(/;base64/g, '!base64!')

      csv = CSVToArray(fileString, ';').filter(line => line.length > 1).map((line) => {
        line[2] = line[2].replace(/!base64!/g, ';base64')

        return line
      })

      const html = csv.reduce((html, line, index) => {

        html += `<tr>
            <td><div class="form-group form-check"><input type="checkbox" class="form-check-input check-row" data-index="${index}" checked></div></td>
            <td>${index + 1}</td>
            <td>${line[0]}</td>
            <td>${line[1]}</td>
            <td><img src="${line[2]}" class="logo-image"/></td>
            <td>${line[3] ? line[3] : ''}</td>
            <td>${line[4] ? `<a href="${line[4]}" target="_blank">${line[4]}</a>` : ''}</td>
        </tr>`

        return html
      }, '')

      $('#send-emails').prop('disabled', csv.length === 0)
      $('#save-sachets').prop('disabled', csv.length === 0)
      $('#download-rows').prop('disabled', csv.length === 0)

      $('.csv-content').html(html)
    }).catch(error => {
      Toastify({
        text: 'Error on file',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
      }).showToast()

      console.error(error)

      $('#send-emails').prop('disabled', false)
      $('#save-sachets').prop('disabled', false)
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

$(document).on('click', '#send-emails, #save-sachets', (e) => {
  e.preventDefault()

  const sendEmails = $(e.target).attr('id') === 'send-emails'

  const selectedRows = $('.check-row').toArray()
    .filter((element) => $(element).prop('checked'))
    .map((element) => parseInt($(element).data('index')))

  const csvFiltered = csv.filter((e, i) => selectedRows.includes(i))

  if (!csvFiltered || !csvFiltered.length) return

  const $button = $(e.target)

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
      sendEmails: sendEmails,
    },
    success: function(response) {
      Toastify({
        text: sendEmails ? 'Emails sent' : 'Sachets created',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
      }).showToast()

      response.sachets.forEach((sachet, index) => {
        const rowNumber = selectedRows[index]
        const tds = $($('.csv-content tr').get(rowNumber)).find('td')

        tds[tds.length - 2].innerHTML = sachet.id
        tds[tds.length - 1].innerHTML = `<a href="${sachet.link}" target="_blank">${sachet.link}</a>`

        csv[rowNumber].push(sachet.id, sachet.link)
      })

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

/* CSV Parsing */
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ',')

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +

      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +

      // Standard fields.
      '([^"\\' + strDelimiter + '\\r\\n]*))'
    ),
    'gi',
  )


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]]

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData)) {

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1]

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ) {

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([])

    }

    var strMatchedValue

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp('""', 'g'),
        '"',
      )

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[3]

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue)
  }

  return (arrData)
}

/* CSV Parsing */