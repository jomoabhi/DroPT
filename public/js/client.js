const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('#fileInput');
const browseBtn = document.querySelector('#browseBtn');

const bgProgress = document.querySelector('.bg-progress');
const progressPercent = document.querySelector('#progressPercent');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.querySelector('.progress-bar');
const status = document.querySelector('.status');

const sharingContainer = document.querySelector('.sharing-container');
const copyURLBtn = document.querySelector('#copyURLBtn');
const fileURL = document.querySelector('#fileURL');
const emailForm = document.querySelector('#emailForm');
const whatsAppForm = document.querySelector('#WhatsappForm');
const whatsAppButton = document.getElementById('whatsBtn');
const emailAppButton = document.getElementById('emailBtn');

const toast = document.querySelector('.toast');

const body = document.querySelector('.body');
const whatsContainer = document.querySelector('#Whatsapp');
const emailContainer = document.querySelector('#Email');
const baseURL = 'http://localhost:3000';
// const uploadURL = `${baseURL}/api/files`;
const uploadURL = `/api/files`;
// const emailURL = `${baseURL}/api/files/send`;
const emailURL = `/api/files/send`;
const whatsAppURL = `/api/files/sendWhatsapp`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb

browseBtn.addEventListener('click', () => {
  fileInput.click();
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  //   console.log("dropped", e.dataTransfer.files[0].name);
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast('Max file size is 100MB');
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove('dragged');
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragged');

  // console.log("dropping file");
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('dragged');

  console.log('drag ended');
});

// file input change and uploader
fileInput.addEventListener('change', () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast('Max file size is 100MB');
    fileInput.value = ''; // reset the input
    return;
  }
  uploadFile();
});

// sharing container listenrs
copyURLBtn.addEventListener('click', () => {
  fileURL.select();
  document.execCommand('copy');
  showToast('Copied to clipboard');
});

fileURL.addEventListener('click', () => {
  fileURL.select();
});

const uploadFile = () => {
  console.log('file added uploading');

  files = fileInput.files;
  const formData = new FormData();
  formData.append('myfile', files[0]);

  //show the uploader
  progressContainer.style.display = 'block';

  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ''; // reset the input
  };

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
    }
  };

  xhr.open('POST', uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  fileInput.value = ''; // reset the input
  status.innerText = 'Uploaded';

  // remove the disabled attribute from form btn & make text send
  emailForm[2].removeAttribute('disabled');
  emailForm[2].innerText = 'Send';
  progressContainer.style.display = 'none'; // hide the box

  const { downloadLink: url } = JSON.parse(res);
  console.log(url);
  sharingContainer.style.display = 'block';
  // whatsContainer.style.display = 'none';
  // emailContainer.style.display = 'none';
  whatsContainer.classList.add('dis');
  emailContainer.classList.add('dis');

  body.style.height = '105vh';

  fileURL.value = url;
};

emailForm.addEventListener('submit', (e) => {
  e.preventDefault(); // stop submission

  // disable the button
  emailForm[2].setAttribute('disabled', 'true');
  emailForm[2].innerText = 'Sending';

  const url = fileURL.value;

  const formData = {
    uuid: url.split('/').splice(-1, 1)[0],
    emailTo: emailForm.elements['to-email'].value,
    emailFrom: emailForm.elements['from-email'].value,
  };
  console.log(formData);
  fetch(emailURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        emailForm[2].innerText = 'Send';
        emailForm[2].removeAttribute('disabled');
        showToast('Email Sent');

        // sharingContainer.style.display = 'none'; // hide the box
      }
      if (data.error) {
        emailForm[2].innerText = 'Send';
        emailForm[2].removeAttribute('disabled');
        showToast(data.error);
      }
    });
});
whatsAppForm.addEventListener('submit', (e) => {
  e.preventDefault(); // stop submission
  console.log('whats');
  // disable the button
  whatsAppForm[2].setAttribute('disabled', 'true');
  whatsAppForm[2].innerText = 'Sending';

  const url = fileURL.value;

  const formData = {
    uuid: url.split('/').splice(-1, 1)[0],
    to: whatsAppForm.elements['to-number'].value,
    senderName: whatsAppForm.elements['from-name'].value,
  };
  console.log(formData);
  fetch(whatsAppURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        whatsAppForm[2].innerText = 'Send';
        whatsAppForm[2].removeAttribute('disabled');
        // whatsAppForm[2].setAttribute('disabled', 'false');
        showToast('WhatsApp Message Sent');
        // sharingContainer.style.display = 'none'; // hide the box
      }
      if (data.error) {
        whatsAppForm[2].innerText = 'Send';
        whatsAppForm[2].removeAttribute('disabled');
        // whatsAppForm[2].setAttribute('disabled', 'false');
        showToast(data.error);
      }
    });
});

whatsAppButton.addEventListener('click', (e) => {
  console.log('clickedwh');
  emailContainer.classList.add('dis');
  whatsContainer.classList.remove('dis');
});

emailAppButton.addEventListener('click', (e) => {
  console.log('clickedem');
  whatsContainer.classList.add('dis');
  emailContainer.classList.remove('dis');
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add('show');
  // toast.classList.add('toast');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
};
