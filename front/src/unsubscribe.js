const sachetUrl = `${backUrl}/sachet`

function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
    }
  }
}

function loadSachet(sachetHash) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${sachetUrl}/unsubscribe/${sachetHash}`,
      type: 'POST',
      success: function(sachet) {
        $('.result-container').html('Email désabonné')
        resolve()
      },
      error: function(error) {
        reject(error)
      },
    })
  })
}

let sachetHash = getUrlParameter('id')

$(window).on('load', async () => {
  if (sachetHash) {
    try {
      await loadSachet(sachetHash)
    } catch (e) {
      console.error(e)
    }
  }
})