import express from 'express';
import expressHandlebars from 'express-handlebars';
import path from 'path';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { JssProvider, SheetsRegistry } from 'react-jss';
import clearModule from 'clear-module';
import { isDev, isProd, usePreRender } from 'dev-toolkit/settings';

const serverPort = process.env.SERVER_PORT || 3000;
const projectDirectory = process.cwd();
const clientFolder = path.resolve(projectDirectory, 'src/client');
const serverViews = path.resolve(projectDirectory, 'src/server/views');
const rootComponentPath = path.resolve(clientFolder, 'RootComponent');

export default new class {
  constructor() {
    this.express = express();

    this.handlebarsInstance = expressHandlebars.create();

    this.express.engine('hbs', this.handlebarsInstance.engine);
    this.express.set('views', serverViews).set('view engine', 'hbs');

    this.express.disable('x-powered-by');
  }

  start({ assets, buildFolder }) {
    this.express.get('/health', (req, res) => res.send('OK'));

    if (!isDev) {
      this.express.use(express.static(buildFolder));
    }

    if (isDev || (isProd && !usePreRender)) {
      this.express.use((req, res) => {
        if (isDev) {
          clearModule.match(new RegExp(`^${clientFolder}`, 'i'));
        }
        import(rootComponentPath).then(module => {
          const RootComponent = module.default;
          const sheets = new SheetsRegistry();
          res.status(200).render('template', {
            assets,
            renderedHtml: renderToString(
              <JssProvider registry={sheets}>
                <RootComponent />
              </JssProvider>
            ),
            sheets: sheets ? sheets.toString() : '',
          });
        });
      });
    }

    this.serverInstance = this.express.listen(serverPort, () => {
      // eslint-disable-next-line
      console.log(`Server is listening on port ${serverPort}`);
    });
  }

  stop() {
    this.serverInstance.close();
  }

  preRender({ assets, buildFolder }) {
    return new Promise((resolve, reject) => {
      import(rootComponentPath).then(module => {
        const RootComponent = module.default;
        const sheets = new SheetsRegistry();
        this.handlebarsInstance
          .render(path.join(serverViews, 'template.hbs'), {
            assets,
            renderedHtml: renderToString(
              <JssProvider registry={sheets}>
                <RootComponent />
              </JssProvider>
            ),
            sheets: sheets ? sheets.toString() : '',
          })
          .then(html => {
            fs.writeFile(
              path.join(buildFolder, 'index.html'),
              html,
              error => (error ? reject(error) : resolve())
            );
          });
      });
    });
  }
}();
