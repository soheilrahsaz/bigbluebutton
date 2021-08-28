import React, { Component } from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import './styles.css';


// currently supported locales.
// import ar from 'react-intl/locale-data/ar';
// import bg from 'react-intl/locale-data/bg';
// import cs from 'react-intl/locale-data/cs';
// import de from 'react-intl/locale-data/de';
// import el from 'react-intl/locale-data/el';
// import en from 'react-intl/locale-data/en';
// import es from 'react-intl/locale-data/es';
// import eu from 'react-intl/locale-data/eu';
// import fa from 'react-intl/locale-data/fa';
// import fi from 'react-intl/locale-data/fi';
// import fr from 'react-intl/locale-data/fr';
// import he from 'react-intl/locale-data/he';
// import hi from 'react-intl/locale-data/hi';
// import hu from 'react-intl/locale-data/hu';
// import id from 'react-intl/locale-data/id';
// import it from 'react-intl/locale-data/it';
// import ja from 'react-intl/locale-data/ja';
// import km from 'react-intl/locale-data/km';
// import pl from 'react-intl/locale-data/pl';
// import pt from 'react-intl/locale-data/pt';
// import ru from 'react-intl/locale-data/ru';
// import sv from 'react-intl/locale-data/sv';
// import tr from 'react-intl/locale-data/tr';
// import uk from 'react-intl/locale-data/uk';
// import vi from 'react-intl/locale-data/vi';
// import zh from 'react-intl/locale-data/zh';

// // This class is the only component loaded on legacy (unsupported) browsers.
// // What is included here needs to be minimal and carefully considered because some
// // things can't be polyfilled.

// addLocaleData([
//   ...ar,
//   ...bg,
//   ...cs,
//   ...de,
//   ...el,
//   ...en,
//   ...es,
//   ...eu,
//   ...fa,
//   ...fi,
//   ...fr,
//   ...he,
//   ...hi,
//   ...hu,
//   ...id,
//   ...it,
//   ...ja,
//   ...km,
//   ...pl,
//   ...pt,
//   ...ru,
//   ...sv,
//   ...tr,
//   ...uk,
//   ...vi,
//   ...zh,
// ]);

const FETCHING = 'fetching';
const FALLBACK = 'fallback';
const READY = 'ready';
const supportedBrowsers = ['Chrome', 'Firefox', 'Safari', 'Opera', 'Microsoft Edge', 'Yandex Browser'];
const DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.fallbackLocale;

export default class Legacy extends Component {
  constructor(props) {
    super(props);

    const locale = 'fa';
	/* navigator.languages ? navigator.languages[0] : false
      || navigator.language*/

    const url = `./locale?locale=${locale}`;
    const localesPath = 'locales';

    const that = this;
    this.state = { viewState: FETCHING };
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }

        return response.json();
      })
      .then(({ normalizedLocale, regionDefaultLocale }) => {
        fetch(`${localesPath}/${DEFAULT_LANGUAGE}.json`)
          .then((response) => {
            if (!response.ok) {
              return Promise.reject();
            }
            return response.json();
          })
          .then((messages) => {
            if (regionDefaultLocale !== '') {
              fetch(`${localesPath}/${regionDefaultLocale}.json`)
                .then((response) => {
                  if (!response.ok) {
                    return Promise.resolve();
                  }
                  return response.json();
                })
                .then((regionDefaultMessages) => {
                  messages = Object.assign(messages, regionDefaultMessages);
                  this.setState({ messages});
                });
            }

            if (normalizedLocale && normalizedLocale !== DEFAULT_LANGUAGE && normalizedLocale !== regionDefaultLocale) {
              fetch(`${localesPath}/${normalizedLocale}.json`)
                .then((response) => {
                  if (!response.ok) {
                    return Promise.reject();
                  }
                  return response.json();
                })
                .then((localeMessages) => {
                  messages = Object.assign(messages, localeMessages);
                  this.setState({ messages});
                })
                .catch(() => {
                  normalizedLocale = (regionDefaultLocale) || DEFAULT_LANGUAGE;
                  const dasherizedLocale = normalizedLocale.replace('_', '-');
                  this.setState({ messages, normalizedLocale: dasherizedLocale, viewState: READY });
                });
            }
            return messages;
          })
          .then((messages) => {
            const dasherizedLocale = normalizedLocale.replace('_', '-');
            this.setState({ messages, normalizedLocale: dasherizedLocale, viewState: READY });
          })
          .catch(() => {
            that.setState({ viewState: FALLBACK });
          });
      })
      .catch(() => {
        that.setState({ viewState: FALLBACK });
      });
  }

  render() {
    const { browserName, isSafari } = browserInfo;
    const { isIos } = deviceInfo;

    const { messages, normalizedLocale, viewState } = this.state;
    const isSupportedBrowser = supportedBrowsers.includes(browserName);
    const isUnsupportedIos = isIos && !isSafari;

    let messageId = isSupportedBrowser ? 'app.legacy.upgradeBrowser' : 'app.legacy.unsupportedBrowser';
    if (isUnsupportedIos) messageId = 'app.legacy.criosBrowser';

    switch (viewState) {
      case READY:
        return (
          <IntlProvider locale={normalizedLocale} messages={messages}>
            <p className="browserWarning">
              <FormattedMessage
                id={messageId}
                description="Warning when someone joins with a browser that isnt supported"
                values={{
                  0: browser().name + ' ' +browser().versionNumber,
                  1: <a href="https://www.google.com/chrome/">Chrome</a>,
                  2: <a href="https://getfirefox.com">Firefox</a>,
				  3: <a href="https://hamkelasi.co/help/مرورگرهای_پشتیبانی_شده_کلاس_آنلاین" target="_blank">لیست مرورگرهای قابل استفاده برای کلاس آنلاین</a>
                }}
              />
            </p>
          </IntlProvider>
        );
      case FALLBACK:
        return (
          <p className="browserWarning">
            {isUnsupportedIos ? (
              <span>در iOS برای پشتیبانی کامل لطفا از سافاری استفاده کنید.</span>
            ) : (
              <span>
                <span>
                 				  به نظر میرسد شما از مرورگر  {browser().name + ' ' +browser().versionNumber} استفاده میکنید که پشتیبانی نمیشود.
				  لطفا برای پشتیبانی کامل از آخرین نسخه <a href="https://www.google.com/chrome/">گوگل کروم</a> یا <a href="https://getfirefox.com">موزیلا فایرفاکس</a> استفاده کنید

                </span>
                
              </span>
            )
            }
          </p>
        );
      case FETCHING:
      default:
        return null;
    }
  }
}
