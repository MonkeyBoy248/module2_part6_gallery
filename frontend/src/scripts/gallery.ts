import { CustomEventListener, ListenerRemover } from "../modules/custom_event_listener.js";
import { Token } from "../modules/token_management.js";
import { PicturesUploadError, InvalidPageError, TokenError } from "../modules/errors.js";
import { GalleryData } from "../modules/interfaces.js";
import * as env from "../modules/environment_variables.js";

const galleryPhotos = document.querySelector('.gallery__photos') as HTMLElement;
const galleryInner = document.querySelector('.gallery__inner') as HTMLElement;
const headerFilesContainer = document.querySelector('.header__files-container') as HTMLElement;
const galleryTemplate = document.querySelector('.gallery__template') as HTMLTemplateElement;
const pagesLinksList = document.querySelector('.gallery__links-list') as HTMLElement;
const galleryErrorMessage = document.querySelector('.gallery__error-message') as HTMLElement;
const galleryErrorContainer = document.querySelector('.gallery__error') as HTMLElement;
const galleryPopup = document.querySelector('.gallery__error-pop-up') as HTMLElement;
const galleryLinkTemplate = document.querySelector('.gallery__link-template') as HTMLTemplateElement;
const galleryUploadForm = document.querySelector('.header__upload-form') as HTMLFormElement;
const galleryUploadLabel = galleryUploadForm.querySelector('.header__upload-label') as HTMLElement;
const galleryUploadInput = galleryUploadForm.querySelector('.header__upload-input') as HTMLInputElement;
const headerLimitInput = document.querySelector('.header__limit-input') as HTMLInputElement;
const setLimitButton = document.querySelector('.header__set-limit-button') as HTMLButtonElement;
const filterCheckbox = document.querySelector('.header__filter-checkbox') as HTMLInputElement;
const galleryEventsArray: CustomEventListener[] = [
  {target: document, type: 'DOMContentLoaded', handler: setCurrentPageUrl},
  {target: pagesLinksList, type: 'click', handler: changeCurrentPage},
  {target: galleryErrorContainer, type: 'click', handler: redirectToTheTargetPage},
  {target: galleryUploadForm, type: 'submit', handler: uploadUserFile},
  {target: galleryUploadInput, type: 'change', handler: showSelectedFilePath},
  {target: setLimitButton, type: 'click', handler: setLimit},
  {target: filterCheckbox, type: 'change', handler: addFilterValueToURL}
]

checkTokenValidity();

async function getPicturesData (): Promise<void>{
  const url = setCurrentPageUrl();
  const tokenObject = Token.getToken();
  const tokenProperty = tokenObject?.token;

  if (tokenObject) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenProperty}`,
        },
      })

      console.log(response.status);

      if (response.status === 403) {
        throw new TokenError();
      }


      if (response.status === 404) {
        throw new InvalidPageError();
      }

      const data: GalleryData = await response.json();

      if (data.objects.length === 0) {
        const noPicturesMessage = document.createElement('p');
        noPicturesMessage.className = 'gallery__empty-message';
        noPicturesMessage.textContent = 'No pictures uploaded';

        galleryInner.append(noPicturesMessage);
      }

      createPictureTemplate(data);
      createLinksTemplate(data.total);
      setPageNumber();
      setLimitPlaceholder();
      setCurrentCheckboxValue();
    } catch (err){
        if (err instanceof InvalidPageError) {
          const nonexistentPageNumber = new URL(url).searchParams.get('page');

          createErrorMessageTemplate(
            `There is no page with number ${nonexistentPageNumber}.`, 
            'wrong-page-number',
            'page 1'
          )
        } else {
          createErrorMessageTemplate(
            'Invalid token. Please, log in',
            'invalid-token',
            'authentication page');
        }

        console.log(err);
    }
  }
}

function validateFileType (file: File) {
  const fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  return fileTypes.includes(file.type);
}

async function sendUserPicture () {
  const url = env.galleryServerUrl;
  const tokenObject = Token.getToken();
  const tokenProperty = tokenObject?.token;
  const data = new FormData();

  const file = galleryUploadInput.files![0];

  if (!validateFileType(file)) {
    return false;
  }

  data.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenProperty}`
      },
      body: data
    })


    const responseStatus = response.status;

    if (responseStatus === 500) {
      throw new PicturesUploadError();
    }

    await getPicturesData();
  } catch (err) {
    console.log('Failed');
  }
}

function checkTokenValidity () {
  setInterval(() => {
    Token.deleteToken();
  }, 1000);

  redirectWhenTokenExpires(5000);
}

function redirectToTheTargetPage (e: Event) {
  e.preventDefault();
  const target = e.target as HTMLElement;
  const pageNumber = env.currentUrl.searchParams.get('page') || '1';
  const limit = env.currentUrl.searchParams.get('limit') || '4';
  const filter = env.currentUrl.searchParams.get('filter') || 'false';


  ListenerRemover.removeEventListeners(galleryEventsArray);

  if (target.getAttribute('error-type') === 'wrong-page-number') {
    window.location.replace(
      `gallery.html?page=1&limit=${limit}&filter=${filter}`
    )
    return;
  }

    window.location.replace(
      `index.html?currentPage=${pageNumber}&limit=${limit}&filter=${filter}`
    );
}

function createPictureTemplate (pictures: GalleryData): void {
  galleryPhotos.innerHTML = ''

  for (let object of pictures.objects) {
    const picture = galleryTemplate.content.cloneNode(true) as HTMLElement;
    const imageWrapper = picture.children[0];
    const image = imageWrapper.querySelector('.gallery__img') as HTMLElement;
    
    image.setAttribute('src', `http://localhost:8000/api_images/${object.path}`);
    galleryPhotos.insertAdjacentElement('beforeend', imageWrapper);
  }
}

function createLinksTemplate (total: number): void {
  pagesLinksList.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const linkWrapper = galleryLinkTemplate.content.cloneNode(true) as HTMLElement;
    const listItem = linkWrapper.children[0] as HTMLElement;
    const link = listItem.querySelector('a');
    
    if (link) {
      link.textContent = `${i + 1}`;
      pagesLinksList.append(listItem);
      pagesLinksList.children[0].classList.add('active');
    }
  }
}

function createErrorMessageTemplate (message: string, errType: string, targetPage: string) {
  const galleryErrorRedirectLink = document.createElement('a');

  galleryErrorRedirectLink.href = '';
  galleryErrorRedirectLink.className = 'gallery__error-redirect-link';
  galleryErrorRedirectLink.textContent = `Go back to the ${targetPage}`;
  galleryErrorRedirectLink.setAttribute('error-type', errType);

  galleryErrorContainer.append(galleryErrorRedirectLink);

  showMessage(message);
}

async function uploadUserFile (e: Event) {
  e.preventDefault();
  const selectedFiles = galleryUploadInput.files;

  if (selectedFiles!.length === 0) {
    galleryUploadLabel.textContent = 'No file selected';
    return false;
  }

  await sendUserPicture();

  headerFilesContainer.innerHTML = '';
}

function showSelectedFilePath () {
  const selectedFiles = galleryUploadInput.files;

  if (selectedFiles) {
    galleryUploadLabel.textContent = 'Select a file';

    const file = galleryUploadInput.files![0];

      if (validateFileType(file)) {
        headerFilesContainer.innerHTML = '';

        const listItem = document.createElement('div') as HTMLElement;
        listItem.className = 'header__list-item';
        listItem.textContent = file.name;

        headerFilesContainer.append(listItem);
      }
  }
}

function setNewUrl (): void {
  const pageNumber = env.currentUrl.searchParams.get('page') || '1';
  const limit = env.currentUrl.searchParams.get('limit') || '4';
  const filter = env.currentUrl.searchParams.get('filter') || 'false';

  window.location.href = `${env.protocol}://${env.hostName}:${env.port}/${env.galleryUrl}?page=${pageNumber}&limit=${limit}&filter=${filter}`;
}

function showMessage (text: string): void {
  galleryPopup.classList.add('show');
  galleryErrorMessage.textContent = '';
  galleryErrorMessage.textContent = text;
}

function updateMessageBeforeRedirection (timer: number): void {
  setInterval(() => {
    --timer;
    showMessage(`Token validity time is expired. You will be redirected to authorization page in ${timer} seconds`);
  }, 1000);
}

function redirectWhenTokenExpires (delay: number): void {
  const limit = env.currentUrl.searchParams.get('limit') || '4';
  const pageNumber = env.currentUrl.searchParams.get('page') || '1';
  const filter = env.currentUrl.searchParams.get('filter') || 'false';

  if (!Token.getToken()) {
    ListenerRemover.removeEventListeners(galleryEventsArray);
    updateMessageBeforeRedirection(delay / 1000);
    setTimeout(() => {
      window.location.replace(
        `${env.loginUrl}?currentPage=${pageNumber}&limit=${limit}&filter=${filter}`
      );
    }, delay)
  }
}

function setPageNumber () {
  const pageNumber = env.currentUrl.searchParams.get('page');
  const currentActiveLink = pagesLinksList.querySelector('.active');
  
  for (let item of pagesLinksList.children) {
    const link = item.querySelector('a');
    
    if (link?.textContent) {
      item.setAttribute('page-number', link.textContent);
    }
    
    if (item.getAttribute('page-number') === pageNumber) {
      currentActiveLink?.classList.remove('active');
      item.classList.add('active');
    }
  }
}

function setLimit () {
  const currentLimitValue = headerLimitInput.value;

 isNaN(Number(currentLimitValue)) ?
   env.currentUrl.searchParams.set('limit', '4')
   :
   env.currentUrl.searchParams.set('limit', currentLimitValue);

  setNewUrl();
}

function setLimitPlaceholder () {
  const lastLimitValue = env.currentUrl.searchParams.get('limit');
  const placeholderTemplate = `Current limit value:`;
  headerLimitInput.placeholder = isNaN(Number(lastLimitValue)) ?
    `${placeholderTemplate} 4`
    :
    `${placeholderTemplate} ${lastLimitValue}`
}

function setCurrentPageUrl (): string {
  const limit = env.currentUrl.searchParams.get('limit') || '4';
  const pageNumber = env.currentUrl.searchParams.get('page') || '1';
  const filter = env.currentUrl.searchParams.get('filter') || 'false';

  return `${env.galleryServerUrl}?page=${pageNumber}&limit=${limit}&filter=${filter}`;
}

async function changeCurrentPage (e: Event): Promise<void> {
  const currentActiveLink = pagesLinksList.querySelector('.active');
  const target = e.target as HTMLElement;
  const targetClosestLi = target.closest('li');

  e.preventDefault();

  if (target !== pagesLinksList ) {
    if (currentActiveLink !== targetClosestLi) {
      env.currentUrl.searchParams.set('page', targetClosestLi?.getAttribute('page-number')!)
      setNewUrl();
      await getPicturesData();
      
      currentActiveLink?.classList.remove('active');
      target.classList.add('active');
    }
  }
}

function addFilterValueToURL () {
  const filterValue = filterCheckbox.checked;

  env.currentUrl.searchParams.set('filter', `${filterValue}`);
  setNewUrl();
}

function setCurrentCheckboxValue () {
  filterCheckbox.checked = env.currentUrl.searchParams.get('filter') !== 'false';
}

document.addEventListener('DOMContentLoaded', getPicturesData);
pagesLinksList.addEventListener('click', changeCurrentPage);
galleryErrorContainer.addEventListener('click', redirectToTheTargetPage);
galleryUploadForm.addEventListener('submit', uploadUserFile);
galleryUploadInput.addEventListener('change', showSelectedFilePath);
setLimitButton.addEventListener('click', setLimit);
filterCheckbox.addEventListener('change', addFilterValueToURL);







