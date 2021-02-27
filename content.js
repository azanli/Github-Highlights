(function() {
  window.onpopstate = exec();
  chrome.extension.onMessage.addListener(exec);
})();

function exec(message) {
  if (message && message.reload) {
    reloadScrollbar();
    return;
  }

  const pathname = document.location.pathname;
  if (isNaN(parseInt(pathname[pathname.length - 1])) &&
    (!pathname.includes('/issues/') || !pathname.includes('/pull/'))) {
    removeScrollbar();
    return;
  }

  createScrollbar();
}

async function createScrollbar() {
  const data = collectDataRegions();
  if (Object.keys(data).length === 0) return;

  const settings = await getSettings();
  const color = settings['color'] || '#F1BC43';
  const width = settings['width'] || '15px';

  if (width === '0px') return;

  const scrollbar = document.createElement("div");
  const body = document.body;
  const html = document.documentElement;
  const scrollHeight = Math.max( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );

  const viewHeight = Math.min( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );

  scrollbar.setAttribute('id', 'scrollbar-unique-id');
  scrollbar.style.backgroundColor = 'transparent';
  scrollbar.style.height = `${viewHeight}px`;
  scrollbar.style.position = 'fixed';
  scrollbar.style.right = 0;
  scrollbar.style.top = 0;
  scrollbar.style.width = width;

  const dataArray = Object.keys(data);
  for (let i = 0; i < dataArray.length; i += 1) {
    const highlight = document.createElement("div");

    const top = (dataArray[i] / scrollHeight) * viewHeight;

    highlight.style.backgroundColor = color;
    highlight.style.height = `${data[dataArray[i]]}px`;
    highlight.style.position = 'absolute';
    highlight.style.top = `${top}px`;
    highlight.style.width = '100%';

    highlight.onclick = () => {
      highlight.style.opacity = 0.8;
      window.scrollTo({top: dataArray[i] - 100, behavior: 'auto'});
      setTimeout(() => highlight.style.opacity = 1, 150);
    }
    
    scrollbar.appendChild(highlight);
  }
    const scrollbarAlreadyExists = document.getElementById('scrollbar-unique-id');
  if (scrollbarAlreadyExists) {
    body.replaceChild(scrollbar, scrollbarAlreadyExists);
  } else {
    body.appendChild(scrollbar);
  }
}

function removeScrollbar() {
  const scrollbarAlreadyExists = document.getElementById('scrollbar-unique-id');
  if (scrollbarAlreadyExists) {
    scrollbarAlreadyExists.parentNode.removeChild(scrollbarAlreadyExists);
  }
}

function getSettings() {
  return new Promise(function(resolve) {
    chrome.storage.sync.get(['color', 'width'], function(result) {
      if (result) {
        resolve(result);
      } else {
        resolve({});
      }
    });
  });
}

function collectDataRegions() {
  const data = {};
  const reactionElements = document.body.getElementsByClassName('reaction-summary-item');
  
  for (let i = 0; i < reactionElements.length; i += 1) {
    const element = reactionElements[i];
    const alias = element.children[0].getAttribute('alias');

    let count = extractDigits(element.innerText);
    if (!count) continue;

    if (alias === 'thumbs down') {
      count -= 2;
    } else if (alias === 'confused') {
      count -= 1;
    } else if (alias === 'eyes') {
      count -= 0.5;
    }

    const top = offset(reactionElements[i]);

    if (data[top]) {
      data[top] += count;
    } else {
      data[top] = count;
    }
  }

  return data;
};


function extractDigits(string) {
  let digits = '';
  for (let i = 0; i < string.length; i += 1) {
    if (!isNaN(parseInt(string[i]))) {
      digits += string[i];
    }
  }
  return parseInt(digits);
}


function offset(el) {
  const rect = el.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return rect.top + scrollTop;
};

async function reloadScrollbar() {
  const settings = await getSettings();
  const color = settings['color'] || '#F1BC43';
  const width = settings['width'] || '15px';
  const scrollbarAlreadyExists = document.getElementById('scrollbar-unique-id');
  if (scrollbarAlreadyExists) {
    scrollbarAlreadyExists.style.width = width;
    const children = scrollbarAlreadyExists.children;
    for (let i = 0; i < children.length; i += 1) {
      children[i].style.backgroundColor = color;
    }
    document.getElementById('scrollbar-unique-id').replaceWith(scrollbarAlreadyExists);
  }
}
