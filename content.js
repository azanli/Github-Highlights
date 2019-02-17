(function() {
  window.onpopstate = exec();
  chrome.extension.onMessage.addListener(exec);
})();

let scrollbarRendered = false;

async function exec() {
  const host = document.location.host;

  if (host === 'github.com' || host.toLowerCase() === 'github') {
    const title = document.title;

    await removeScrollbar();

    if (!title.includes('Issue')) return;

    let color = await getColor();

    const data = collectDataRegions();

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
    scrollbar.style.width = '0.5em';

    const dataArray = Object.keys(data);
    for (let i = 0; i < dataArray.length; i += 1) {
      const highlight = document.createElement("div");

      const top = (dataArray[i] / scrollHeight) * viewHeight;

      highlight.style.backgroundColor = color;
      highlight.style.height = `${data[dataArray[i]]}px`;
      highlight.style.position = 'absolute';
      highlight.style.top = `${top}px`;
      highlight.style.width = '0.5em';
      scrollbar.appendChild(highlight);
    }
    body.appendChild(scrollbar);
    scrollbarRendered = true;
  } else {
    removeScrollbar();
  }
}

function removeScrollbar() {
  return new Promise(function(resolve) {
    if (scrollbarRendered) {
      scrollbarRendered = false;
      const scrollbarAlreadyExists = document.getElementById('scrollbar-unique-id');
      scrollbarAlreadyExists.parentNode.removeChild(scrollbarAlreadyExists);
    }
    resolve();
  });
}

function getColor() {
  return new Promise(function(resolve) {
    chrome.storage.sync.get('color', function(result) {
      if (result['color']) {
        resolve(result['color']);
      } else {
        resolve('#F1BC43');
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

    if (alias === '-1' || alias === 'confused') {
      count -= count * 2;
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