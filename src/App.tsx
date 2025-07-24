
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import { Login } from './Pages/Login'
//import  Horario  from './Pages/Horario'
import { Setup } from './Pages/Setup'
import { Register } from './Pages/Register'
import { Config } from './Pages/Config'
import  Prediccion  from './Pages/Prediccion'
import Hacedor from './Pages/Hacedor'

function App() {

  return (
    <div style={{ overflowX: 'hidden', width: '100vw' }}>

    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/Prediccion' element={<Prediccion/>}/>
        <Route path='/Setup' element={<Setup/>}/>
        <Route path='/Register' element={<Register/>}/>
        <Route path='/Config' element={<Config/>}/>
        <Route path='/Hacedor' element={<Hacedor/>}/>
      </Routes>
    </Router>
    </div>
  )
}

export default App
