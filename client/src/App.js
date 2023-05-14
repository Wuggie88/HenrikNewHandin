import TextEditor from  './TextEditor'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import {v4 as uuidV4} from 'uuid'


function App() {
  //setup of the app, using Routes and switches, the exact route is for when nothing is behind the "/" in the URL and the other path is for when it has an ID
  return <Router>
    <Switch>
      <Route path="/" exact>
        <Redirect to={`/documents/${uuidV4()}`} />
      </Route>
      <Route path="/documents/:id">
        <TextEditor />
      </Route>
    </Switch>
    </Router>
}

export default App;
