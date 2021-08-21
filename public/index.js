$('document').ready(() => {
  const BASE_URL = 'http://localhost:3000/api';
  $('#fileInput').on('change', ({ target: { files } }) => {
    if (files.length) {
      const file = files[0];
      const { name } = file;
      // replace span text to file name
      $('.file-name').text(name);
      // enable button when there is a file selected
      $('.file-upload-button').removeClass('is-hidden');
    } else {
      // reset span text and hide button
      $('.file-name').text('No file selected.');
      $('.file-upload-button').addClass('is-hidden');
    }
  });

  $('#file-upload').on('submit', (e) => {
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: `${BASE_URL}/file/`,
      processData: false,
      contentType: false,
      data: new FormData($('#file-upload')[0]),
      success: (data) => {
        prompt("Results:", JSON.stringify(data))
      },
      error: (response) => {
        alert(response.responseJSON.message);
      }
    });
  });

  $('.file-download-input').on('change', (e) => {
    if (e.target.value && e.target.value !== "") {
      $('.file-download-button').removeClass('is-hidden');
    } else {
      $('.file-download-button').addClass('is-hidden');
    }
  });

  $('.file-download-button').on('click', () => {
    const publicKey = $('.file-download-input').val();
    $.ajax({
      method: 'GET',
      url: `${BASE_URL}/file/${publicKey}/`,
      success: (response) => {
        // console.log(request.getResponseHeader('Content-Type'))
        // const blob = new Blob([response], { type: request.getResponseHeader('Content-Type') });
        // const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = response.path;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
      },
      error: (response) => {
        alert(response.responseJSON.message);
      }
    })
  });

  $('.file-remove-input').on('change', (e) => {
    if (e.target.value && e.target.value !== "") {
      $('.file-remove-button').removeClass('is-hidden');
    } else {
      $('.file-remove-button').addClass('is-hidden');
    }
  });

  $('.file-remove-button').on('click', () => {
    const privateKey = $('.file-remove-input').val();
    $.ajax({
      method: 'DELETE',
      url: `${BASE_URL}/file/${privateKey}/`,
      success: (response) => {
        alert(response.message);
      },
      error: (response) => {
        alert(response.responseJSON.message);
      }
    })
  });
});