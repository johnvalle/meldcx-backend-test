$('document').ready(() => {
  const BASE_URL = 'http://localhost:3000/api';
  /**
   * File upload
   * Listens to changes in file input
   */
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
      url: `${BASE_URL}/file/upload`,
      processData: false,
      contentType: false,
      data: new FormData($('#file-upload')[0]),
      success: (data) => {
        prompt("Results:", JSON.stringify(data))
      }
    });
  });

  $('.file-download-button').on('click', () => {
    const publicKey = $('.file-download-input').val();
    $.ajax({
      method: 'GET',
      url: `${BASE_URL}/file/${publicKey}/`,
      success: (response, stats, request) => {
        // console.log(request.getResponseHeader('Content-Type'))
        // const blob = new Blob([response], { type: request.getResponseHeader('Content-Type') });
        // const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = response.file.path;
        a.download = "file.png";
        document.body.appendChild(a);
        a.click();
      }
    })
  });
});