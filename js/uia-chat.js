/* UiA Assistenten: chatboble (Copilot Studio via Microsoft Web Chat). Stil ligger i css/uia-chat.css */
(function(){
  if (document.getElementById('uia-chat-root')) return;

  var TOKEN_URL = 'https://default8482881e36994b3fb135cf4800bc1e.fb.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cra87_uiAAssistenten/directline/token?api-version=2022-03-01-preview';
  var DIRECTLINE_URL = 'https://europe.directline.botframework.com/v3/directline'; // agentens region
  var WEBCHAT_JS = 'https://cdn.jsdelivr.net/npm/botframework-webchat@4.19.1/dist/webchat.js';
  var RED = '#c8102e';

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/uia-chat.css', document.currentScript.src).href;
  document.head.appendChild(link);

  var root = document.createElement('div');
  root.id = 'uia-chat-root';
  root.innerHTML =
      '<div class="uia-chat-window" id="uia-chat-window" role="dialog" aria-labelledby="uia-chat-title" hidden>'
    +   '<div class="uia-chat-header">'
    +     '<h2 class="uia-chat-title" id="uia-chat-title">UiA Assistenten (testversjon)</h2>'
    +     '<button type="button" class="uia-chat-close" aria-label="Lukk chat">&#x2715;</button>'
    +   '</div>'
    +   '<div class="uia-chat-body"></div>'
    + '</div>'
    + '<button type="button" class="uia-chat-toggle" aria-label="Åpne chat med UiA Assistenten" aria-expanded="false" aria-controls="uia-chat-window">'
    +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    +     '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
    +   '</svg>'
    + '</button>';
  document.body.appendChild(root);

  var win = root.querySelector('.uia-chat-window');
  var body = root.querySelector('.uia-chat-body');
  var toggle = root.querySelector('.uia-chat-toggle');
  var closeBtn = root.querySelector('.uia-chat-close');
  var started = false;

  var styleOptions = {
    primaryFont: '"Inter", -apple-system, sans-serif',
    accent: RED,
    subtle: '#8b857e',
    bubbleBackground: '#f1eae0',
    bubbleTextColor: '#1c1b1a',
    bubbleBorderWidth: 0,
    bubbleBorderRadius: 12,
    bubbleFromUserBackground: '#ffffff',
    bubbleFromUserTextColor: '#1c1b1a',
    bubbleFromUserBorderColor: '#e2d9cb',
    bubbleFromUserBorderWidth: 1,
    bubbleFromUserBorderRadius: 12,
    botAvatarInitials: 'UiA',
    botAvatarBackgroundColor: RED,
    hideUploadButton: true,
    sendBoxHeight: 60,
    sendBoxMaxHeight: 160,
    sendBoxTextWrap: true,
    sendBoxTextColor: '#1c1b1a',
    sendBoxPlaceholderColor: '#8b857e',
    sendBoxButtonColor: RED,
    sendBoxButtonColorOnHover: '#8f0b21',
    sendBoxBorderTop: 'solid 1px #e2d9cb'
  };

  function setStatus(text){
    body.innerHTML = '<p class="uia-chat-status"></p>';
    body.firstChild.textContent = text;
  }

  function loadWebChat(){
    return new Promise(function(resolve, reject){
      if (window.WebChat) return resolve();
      var s = document.createElement('script');
      s.src = WEBCHAT_JS;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function startChat(){
    setStatus('Kobler til …');

    var token = fetch(TOKEN_URL).then(function(r){
      if (!r.ok) throw new Error('Token: HTTP ' + r.status);
      return r.json();
    });

    Promise.all([token, loadWebChat()]).then(function(res){
      // Copilot Studio sender velkomstmeldingen først når den får startConversation
      var store = window.WebChat.createStore({}, function(api){
        return function(next){
          return function(action){
            if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED'){
              api.dispatch({
                type: 'DIRECT_LINE/POST_ACTIVITY',
                meta: { method: 'keyboard' }, // Web Chat krever meta på POST_ACTIVITY
                payload: { activity: { type: 'event', name: 'startConversation', channelData: { postBack: true } } }
              });
            }
            return next(action);
          };
        };
      });

      body.innerHTML = '<div class="uia-chat-webchat"></div>';
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: res[0].token, domain: DIRECTLINE_URL }),
        store: store,
        styleOptions: styleOptions
      }, body.firstChild);
    }).catch(function(err){
      console.warn('UiA Assistenten:', err);
      setStatus('Klarte ikke å koble til chatten. Prøv igjen senere.');
      started = false; // nytt forsøk neste gang boblen åpnes
    });
  }

  function setOpen(open){
    // Chatten lastes først ved første åpning, så siden ikke blir tregere
    if (open && !started){ started = true; startChat(); }
    win.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? 'Lukk' : 'Åpne') + ' chat med UiA Assistenten');
    if (open) closeBtn.focus();
  }

  function close(){ setOpen(false); toggle.focus(); }

  toggle.addEventListener('click', function(){ setOpen(win.hidden); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !win.hidden) close();
  });
})();
