import Toastify from 'toastify-js'
import SachetImageGenerator, { formatDate, loadFileAsText } from './SachetImageGenerator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const loginUrl = `${backUrl}/auth/login`
const postUrl = `${backUrl}/sachet/massive`
const getAllSachetsUrl = `${backUrl}/sachet`
const getAllUnsubscribedEmailsUrl = `${backUrl}/sachet/unsubscribe`
const getAllUnsubscribedDomainsUrl = `${backUrl}/sachet/domain`
let editor, csv, sachets, domains, emails, checkboxEmails = []

const sachetGenerator = new SachetImageGenerator()

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
    success: async function(jwt) {
      Toastify({
        text: 'Bienvenu',
        duration: 3000,
        backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
      }).showToast()

      $button.html(oldContent)
      $button.prop('disabled', false)

      window.localStorage.setItem('session', jwt)

      const results = await Promise.all([getUnsubscribedEmails(), getUnsubscribedDomains()])

      emails = results[0]
      domains = results[1].map(d => d.trim())

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
      $button.html(oldContent)
      $button.prop('disabled', false)
    },
  })
}, false)


function getUnsubscribedEmails() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: getAllUnsubscribedEmailsUrl,
      type: 'GET',
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
      },
      success: (unsubscribedEmails) => {
        $('.lines-detail-blacklist').html(unsubscribedEmails.length)

        const emails = []
        const html = unsubscribedEmails.reduce((html, unsubscribedEmail, index) => {

          html += `<tr>
            <td>${index + 1}</td>
            <td>${unsubscribedEmail.email}</td>
            <td>${new Date(unsubscribedEmail.createdAt).toLocaleString()}</td>
        </tr>`

          emails.push(unsubscribedEmail.email)

          return html
        }, '')

        $('.blacklist-content').html(html)

        resolve(emails)
      },
      error: (error) => {
        Toastify({
          text: error.statusText,
          duration: 3000,
          backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
        }).showToast()

        reject()
      },
    })
  })
}


function getUnsubscribedDomains() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: getAllUnsubscribedDomainsUrl,
      type: 'GET',
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
      },
      success: (unsubscribedDomains) => {
        $('.lines-detail-blacklist-domains').html(unsubscribedDomains.length)

        const domains = []
        const html = unsubscribedDomains.reduce((html, unsubscribedDomain, index) => {

          html += `<tr>
            <td>${index + 1}</td>
            <td>${unsubscribedDomain.domain}</td>
            <td>${new Date(unsubscribedDomain.createdAt).toLocaleString()}</td>
        </tr>`

          domains.push(unsubscribedDomain.domain)

          return html
        }, '')

        $('.blacklist-content-domains').html(html)

        resolve(domains)
      },
      error: (error) => {
        Toastify({
          text: error.statusText,
          duration: 3000,
          backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
        }).showToast()

        reject()
      },
    })
  })
}

function saveUnsubscribedEmails(emails) {
  return new Promise((resolve, reject) => {

    $.ajax({
      url: getAllUnsubscribedEmailsUrl,
      type: 'POST',
      data: {
        emails: emails,
      },
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
      },
      success: (newUnsubscribedEmails) => {
        const numberOfLines = parseInt($('.lines-detail-blacklist').html()) + newUnsubscribedEmails.length
        $('.lines-detail-blacklist').html(numberOfLines)

        const html = newUnsubscribedEmails.reduce((html, unsubscribedEmail, index) => {

          html += `<tr>
            <td>${index + 1}</td>
            <td>${unsubscribedEmail.email}</td>
            <td>${new Date(unsubscribedEmail.createdAt).toLocaleString()}</td>
        </tr>`

          return html
        }, '')

        $('.blacklist-content').html(html + $('.blacklist-content').html())

        resolve(newUnsubscribedEmails)
      },
      error: (error) => {
        Toastify({
          text: error.statusText,
          duration: 3000,
          backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
        }).showToast()
        reject(error)
      },
    })
  })
}

function saveUnsubscribedDomains(domains) {
  return new Promise((resolve, reject) => {

    $.ajax({
      url: getAllUnsubscribedDomainsUrl,
      type: 'POST',
      data: {
        domains: domains,
      },
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
      },
      success: (newUnsubscribedDomains) => {
        const numberOfLines = parseInt($('.lines-detail-blacklist-domains').html()) + newUnsubscribedDomains.length
        $('.lines-detail-blacklist-domains').html(numberOfLines)

        const html = newUnsubscribedDomains.reduce((html, unsubscribedDomain, index) => {

          html += `<tr>
            <td>${index + 1}</td>
            <td>${unsubscribedDomain.domain}</td>
            <td>${new Date(unsubscribedDomain.createdAt).toLocaleString()}</td>
        </tr>`

          return html
        }, '')

        $('.blacklist-content-domains').html(html + $('.blacklist-content-domains').html())

        resolve(newUnsubscribedDomains)
      },
      error: (error) => {
        Toastify({
          text: error.statusText,
          duration: 3000,
          backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
        }).showToast()
        reject(error)
      },
    })
  })
}

let fileName

if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1
  }
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function(search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0
      return this.substring(pos, pos + search.length) === search
    },
  })
}

$(document).on('click', '.filter-rows', (e) => {
  const extensionsText = $('#email-extensions').val()
  const extensions = extensionsText ? extensionsText.split(',') : []

  if (!extensions.length)
    return

  let count = 0
  $('.csv-content tr').each((i, e) => {
    const email = $(e).find('td:nth-child(3)').html()
    const hasExtensions = extensions.some(extension => email.endsWith(extension))

    const check = $(e).find('.check-row')
    if (check.prop('checked')) {
      check.prop('checked', !hasExtensions)
    }

    if (!hasExtensions)
      count++
  })

  updateCsvLines(count)
})

function updateCsvLines(filteredLines) {
  $('.lines-detail').html(`(${filteredLines} de ${csv.length})`)
}

$(document).on('click', '.table-hover tbody tr', function() {
  const $this = $(this)
  const $checkbox = $this.find('[type="checkbox"]')

  if ($checkbox) {
    $checkbox.prop('checked', !$checkbox.prop('checked'))
  }
})

$(document).on('change', '#csv-file', (e) => {
  if (e.target.files && e.target.files.length) {
    fileName = e.target.files[0].name
    $(e.target).next('label').html(fileName)

    loadFileAsText(e.target.files[0]).then((fileString) => {
      fileString = fileString.replace(/;base64/g, '!base64!')

      csv = CSVToArray(fileString, ';')
        .filter(line => line.length === 1 || (line[2].includes('base64') && line.length > 1))
        .map((line) => {
          line[0] = line[0].toLowerCase().trim()

          if (line[2])
            line[2] = line[2].replace(/!base64!/g, ';base64')

          return line
        })

      $('#email-extensions').html('')
      updateCsvLines(csv.length)

      let count = 0

      const regexBase = '[a-zA-Z\\-0-9\\.]+@[a-zA-Z\\-0-9\\.]*'
      const starRegex = '(\\.|\\+|\\-|@|\\w)*'

      const domainsRegex = domains.map(domain => {
        const domainReplaced = domain.replace(/\./g, '\\.').replace(/\*/g, starRegex).toString()

        if (domain.endsWith('*') || domain.startsWith('*')) {
          return new RegExp(domainReplaced)
        } else {
          return new RegExp(regexBase + domainReplaced)
        }
      })

      const html = csv.reduce((html, line, index) => {
        const [email, url, logo, id, link] = line

        const hasSomeRegex = domainsRegex.some(domainRegex => domainRegex.test(email))
        const isInBlacklist = emails.includes(email)
        const checked = !(hasSomeRegex || isInBlacklist)

        if (checked) count++

        html += `<tr>
            <td>
              <div class="form-group form-check">
                <input type="checkbox" class="form-check-input check-row" 
                data-index="${index}" data-email="${email}" ${checked ? 'checked' : ''}>
              </div>
            </td>
            <td>${index + 1}</td>
            <td>${email}</td>
            <td>${url ? url : ''}</td>
            <td><img src="${logo ? logo : 'objects/logoExample.png'}" class="logo-image"/></td>
            <td>${id ? id : ''}</td>
            <td>${link ? `<a href="${link}" target="_blank">${link}</a>` : ''}</td>
        </tr>`

        return html
      }, '')

      $('#send-emails').prop('disabled', csv.length === 0)
      $('#save-sachets').prop('disabled', csv.length === 0)
      $('#download-rows').prop('disabled', csv.length === 0)

      $('.csv-content').html(html)
      updateCsvLines(count)
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
      // $('.download-images').prop('disabled', false)
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

$('.download-images').click(function() {
  const $button = $(this)
  const oldContent = $button.html()
  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  downloadSachetsAsZip(sachets).then(() => {
    $button.html(oldContent)
    $button.prop('disabled', false)
  }).catch((e) => {
    console.log(e)
    Toastify({
      text: e.message,
      duration: 3000,
      backgroundColor: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
    }).showToast()

    $button.html(oldContent)
    $button.prop('disabled', false)
  })
})

$(document).on('click', '#send-emails, #save-sachets', async (e) => {
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

  $('.errors-container ul').html('')
  $('.errors-container').slideUp()

  const sachetChunks = chunkArrayInGroups(csvFiltered, 100)
  const sachetResult = []

  if (checkboxEmails.length) {
    await saveUnsubscribedEmails(checkboxEmails)
    checkboxEmails = []
  }

  const errors = []
  sachetChunks.reduce((current, sachetChunk, indexChunk) => {
    return current.then(() => {
      return doRequest({
        url: postUrl,
        type: 'POST',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('session')}`,
        },
        data: {
          content: editor.getData(),
          csv: sachetChunk,
          sendEmails: sendEmails,
          provider: $('[name="provider"]').val(),
        },
      }).then((response) => {

        response.sachets.forEach((sachet, index) => {
          const rowNumber = selectedRows[index + (indexChunk * 100)]
          const tds = $($('.csv-content tr').get(rowNumber)).find('td')

          tds[tds.length - 2].innerHTML = sachet.id ? sachet.id : ''
          tds[tds.length - 1].innerHTML = `<a href="${sachet.link}" target="_blank">${sachet.link}</a>`

          csv[rowNumber].push(sachet.id, sachet.link)
        })

        if (response.errors.length) {
          const html = response.errors.reduce((html, error) => {
            return html + `<li>${error.i + (indexChunk * 100)}: ${error.errors}</li>`
          }, '')

          $('.errors-container ul').append(html)

          if ($('.errors-container').is(':hidden'))
            $('.errors-container').slideDown()
        }

        Toastify({
          text: `Batch ${indexChunk + 1}/${sachetChunks.length} processed`,
          duration: 3000,
          backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
        }).showToast()

        sachetResult.push(...response.sachets)
      }).catch((error) => {
        errors.push(error)
      })
    })
  }, Promise.resolve()).then(() => {
    Toastify({
      text: sendEmails ? 'All emails sent' : 'All sachets created',
      duration: 3000,
      backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
    }).showToast()

    $button.html(oldContent)
    $button.prop('disabled', false)

    console.log(sachetResult)
    console.log(errors)

    sachets = sachetResult

    $('.download-images').prop('disabled', !sachets.length)
  })

  return false
})

function chunkArrayInGroups(arr, size) {
  const chunks = []

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }

  return chunks
}

function doRequest(params) {
  return new Promise((resolve, reject) => {
    $.ajax({
      ...params,
      success: (response) => {
        resolve(response)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

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

$(document).on('change', '.check-row', function(event) {
  const $checkbox = $(event.target)
  const checked = $checkbox.prop('checked')
  const email = $checkbox.data('email')

  if (!checked) {
    checkboxEmails.push(email)
  } else {
    const index = checkboxEmails.indexOf(email)
    checkboxEmails.splice(index, 1)
  }
})

/* ZIP File */
async function downloadSachetsAsZip(sachets) {

  const madeDate = formatDate(new Date($('#inputMadeDate').val()))
  const lotNumber = $('#inputLotNumber').val()
  const sachetChunks = chunkArrayInGroups(sachets.filter(s => s && s.id && s.logo && !s.logo.startsWith('http')), 100)
  let processedLine = 0, processedChunk = 0

  for (const sachets of sachetChunks) {
    const zip = new JSZip()
    const img = zip.folder('images')
    processedChunk++

    for (const sachet of sachets) {
      processedLine++

      try {
        await sachetGenerator.generatePrintImage(SachetImageGenerator.getDefaultParameters(sachet.logo), madeDate, lotNumber)

        const dataUrl = sachetGenerator.getResult().split(',')[1]

        img.file(`${sachet.id}.png`, dataUrl, { base64: true })
      } catch (e) {
        console.error(processedLine, sachet.logo, e)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `sachet_images_${processedChunk}.zip`)

    Toastify({
      text: `Processed ${processedLine} images`,
      duration: 3000,
      backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
    }).showToast()
  }

  Toastify({
    text: `Finished generating ${processedLine} images`,
    duration: 3000,
    backgroundColor: 'linear-gradient(to right, rgb(0, 176, 155), rgb(150, 201, 61))',
  }).showToast()
}

/* ZIP File */

$('.form-blacklist [name="csv-mails"]').change((e) => {
  const fileName = e.target.files[0].name
  $(e.target).next('label').html(fileName)
})

$('.form-blacklist').submit(async function(e) {
  e.preventDefault()
  let mails

  const $csvMails = $(this).find('[name="csv-mails"]')
  const $email = $(this).find('[name="email"]')

  if ($csvMails.length) {
    const csvInput = $csvMails[0]

    const fileString = await loadFileAsText(csvInput.files[0])

    csv = CSVToArray(fileString, ';')

    mails = csv.map(line => line[0])
  } else {
    mails = [$email.val()]
  }

  await saveUnsubscribedEmails(mails)

  emails.push(...mails)

  $email.val('')
  $csvMails.val('')
})

$('.form-blacklist-domains').submit(async function(e) {
  e.preventDefault()

  const domain = $(this).find('[name="domain"]').val()

  await saveUnsubscribedDomains([domain])

  domains.push(domain)
})

$('#inputMadeDate').val('2020-05-28')

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