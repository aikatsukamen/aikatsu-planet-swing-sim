import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './components/pages/App';
import configureStore from './store';
import { MuiThemeProvider } from '@material-ui/core';
import { theme } from './theme';
import * as serviceWorker from './serviceWorker';
import { SWUpdateDialog } from './components/organisms/SWUpdateDialog';

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={configureStore()}>
      <App />
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root'),
);

if ((module as any).hot) {
  (module as any).hot.accept();
}

serviceWorker.register({
  onUpdate: (registration) => {
    if (registration.waiting) {
      ReactDOM.render(<SWUpdateDialog registration={registration} />, document.querySelector('.SW-update-dialog'));
    }
  },
});
