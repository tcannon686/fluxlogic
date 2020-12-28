# MML2

Welcome to MML2, a logic circuit editor and simulator developed using React. The
goal of the project is to create a program similar to [MultiMedia Logic
(MML)](https://www.softronix.com/logic.html) using more up to date software.

Current development is focused on emulating some of the core functionality of
MML. A Kanban board with a list of completed and in progress tasks is available
in the projects page of this repository. We are using [Standard
JS](https://standardjs.com/) as our coding style, so if you would like to
contribute please follow this style, or use `yarn lint --fix`.

## Usage

First, you need to start a server for the project somehow. See the Available
Scripts section below for information on how to do that. Once the project is
started, you should open it up in your browser.

### Adding logic gates

Once MML2 is open in your browser, you will see the 'Palette', containing a list
of pictures of logic components, on the left side of the screen. To add a logic
component to the page, simply click on its icon in the palette. The selected
logic gate will be added to the center of the page.

### Moving and deleting logic gates

You can select the logic gates that you placed by clicking and dragging a box
around the components you want to select or by clicking on the components
individually. You can hold the shift key if you want to add to your selection.
To deselect, click on an empty part of the page. When clicking and dragging, the
whole logic gate must be in the selection, otherwise it will not be selected.

Once you've made a selection, you can move all of the components in your
selection by clicking and dragging one of the selected logic gates. In addition,
you can delete your selection by clicking the trash can icon in the app bar.
Remember that you can always undo a deletion by clicking the undo or redo button
in the app bar!

### Copying logic gates

To copy a logic gate, select it, right click anywhere on the page, and click
'copy'. To paste, right click anywhere on the page and click 'paste'. The
copied logic gates will be placed in the exact position that they were copied
in, and will be selected after they are pasted.

### Adding wires

Once a logic component is added, you will see red 'pins' for its inputs and
outputs. The pins are red because they have not been connected to anything. To
connect two pins, click and drag from the first pin to the second pin. You can
connect wires even while you have components selected.
 > Note: you can only connect outputs to inputs, and vice versa

### Moving and deleting wires

When an input pin has a wire added to it, the wire can be deleted or moved by
clicking and dragging the pin. To delete a connection, click on an input pin
that has a wire connected to it, and drag it to an empty space on the page. To
move a connection, click on an input pin that has a wire connected to it, and
drag it to an output pin to connect it. Note that when an input pin has no
connections, clicking and dragging it will add a new connection. In addition,
clicking and dragging an output pin that already has a connection will add a new
connection, not delete the current connection.

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn lint`

Enforces the [standard](https://standardjs.com/) JS style. To fix style issues,
run `yarn lint --fix`

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
