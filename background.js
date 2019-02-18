'use strict';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-127582009-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

window.onload = async function() {
  let isPopup = getUrlParameter('popup') === 'true';
  if (!isPopup) return;

  const settings = await getSettings();
  const currentColor = settings['color'] || '#F1BC43';
  const currentWidth = settings['width'] || '15px';
  const colorBox = document.getElementById("color-box");
  colorBox.style.backgroundColor = currentColor;

  document.getElementById("color-input").setAttribute('placeholder', currentColor);

  const startHandler = document.getElementById('start-button');
  startHandler.addEventListener('click', saveSettings);

  const slider = document.getElementById("highlight-range");
  slider.value =extractDigits(currentWidth);
  const sample = document.getElementById("highlight-sample");
  sample.style.backgroundColor = currentColor;
  sample.style.height = '1px';
  sample.style.width = currentWidth;
  sample.style.marginBottom = '1em';

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    sample.style.width = `${this.value}px`;
  }

  document.addEventListener('keyup', function (e) {
    if (e.which == 13) {
      saveSettings();
    }
  });
}

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
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

function saveSettings() {
  const validColor = setColor();
  if (validColor) {
    setWidth();
    loadSpinner();
    setTimeout(hideSpinner, 1000);
  } else {
    displayInvalidColor();
  }
}

function setWidth() {
  const slider = document.getElementById("highlight-range");
  const width = `${slider.value}px`;
  chrome.storage.sync.set({ width });
}

function setColor() {
  let newColor = document.getElementById("color-input").value.toLowerCase().replace(/\s/g, '');
  if (!newColor) return false;
  if (/[#-]\W/g.test(newColor)) return false;
  if (newColor[0] === '#') {
    if (newColor.length > 7) return false;
  } else {
    const validColors = {
      'aliceBlue': true,
      'antiqueWhite': true,
      'aqua': true,
      'aquamarine': true,
      'azure': true,
      'beige': true,
      'bisque': true,
      'black': true,
      'blanchedalmond': true,
      'blue': true,
      'blueViolet': true,
      'brown': true,
      'burlyWood': true,
      'cadetblue': true,
      'chartreuse': true,
      'chocolate': true,
      'coral': true,
      'cornflowerblue': true,
      'cornsilk': true,
      'crimson': true,
      'cyan': true,
      'darkblue': true,
      'darkcyan': true,
      'darkgoldenrod': true,
      'darkgray': true,
      'darkgrey': true,
      'darkgreen': true,
      'darkkhaki': true,
      'darkmagenta': true,
      'darkolivegreen': true,
      'darkorange': true,
      'darkorchid': true,
      'darkred': true,
      'darksalmon': true,
      'darkseagreen': true,
      'darkslateblue': true,
      'darkslategray': true,
      'darkslategrey': true,
      'darkturquoise': true,
      'darkviolet': true,
      'deeppink': true,
      'deepskyblue': true,
      'dimgray': true,
      'dimgrey': true,
      'dodgerblue': true,
      'firebrick': true,
      'floralwhite': true,
      'forestgreen': true,
      'fuchsia': true,
      'gainsboro': true,
      'ghostwhite': true,
      'gold': true,
      'goldenrod': true,
      'gray': true,
      'grey': true,
      'green': true,
      'greenyellow': true,
      'honeydew': true,
      'hotpink': true,
      'indianred ': true,
      'indigo ': true,
      'ivory': true,
      'khaki': true,
      'lavender': true,
      'lavenderblush': true,
      'lawngreen': true,
      'lemonchiffon': true,
      'lightblue': true,
      'lightcoral': true,
      'lightcyan': true,
      'lightgoldenrodyellow': true,
      'lightgray': true,
      'lightgrey': true,
      'lightgreen': true,
      'lightpink': true,
      'lightsalmon': true,
      'lightseagreen': true,
      'lightskyblue': true,
      'lightslategray': true,
      'lightslategrey': true,
      'lightsteelblue': true,
      'lightyellow': true,
      'lime': true,
      'limegreen': true,
      'linen': true,
      'magenta': true,
      'maroon': true,
      'mediumaquamarine': true,
      'mediumblue': true,
      'mediumorchid': true,
      'mediumpurple': true,
      'mediumseagreen': true,
      'mediumslateblue': true,
      'mediumspringgreen': true,
      'mediumturquoise': true,
      'mediumvioletred': true,
      'midnightblue': true,
      'mintcream': true,
      'mistyrose': true,
      'moccasin': true,
      'navajowhite': true,
      'navy': true,
      'oldlace': true,
      'olive': true,
      'olivedrab': true,
      'orange': true,
      'orangered': true,
      'orchid': true,
      'palegoldenrod': true,
      'palegreen': true,
      'paleturquoise': true,
      'palevioletred': true,
      'papayawhip': true,
      'peachpuff': true,
      'peru': true,
      'pink': true,
      'plum': true,
      'powderblue': true,
      'purple': true,
      'rebeccapurple': true,
      'red': true,
      'rosybrown': true,
      'royalblue': true,
      'saddlebrown': true,
      'salmon': true,
      'sandybrown': true,
      'seagreen': true,
      'seashell': true,
      'sienna': true,
      'silver': true,
      'skyblue': true,
      'slateblue': true,
      'slategray': true,
      'slategrey': true,
      'snow': true,
      'springgreen': true,
      'steelblue': true,
      'tan': true,
      'teal': true,
      'thistle': true,
      'tomato': true,
      'turquoise': true,
      'violet': true,
      'wheat': true,
      'white': true,
      'whiteSmoke': true,
      'yellow': true,
      'yellowGreen': true,
    };

    if (!validColors[newColor]) {
      // Check whether this is a valid hexadecimal
      const pass = checkHex(newColor);
      if (!pass) return false;

      newColor = `#${newColor}`;
    }
  }
  chrome.storage.sync.set({ color: newColor });
  return true;
}

function checkHex(color) {
  if (color.length > 6 && color.length !== 3 && color.length !== 6) return false;
  if (/[g-z]/g.test(color)) return false;
  return true;
}

function extractDigits(string) {
  let digits = '';
  for (let i = 0; i < string.length; i += 1) {
    if (!isNaN(parseInt(string[i]))) {
      digits += string[i];
    }
  }
  return parseInt(digits);
}

function displayInvalidColor() {
  const colorError = document.getElementById('color-error');
  colorError.style.color = 'red';
  colorError.style.fontSize = '1em';
  colorError.innerHTML = 'Invalid color';
}

function loadSpinner() {
  document.getElementById('start-loader').style.display = 'block';
  document.getElementById('start-text').style.display = 'none';
}

function hideSpinner() {
  document.getElementById('start-loader').style.display = 'none';
  document.getElementById('start-text').style.display = 'block';
  window.close();
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      chrome.tabs.getSelected(null, function(tab) {
        const { url } = tab;
        // Specifically filter out 'google' as that is the most visited website on the internet.
        if (((url[8] === 'g' && url[9] !== 'o') || (url[12] === 'g' && url[13] !== 'o')) && url.includes('github')) {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(tab.id, {
              "file": "content.js"
            }, function() {
              chrome.tabs.sendMessage(tab.id, {});
            });
          });
        }
      });
    }
  })
});
