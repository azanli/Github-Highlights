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
  for (const [offset, height] of Object.entries(data)) {
    if (height <= 0) {
      continue;
    }

    const highlight = document.createElement("div");

    const top = (offset / scrollHeight) * viewHeight;

    highlight.style.backgroundColor = color;
    highlight.style.height = `${height}px`;
    highlight.style.position = 'absolute';
    highlight.style.top = `${top}px`;
    highlight.style.width = '100%';
    highlight.style.zIndex = Infinity;

    highlight.style.borderWidth = '2px';
    highlight.style.borderColor = 'transparent';

    highlight.onclick = () => {
      highlight.style.opacity = 0.8;
      window.scrollTo({top: offset - 100, behavior: 'auto'});
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

function getOffset(el) {
  const rect = el.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return rect.top + scrollTop;
};

function collectDataRegions() {
  const data = {};
  const commentReactions = Array.from(document.getElementsByClassName('js-comment-reactions-options'))
    .filter((comment) => comment.getElementsByTagName('g-emoji').length)
    .map((commentWithReactions) => {
      const offset = getOffset(commentWithReactions);

      return Array.from(commentWithReactions.getElementsByClassName('social-reaction-summary-item'))
        .map((commentReactionSummaryItem) => {
          return {
            alias: commentReactionSummaryItem.getElementsByClassName('social-button-emoji')[0].getAttribute('alias'),
            count: parseInt(
              commentReactionSummaryItem.getElementsByClassName('js-discussion-reaction-group-count')[0].textContent
            ),
            offset,
          }
        });
    });
  
  for (const reactions of commentReactions) {
    let score = 0;

    for (const {alias, count, offset} of reactions) {
      if (alias === '-1') {
        score -= 1.5 * count;
      } else if (alias === 'thinking_face') {
        score -= 1 * count;
      } else if (alias === 'eyes') {
        score -= 0.5 * count;
      } else {
        score += 1 * count;
      }

      if (data[offset]) {
        data[offset] += score;
      } else {
        data[offset] = score;
      }
    }
  }

  return data;
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
